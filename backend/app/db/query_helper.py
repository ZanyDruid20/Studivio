from bson.objectid import ObjectId # type: ignore

def find_by_id(collection, id):
    return collection.find_one({"_id": ObjectId(id)})

def insert_one(collection, data):
    return collection.insert_one(data).inserted_id

def update_by_id(collection, id, data):
    return collection.update_one({"_id": ObjectId(id)}, {"$set": data})

def delete_by_id(collection, id):
    return collection.delete_one({"_id": ObjectId(id)})