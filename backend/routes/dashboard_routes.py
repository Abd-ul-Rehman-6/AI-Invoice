import os
import json
from flask import Blueprint, jsonify, render_template, request, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.role_required import role_required  
from models.user import User
from models.report import Report
from models.invoice import Invoice
from models.login_log import LoginLog
from extensions import db
from utils.decorators import role_required

dashboard_bp = Blueprint("dashboard", __name__)

#USER DASHBOARD
@dashboard_bp.route("/user/dashboard", methods=["GET"])
@jwt_required()
@role_required("user")
def user_dashboard():
    user_id = get_jwt_identity()   
    user = User.query.get(user_id)

    return jsonify({
        "message": "User Dashboard",
        "user": {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.role
        }
    })


# ADMIN STATS 

@dashboard_bp.route("/admin/stats")
@jwt_required()
@role_required("admin")
def admin_stats():
    total_users = User.query.count()
    total_invoices = Invoice.query.count()
    total_reports = total_invoices  
    total_risky_reports = Invoice.query.filter(Invoice.risk_score >= 50).count()

    return jsonify({
        "total_users": total_users,
        "total_invoices": total_invoices,
        "total_reports": total_reports,
        "total_risky_reports": total_risky_reports
    })

#ADMIN DASHBOARD LOGS 
@dashboard_bp.route("/admin/dashboard", methods=["GET"])
@jwt_required()
@role_required("admin")
def admin_dashboard_data():
    logs = LoginLog.query.order_by(LoginLog.login_time.desc()).limit(10).all()

    login_logs = []
    for log in logs:
        user = User.query.get(log.user_id)
        login_logs.append({
            "user": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "role": user.role,
            "time": log.login_time.strftime("%Y-%m-%d %H:%M")
        })

    return jsonify({"login_logs": login_logs})




@dashboard_bp.route("/admin/invoice-detail/<int:invoice_id>")
@jwt_required()
@role_required("admin")
def get_invoice_detail(invoice_id):
    inv = Invoice.query.get_or_404(invoice_id)
    res = {
        "invoice_number": inv.invoice_number or "N/A",
        "client": inv.client_name or "N/A",
        "date": inv.invoice_date.strftime("%Y-%m-%d") if inv.invoice_date else "N/A",
        "total_amount": inv.total_amount or 0,
        "risk_score": inv.risk_score or "N/A",
        "ai_explanation": "No details available"
    }

    if inv.ai_explanation:
        try:
            data = json.loads(inv.ai_explanation) if isinstance(inv.ai_explanation, str) else inv.ai_explanation
            invoice_list = data.get("invoices", [])
            if invoice_list:
                item = invoice_list[0] 
                res["invoice_number"] = item.get("invoice_number", res["invoice_number"])
                res["client"] = item.get("vendor_name", res["client"])
                res["date"] = item.get("invoice_date", res["date"])
                res["total_amount"] = item.get("total_amount", res["total_amount"])
                res["risk_score"] = item.get("risk_level", res["risk_score"])
                res["ai_explanation"] = item.get("risk_explanation", res["ai_explanation"])
        except Exception as e:
            print(f"JSON Parse Error: {e}")

    return jsonify(res)



