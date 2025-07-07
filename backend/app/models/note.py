from flask_pymongo import PyMongo # type: ignore
from bson.objectid import ObjectId # type: ignore
import json

class NoteModel:
    def __init__(self, app):
        self.mongo = PyMongo(app)
        self.collection = self.mongo.db.notes

    def create_note(self, data):
        required_fields = ['title', 'content']
        for field in required_fields:
            if field not in data or not data[field]:
                return False
        
        # Set default format if not specified
        if 'format' not in data:
            data['format'] = 'text'
        
        # Set default content type if not specified
        if 'content_type' not in data:
            data['content_type'] = 'manual'
        
        note_id = self.collection.insert_one(data).inserted_id
        return str(note_id) if note_id else False  # Return the actual ID as string

    def read_note(self, note_id):
        note = self.collection.find_one({'_id': ObjectId(note_id)})
        if note:
            return note
        return None

    def update_note(self, note_id, data):
        try:
            note = self.collection.find_one({'_id': ObjectId(note_id)})
            if not note:
                return None
            
            # Ensure format consistency when updating
            if 'content' in data and 'format' not in data:
                data['format'] = 'text'
                
        except Exception as e:
            return None
        result = self.collection.update_one({'_id': ObjectId(note_id)}, {'$set': data})
        return result.modified_count > 0

    def delete_note(self, note_id):
        result = self.collection.delete_one({'_id': ObjectId(note_id)})
        return result.deleted_count > 0

    def get_all_notes(self):
        return list(self.collection.find())

    def read_all_notes(self):
        return self.get_all_notes()
    
    def get_notes_by_user(self, user_id):
        """Get all notes belonging to a specific user"""
        try:
            # FIX: Use self.collection instead of self.db.notes
            notes = list(self.collection.find({"user_id": user_id}))
            return notes
        except Exception as e:
            print(f"Error getting notes by user: {e}")
            return []