from flask_pymongo import PyMongo # type: ignore

def init_mongo(app):
    # Example: set your MongoDB URI here or in app.config
    app.config["MONGO_URI"] = "mongodb://localhost:27017/Studivio"
    mongo = PyMongo(app)
    return mongo