import os
from bson import ObjectId
from flask import Flask, render_template, redirect, url_for, request, jsonify, session, flash
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from datetime import datetime
from flask_cors import CORS



app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'pommodorro'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/pommodorro'
app.secret_key = 'your_secret_key'  # Replace with your actual secret key
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
tasks_collection = mongo.db.tasks
CORS(app)


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
    return redirect(url_for('login_signup'))


@app.route('/')
def home():
    return render_template('base.html')



@app.route('/create_tasks', methods=['GET', 'POST'])
def create_tasks():
    if 'username' not in session:
        flash('You need to login first!', 'warning')
        return redirect(url_for('login_signup'))

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
    return redirect(url_for('login_signup'))

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
@app.route('/edit_tasks/<task_id>', methods=['GET', 'POST'])
def edit_tasks(task_id):
    task = tasks_collection.find_one({"_id": ObjectId(task_id)})
    
    if request.method == 'POST':
        updated_name = request.form['task_name']
        updated_description = request.form['task_desc']
        updated_duration = request.form['task_duration']
        
        # Update the task in the database
        tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"name": updated_name, "description": updated_description, "time": updated_duration}}
        )
        
        return redirect(url_for('view_tasks', task_id=task_id))
    
    return render_template('edit_tasks.html', task=task)

@app.route('/edit_task/<task_id>', methods=['GET'])
def edit_task_form(task_id):
    task = tasks_collection.find_one({'_id': ObjectId(task_id)})

    if task:
        return render_template('edit_tasks.html', task=task)
    else:
        flash('Task not found!', 'danger')
        return redirect(url_for('view_tasks'))

@app.route('/delete_task/<task_id>', methods=['POST'], endpoint='delete_task_endpoint')
def delete_task(task_id):
    if request.form.get('_method') == 'DELETE':
        # Proceed with the delete logic
        if 'username' in session:
            username = session['username']
            task = tasks_collection.find_one({'_id': ObjectId(task_id), 'username': username})
            if task:
                tasks_collection.delete_one({'_id': ObjectId(task_id)})
                return jsonify({'success': True})
            return jsonify({'success': False})
    return jsonify({'success': False})



@app.route('/delete_all_tasks', methods=['POST'])
def delete_all_tasks():
    tasks_collection.delete_many({})
    flash('All tasks deleted successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/add_task', methods=['POST'])
def add_task():
    if 'username' in session:
        data = request.get_json()

        # Ensure that the necessary fields are provided
        if 'title' in data and 'description' in data and 'time' in data and 'priority' in data:
            new_task = {
                'title': data['title'],
                'description': data['description'],
                'time': data['time'],
                'priority': data['priority'],
                'username': session['username'],
                'status': 'pending'  # You can set the task status to 'pending' initially
            }

            # Insert the new task into the database
            tasks_collection.insert_one(new_task)

            return jsonify({'success': True, 'message': 'Task added successfully'})
        else:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    else:
        return jsonify({'success': False, 'error': 'User not logged in'}), 401

if __name__ == '__main__':
    app.run(debug=True)