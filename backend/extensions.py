import os
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail, Message 

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "invoiceiq.db")

# ✅ FIX: User identity loader - yeh tab call hota hai jab aap create_access_token mein identity pass karte ho
@jwt.user_identity_loader
def user_identity_lookup(user):
    # Agar user ek integer/string hai (jo aap create_access_token mein pass kar rahe ho)
    if isinstance(user, (int, str)):
        return str(user)  # Directly return as string
    # Agar user ek object hai (like User model instance)
    elif hasattr(user, 'id'):
        return str(user.id)
    else:
        return str(user)

# ✅ User lookup loader - yeh tab call hota hai jab token verify hota hai
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    from models.user import User
    identity = jwt_data["sub"]
    return User.query.get(int(identity))