from flask import Blueprint, jsonify

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return jsonify({
        "message": "Studivio Backend API is running!",
        "status": "OK",
        "version": "1.0"
    })

@main.route('/endpoints')
def endpoints():
    return jsonify({
        "youtube_summariser": "/summariser/youtube (POST, JSON: {video_id})",
        "pdf_summariser": "/summariser/pdf (POST, form-data: file)"
        
    })