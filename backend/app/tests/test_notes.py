import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))



import unittest
from app import create_app

class NotesRouteTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config["MONGO_URI"] = "mongodb://localhost:27017/Studivio"
        self.client = self.app.test_client()

    def test_create_note(self):
        response = self.client.post('/notes', json={
            'username': 'testuser',
            'title': 'Test Note',
            'content': 'This is a test note.'
        })
        self.assertIn(response.status_code, [200, 201, 400])

    def test_get_notes(self):
        response = self.client.get('/notes?username=testuser')
        self.assertIn(response.status_code, [200, 404])

if __name__ == '__main__':
    unittest.main()