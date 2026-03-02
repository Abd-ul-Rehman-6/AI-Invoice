from flask import Blueprint, jsonify, render_template, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash

from utils.role_required import role_required
from models import User
from extensions import db

admin_users_bp = Blueprint("admin_users", __name__)


@admin_users_bp.route("/admin/users")
@jwt_required()
@role_required("admin")
def view_users():
    return render_template("admin_users.html")


@admin_users_bp.route("/admin/users/create")
@jwt_required()
@role_required("admin")
def add_user_page():
    return render_template("admin_add_user.html")
#GET ALL USERS
@admin_users_bp.route("/dashboard/admin/users/list", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_users():
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role
        } for u in users
    ])


#GET SINGLE USER
@admin_users_bp.route("/dashboard/admin/users/<int:user_id>", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_single_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role
    })
#CREATE USER
@admin_users_bp.route("/dashboard/admin/users", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_user():
    data = request.get_json()
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")

    if not (first_name and email and password):
        return jsonify({"error": "Missing fields"}), 400

    user = User(
        first_name=first_name,
        last_name=last_name or "",
        email=email,
        password_hash=generate_password_hash(password),
        role=data.get("role", "user")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User added successfully"}), 200

#UPDATE USER 
@admin_users_bp.route("/dashboard/admin/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == "admin" and data.get("role") != "admin":
        return jsonify({"error": "Admin role cannot be removed"}), 403

    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200


# DELETE USER
@admin_users_bp.route("/dashboard/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == "admin":
        return jsonify({"error": "Admin cannot be deleted"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"})

@admin_users_bp.route("/admin/users/list", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_non_admin_users():
    users = User.query.filter(User.role != "admin").all()

    return jsonify([
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role
        } for u in users
    ]), 200

