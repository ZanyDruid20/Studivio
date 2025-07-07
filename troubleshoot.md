# Troubleshooting & Common Errors

This document lists common errors encountered during development and testing, along with their solutions.

---

## 1. TypeError: cannot create weak reference to 'LocalProxy' object

**Cause:**  
Passing `current_app` directly to models in route files.

**Fix:**  
Use `current_app._get_current_object()` when initializing models in routes:
```python
note_model = NoteModel(current_app._get_current_object())
```

---

## 2. AttributeError: 'NoteModel' object has no attribute 'get_notes'

**Cause:**  
Calling a method that does not exist or has a different name in the model.

**Fix:**  
Update your test or code to use the correct method name, e.g.:
```python
notes = self.note_model.get_all_notes()
```

---

## 3. AssertionError: None not found in [True, False]

**Cause:**  
Model methods like `create_user` or `create_todo` return `None` instead of `True` or `False`.

**Fix:**  
Update the model method to always return `True` (on success) or `False` (on failure):
```python
def create_user(self, username, password):
    if self.users.find_one({"username": username}):
        return False
    # ...create user...
    return True
```

---

## 4. AssertionError: False is not true (in test_create_todo)

**Cause:**  
Test data is missing required fields expected by the model.

**Fix:**  
Ensure your test provides all required fields:
```python
data = {
    'title': 'Test Todo',
    'description': 'Test Description',
    'due_date': '2025-12-31',
    'priority': 'High',
    'status': 'Pending',
    'username': 'testuser'
}
```

---

## 5. General Advice

- Always match your test data to the required fields in your models.
- Ensure your model methods return the types your tests expect.
- Keep your method names consistent between tests and models.

---

Add more errors and solutions as you encounter them!