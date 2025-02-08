import os
from werkzeug.utils import secure_filename
from bson import ObjectId
from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from datetime import datetime
from flask_cors import CORS
from API_Service.AI_PDF import summarize_pdf
from flask_limiter import Limiter
import logging
import tensorflow as tf

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppresses INFO and WARNING logs from TensorFlow
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disables oneDNN custom operations
logging.getLogger('tensorflow').setLevel(logging.ERROR)
# Ensure the folder for saving uploaded files exists
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# Initialize Flask app
app = Flask(__name__)

# App Configurations
app.config['MONGO_DBNAME'] = 'pommodorro'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/pommodorro'
app.secret_key = 'your_secret_key'  # Replace with your actual secret key
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
tasks_collection = mongo.db.tasks
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def home():
    return render_template('Base.html')



# User Routes (Login, Signup, Tasks Management)
@app.route('/Login_signup', methods=['GET', 'POST'])
def login_signup():
    if request.method == 'POST':
        if request.form['submit_type'] == 'login':
            users = mongo.db.users
            login_user = users.find_one({'username': request.form['username']})
            if login_user:
                if bcrypt.check_password_hash(login_user['password'], request.form['password']):
                    session['username'] = request.form['username']
                    return redirect(url_for('dashboard'))
                else:
                    flash('Incorrect password', 'danger')
            else:
                flash('Username does not exist', 'danger')
        elif request.form['submit_type'] == 'signup':
            users = mongo.db.users
            existing_user = users.find_one({'username': request.form['username']})
            if existing_user is None:
                hashpass = bcrypt.generate_password_hash(request.form['password']).decode('utf-8')
                users.insert_one({'username': request.form['username'], 'password': hashpass})
                session['username'] = request.form['username']
                return redirect(url_for('dashboard'))
            else:
                flash('Username already exists', 'danger')
    return render_template('Login_signup.html')

@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return render_template('dashboard.html', username=session['username'])
    flash('You need to login first!', 'warning')
    return redirect(url_for('Login_signup'))

@app.route('/create_tasks', methods=['GET', 'POST'])
def create_tasks():
    if 'username' not in session:
        flash('You need to login first!', 'warning')
        return redirect(url_for('Login_signup'))

    if request.method == 'POST':
        try:
            task_count = int(request.form['taskCount'])
            task_duration = int(request.form['taskDuration'])

            tasks = []
            for i in range(1, task_count + 1):
                task_name = request.form[f'task_name_{i}']
                task_description = request.form[f'task_desc_{i}']
                task_priority = request.form[f'task_priority_{i}']
                task_time = request.form[f'task_time_{i}']

                tasks.append({
                    'name': task_name,
                    'description': task_description,
                    'priority': task_priority,
                    'time': task_time,
                    'username': session['username'],
                    'status': 'pending'
                })

            tasks_collection.insert_many(tasks)
            flash('Tasks created successfully!', 'success')
            return redirect(url_for('view_tasks'))
        except Exception as e:
            flash(f'Error creating tasks: {e}', 'danger')
            return redirect(url_for('create_tasks'))

    return render_template('create_tasks.html')

@app.route('/view_tasks', methods=['GET'])
def view_tasks():
    if 'username' in session:
        username = session['username']
        task_list = list(tasks_collection.find({'username': username}))  # Filter by logged-in user
        return render_template('view_tasks.html', tasks=task_list)
    flash('You need to login first!', 'warning')
    return redirect(url_for('Login_signup'))

@app.route('/edit_task/<task_id>', methods=['GET', 'POST'])
def edit_task(task_id):
    if 'username' not in session:
        flash('You need to login first!', 'warning')
        return redirect(url_for('Login_signup'))
    
    task = tasks_collection.find_one({'_id': ObjectId(task_id), 'username': session['username']})
    if not task:
        flash('Task not found!', 'danger')
        return redirect(url_for('view_tasks'))
    
    if request.method == 'POST':
        try:
            task_name = request.form['task_name']
            task_description = request.form['task_desc']
            task_priority = request.form['task_priority']
            task_time = request.form['task_time']
            
            # Update task in the database
            tasks_collection.update_one(
                {'_id': ObjectId(task_id)},
                {'$set': {
                    'name': task_name,
                    'description': task_description,
                    'priority': task_priority,
                    'time': task_time,
                    'status': request.form['task_status']  # New status can be set from form
                }}
            )
            flash('Task updated successfully!', 'success')
            return redirect(url_for('view_tasks'))
        except Exception as e:
            flash(f'Error updating task: {e}', 'danger')
            return redirect(url_for('view_tasks'))
    
    # Pre-fill form fields with existing task data
    return render_template('edit_task.html', task=task)

@app.route('/delete_task/<task_id>', methods=['POST'])
def delete_task(task_id):
    if 'username' in session:
        username = session['username']
        task = tasks_collection.find_one({'_id': ObjectId(task_id), 'username': username})
        if task:
            tasks_collection.delete_one({'_id': ObjectId(task_id)})
            flash('Task deleted successfully!', 'success')
            return redirect(url_for('view_tasks'))
    flash('Task not found!', 'danger')
    return redirect(url_for('view_tasks'))

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.pop('username', None)
    flash('You have been logged out!', 'success')
    return redirect(url_for('login_signup'))

# AI Feature Routes
@app.route('/summarize_pdf', methods=['GET', 'POST'])
def summarize_pdf_route():
    summary = None
    if request.method == 'POST':
        pdf_file = request.files.get('pdf_file')
        if pdf_file:
            pdf_path = os.path.join(os.getcwd(), pdf_file.filename)
            pdf_file.save(pdf_path)
            summary = summarize_pdf(pdf_path)
            os.remove(pdf_path)
        else:
            summary = "Please upload a PDF file."
    if summary:
        return summary
    else:
        return render_template('PDF.html')

if __name__ == '__main__':
    app.run(debug=True)
