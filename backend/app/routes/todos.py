from app.models.todo import TodoModel
from flask import current_app
from flask import Blueprint, request, jsonify

todos = Blueprint('todos', __name__)

@todos.route('/todos', methods=['POST'])
def create_todo():
    todo_model = TodoModel(current_app._get_current_object())
    data = request.json
    todo_id = todo_model.create_todo(data)
    if todo_id:
        return jsonify({"todo_id": todo_id}), 201
    else:
        return jsonify({"message": "Invalid data"}), 400
    
@todos.route('/todos', methods=['GET'])
def get_all_todos():
    todo_model = TodoModel(current_app._get_current_object())
    todos = todo_model.get_all_todos()
    for todo in todos:
        todo['_id'] = str(todo['_id'])
    return jsonify(todos), 200

@todos.route('/todos/<todo_id>', methods=['GET'])
def get_todo_by_id(todo_id):
    todo_model = TodoModel(current_app._get_current_object())
    todo = todo_model.read_todo(todo_id)
    if todo:
        todo['_id'] = str(todo['_id'])
        return jsonify(todo), 200
    else:
        return jsonify({"message": "Todo not found"}), 404
    

@todos.route('/todos/<todo_id>', methods=['PUT'])
def update_todo(todo_id):
    todo_model = TodoModel(current_app._get_current_object())
    data = request.json
    updated = todo_model.update_todo(todo_id, data)
    if updated:
        return jsonify({"message": "Todo updated successfully"}), 200
    else:
        return jsonify({"message": "Todo not found"}), 404
    
@todos.route('/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo_model = TodoModel(current_app._get_current_object())
    deleted = todo_model.delete_todo(todo_id)
    if deleted:
        return jsonify({"message": "Todo deleted successfully"}), 200
    else:
        return jsonify({"message": "Todo not found"}), 404