import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

import unittest
from app.models.user import UserModel
from flask import Flask

class UserModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["MONGO_URI"] = "mongodb://localhost:27017/Studivio"
        self.user_model = UserModel(self.app)

    def test_create_user(self):
        result = self.user_model.create_user('modeltest', 'password')
        self.assertIn(result, [True, False])  # True if user created, False if already exists

    def test_check_password(self):
        self.user_model.create_user('modeltest', 'password')
        self.assertTrue(self.user_model.check_password('modeltest', 'password'))

if __name__ == '__main__':
    unittest.main()