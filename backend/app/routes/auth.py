# initializing the UserModel from the model directory
from app.models.user import UserModel
from flask import current_app, Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, JWTManager # type: ignore

auth = Blueprint('auth', __name__)

# Helper functions for blacklisting

def add_token_to_blacklist(jti):
    mongo = current_app.extensions['pymongo']
    mongo.db.blacklisted_tokens.insert_one({"jti": jti})

def is_token_blacklisted(jti):
    """Check if a JWT token is blacklisted"""
    try:
        from app import mongo  # Import the mongo instance directly
        blacklisted_token = mongo.db.blacklisted_tokens.find_one({"jti": jti})
        return blacklisted_token is not None
    except Exception as e:
        print(f"Error checking token blacklist: {e}")
        # If there's an error checking, assume token is valid to avoid blocking users
        return False

# --- Auth routes ---

@auth.route('/Login', methods=['POST'])
def login():
    user_model = UserModel(current_app._get_current_object())
    username = request.json.get('username')
    password = request.json.get('password')
    
    if user_model.check_password(username, password):
        access_token = create_access_token(identity=username)
        # 🔧 FIX: Return consistent format
        return jsonify({
            "access_token": access_token,
            "message": "Login successful",
            "username": username
        }), 200
    else:
        return jsonify({"message": "Login Failed"}), 401

# Route for user registration.
# Retrieves username and password from the request,
# then attempts to create a new user using the UserModel.
# Returns a conflict response if the user already exists,
# otherwise confirms successful user creation.
@auth.route('/Register', methods=['POST'])
def register():
    user_model = UserModel(current_app._get_current_object())
    username = request.json.get('username')
    password = request.json.get('password')
    result = user_model.create_user(username, password)
    if not result:
        return jsonify({"Message": "The user already exists"}), 409
    return jsonify({"Message": "User Created"}), 201

# Defined a route for logout where it clears out the user id
@auth.route('/Logout', methods=['POST'])
@jwt_required()
def logout():
    # Get the unique identifier for the JWT
    jti = get_jwt()["jti"]
    add_token_to_blacklist(jti)
    return jsonify({"Message": "User Logged Out"}), 200

@auth.route('/protected', methods=['GET'])
@jwt_required()
# Define a route for protected resources
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


