import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))


import unittest
from app import create_app

class AuthRouteTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config["MONGO_URI"] = "mongodb://localhost:27017/Studivio"  # <-- Add this line
        self.client = self.app.test_client()

    def test_register(self):
        response = self.client.post('/Register', json={
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertIn(response.status_code, [201, 409])  # 201 if created, 409 if already exists

    def test_login(self):
        response = self.client.post('/Login', json={
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertIn(response.status_code, [200, 401])

if __name__ == '__main__':
    unittest.main()