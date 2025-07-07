import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

import unittest
from app.models.note import NoteModel
from flask import Flask

class NoteModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["MONGO_URI"] = "mongodb://localhost:27017/Studivio"
        self.note_model = NoteModel(self.app)

    def test_create_note(self):
        data = {'username': 'testuser', 'title': 'Test Note', 'content': 'This is a test note.'}
        result = self.note_model.create_note(data)
        self.assertTrue(result)

    def test_get_notes(self):
        data = {'username': 'testuser', 'title': 'Test Note', 'content': 'This is a test note.'}
        self.note_model.create_note(data)
        notes = self.note_model.get_all_notes()  # <-- updated method name
        self.assertIsInstance(notes, list)

if __name__ == '__main__':
    unittest.main()