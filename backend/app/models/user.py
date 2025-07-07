from flask_pymongo import PyMongo # type: ignore
from flask_bcrypt import Bcrypt # type: ignore

class UserModel:
    def __init__(self, app):
        self.mongo = PyMongo(app)
        self.bcrypt = Bcrypt(app)
        self.users = self.mongo.db.users

    def create_user(self, username, password):
        if self.users.find_one({"username": username}):
            return False  # User already exists
        hashing_pw = self.bcrypt.generate_password_hash(password).decode('utf-8')
        user = {"username": username, "password": hashing_pw}
        self.users.insert_one(user)
        return True  # User created successfully

    def find_username(self, username):
        return self.users.find_one({"username": username})

    def check_password(self, username, password):
        user = self.find_username(username)
        if user and self.bcrypt.check_password_hash(user['password'], password):
            return True
        return False