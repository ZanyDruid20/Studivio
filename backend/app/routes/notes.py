from app.models.note import NoteModel
from flask import current_app
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity # type: ignore
from datetime import datetime

notes = Blueprint('notes', __name__)

@notes.route('/notes', methods=['OPTIONS'])
def handle_notes_options():
    """Handle preflight OPTIONS request for CORS"""
    return '', 200

@notes.route('/notes', methods=['POST'])
@jwt_required()
def create_note():
    try:
        current_user = get_jwt_identity()
        note_model = NoteModel(current_app._get_current_object())
        data = request.json
        
        # Validate required fields
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        if not data.get('title', '').strip():
            return jsonify({"message": "Title is required"}), 400
            
        if not data.get('content', '').strip():
            return jsonify({"message": "Content is required"}), 400
        
        # Add user ID and timestamps
        data['user_id'] = current_user
        data['created_at'] = datetime.utcnow().isoformat()
        data['updated_at'] = datetime.utcnow().isoformat()
        
        # Handle both text and delta formats
        if 'format' not in data:
            data['format'] = 'text'  # Changed from 'delta' to 'text'
        if 'content_type' not in data:
            data['content_type'] = 'manual'
        
        print(f"Creating note for user: {current_user}")  # Debug log
        print(f"Note data: {data}")  # Debug log
        
        note_id = note_model.create_note(data)
        if note_id:
            return jsonify({
                "note_id": str(note_id), 
                "message": "Note created successfully"
            }), 201
        else:
            return jsonify({"message": "Failed to create note"}), 500
            
    except Exception as e:
        print(f"Error in create_note: {str(e)}")  # Debug log
        return jsonify({"message": f"Internal server error: {str(e)}"}), 500

@notes.route('/notes', methods=['GET'])
@jwt_required()
def get_notes():
    try:
        current_user = get_jwt_identity()
        note_model = NoteModel(current_app._get_current_object())
        
        # 🔧 FIX: Add debug logging
        print(f"📝 Getting notes for user: {current_user}")
        
        notes = note_model.get_notes_by_user(current_user)
        
        # Convert ObjectId to string for JSON serialization
        for note in notes:
            if '_id' in note:
                note['_id'] = str(note['_id'])
        
        print(f"📝 Found {len(notes)} notes")
        return jsonify(notes), 200
        
    except Exception as e:
        print(f"❌ Error getting notes: {str(e)}")
        return jsonify({"message": f"Error getting notes: {str(e)}"}), 500

@notes.route('/notes/<note_id>', methods=['GET'])
@jwt_required()
def get_note_by_id(note_id):
    current_user = get_jwt_identity()
    note_model = NoteModel(current_app._get_current_object())
    note = note_model.read_note(note_id)
    
    if not note:
        return jsonify({"message": "Note not found"}), 404
    
    # Check if user owns this note
    if note.get('user_id') != current_user:
        return jsonify({"message": "Unauthorized access"}), 403
    
    note['_id'] = str(note['_id'])
    return jsonify(note), 200
    
@notes.route('/notes/<note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    current_user = get_jwt_identity()
    note_model = NoteModel(current_app._get_current_object())
    
    # First check if note exists and user owns it
    existing_note = note_model.read_note(note_id)
    if not existing_note:
        return jsonify({"message": "Note not found"}), 404
    
    if existing_note.get('user_id') != current_user:
        return jsonify({"message": "Unauthorized access"}), 403
    
    data = request.json
    data['updated_at'] = datetime.utcnow().isoformat()
    
    # Ensure content format is preserved
    if 'content' in data and 'format' not in data:
        data['format'] = 'text'
    
    updated_note = note_model.update_note(note_id, data)
    if updated_note:
        return jsonify({"message": "Note updated successfully"}), 200
    else:
        return jsonify({"message": "Update failed"}), 400

@notes.route('/notes/<note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    current_user = get_jwt_identity()
    note_model = NoteModel(current_app._get_current_object())
    
    # First check if note exists and user owns it
    existing_note = note_model.read_note(note_id)
    if not existing_note:
        return jsonify({"message": "Note not found"}), 404
    
    if existing_note.get('user_id') != current_user:
        return jsonify({"message": "Unauthorized access"}), 403
    
    deleted_note = note_model.delete_note(note_id)
    if deleted_note:
        return jsonify({"message": "Note deleted successfully"}), 200
    else:
        return jsonify({"message": "Delete failed"}), 400