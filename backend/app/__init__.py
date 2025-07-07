from flask import Flask
from flask_jwt_extended import JWTManager # type: ignore
from flask_pymongo import PyMongo # type: ignore
import os
from dotenv import load_dotenv # type: ignore
from flask_cors import CORS # type: ignore

jwt = JWTManager()
mongo = PyMongo()  # Add this line

def create_app():
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = "super-secret"
    jwt.init_app(app)

    load_dotenv()
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    
    # 🔧 FIX: Initialize PyMongo
    mongo.init_app(app)
    
    # CORS configuration
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    from .routes.main import main
    from .routes.auth import auth, is_token_blacklisted
    from .routes.notes import notes
    from .routes.todos import todos
    from .services.summariser import summarise_bp
    from .services.whisper import whisperer_bp

    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(notes)
    app.register_blueprint(todos)
    app.register_blueprint(summarise_bp)
    app.register_blueprint(whisperer_bp)   

    # Register JWT blacklist loader
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return is_token_blacklisted(jti)

    return app
