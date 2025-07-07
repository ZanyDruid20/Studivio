from flask_pymongo import PyMongo # type: ignore
from bson.objectid import ObjectId  # type: ignore

"""
    This is a class that implements the Todo Model, it focuses on creating,
    reading, updating and deleting todos.
    This would be then be used in the routes directory where it would be called.
"""
class TodoModel:
    def __init__(self, app):
        self.mongo = PyMongo(app)
        self.db = self.mongo.db
        self.collection = self.db.todos

    def create_todo(self, data):
        required_fields = ["title", "description", "due_date", "priority", "status"]
        for field in required_fields:
            if field not in data or not data[field]:
                return False
        todo_id = self.collection.insert_one(data).inserted_id
        return True if todo_id else False

    def read_todo(self, todo_id):
        try:
            obj_id = ObjectId(todo_id)
        except Exception:
            return None
        todo = self.collection.find_one({"_id": obj_id})
        return todo

    def update_todo(self, todo_id, data):
        try:
            obj_id = ObjectId(todo_id)
        except Exception:
            return None
        result = self.collection.update_one({"_id": obj_id}, {"$set": data})
        return result.modified_count > 0

    def delete_todo(self, todo_id):
        try:
            obj_id = ObjectId(todo_id)
        except Exception:
            return None
        result = self.collection.delete_one({"_id": obj_id})
        return result.deleted_count > 0

    def get_all_todos(self):
        return list(self.collection.find())