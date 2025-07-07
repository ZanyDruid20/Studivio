import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

import unittest
from app.models.todo import TodoModel
from flask import Flask
from app import create_app

class TodoModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config["MONGO_URI"] = "mongodb://localhost:27017/Studivio"
        self.client = self.app.test_client()
        self.todo_model = TodoModel(self.app)

    def test_create_todo(self):
        data = {
            'title': 'Test Todo',
            'description': 'Test Description',
            'due_date': '2025-12-31',
            'priority': 'High',
            'status': 'Pending',
            'username': 'testuser'
        }
        result = self.todo_model.create_todo(data)
        self.assertTrue(result)

    def test_get_todos(self):
        data = {'username': 'testuser', 'task': 'Test Todo'}
        self.todo_model.create_todo(data)
        todos = self.todo_model.get_all_todos()  # <-- updated method name
        self.assertIsInstance(todos, list)

if __name__ == '__main__':
    unittest.main()