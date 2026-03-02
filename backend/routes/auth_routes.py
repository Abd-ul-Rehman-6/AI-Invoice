from flask import Blueprint, request, jsonify
from models.user import User
from models.login_log import LoginLog
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint("auth", __name__)

#USER REGISTER 
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip() or "User"
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not first_name or not email or not password:
        return jsonify({"error": "first_name, email and password are required"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"error": "Email already in use"}), 400

    is_first_user = User.query.count() == 0
    assigned_role = "admin" if is_first_user else "user"

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=generate_password_hash(password),
        role=assigned_role  
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already in use"}), 400

    return jsonify({"message": f"Registered as {assigned_role}"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    email = data['email']
    password = data['password']
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password_hash, password):
        # ✅ IMPORTANT: Sirf user.id pass karo (integer)
        token = create_access_token(
            identity=user.id,  # ✅ integer, string nahi!
            additional_claims={"role": user.role}
        )
        
        redirect_to = "/admin-dashboard" if user.role == "admin" else "/user-dashboard"
        
        # Log login (optional)
        try:
            db.session.add(LoginLog(user_id=user.id, role=user.role))
            db.session.commit()
        except:
            db.session.rollback()
        
        return jsonify({
            "token": token,
            "role": user.role,
            "redirect": redirect_to
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@auth_bp.route("/admin-register", methods=["POST"])
def admin_register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name") or "Admin"
    last_name = data.get("last_name") or "User"

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # 🔒 CHECK: only ONE admin allowed
    existing_admin = User.query.filter_by(role="admin").first()
    if existing_admin:
        return jsonify({
            "error": "Admin already exists. Registration disabled."
        }), 403

    # 🔒 CHECK: email duplication safety
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"error": "Email already in use"}), 400

    # Admin object create karein
    admin = User(
        first_name=first_name,
        last_name=last_name,
        email=email.lower(),
        role="admin"
    )
    admin.set_password(password)

    db.session.add(admin)
    db.session.commit()

    # Log admin creation
    log = LoginLog(user_id=admin.id, role="admin")
    db.session.add(log)
    db.session.commit()

    # Success message ke saath redirect path bhej rahe hain
    return jsonify({
        "message": "Admin registered successfully",
        "redirect": "/login"
    }), 201
