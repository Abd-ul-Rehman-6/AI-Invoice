from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify
from models.user import User

def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return jsonify({"error": "Access denied"}), 403

            # Allow admins to access user endpoints as well
            if role == "user":
                if user.role not in ("user", "admin"):
                    return jsonify({"error": "Access denied"}), 403
            else:
                if user.role != role:
                    return jsonify({"error": "Access denied"}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper
