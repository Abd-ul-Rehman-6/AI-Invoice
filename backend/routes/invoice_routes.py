from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.role_required import role_required
from werkzeug.utils import secure_filename
from pdf2image import convert_from_bytes
import json
import os
import uuid
import json
from io import BytesIO
import tempfile
from PIL import Image
from datetime import datetime

from services.parsers.pdf_parser import parse_pdf_invoice
from services.parsers.excel_parser import parse_excel_invoice
from services.risk_scoring import calculate_risk_score
from services.rules.validator import detect_issues
from services.ai.explainer import analyze_invoice_with_ai
from services.invoice_calculator import calculate_invoice
from models.report import Report
from models.invoice import Invoice
from models.invoice_issue import InvoiceIssue
from extensions import db
from datetime import datetime 

from services.pdf_generative import generate_invoice_pdf
from services.image_converter import pdf_to_image_bytes

invoice_bp = Blueprint("invoice", __name__)

UPLOAD_FOLDER = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {"pdf", "csv", "xlsx"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@invoice_bp.route("/user/upload", methods=["POST"])
@jwt_required()
@role_required("user")
def upload_invoice():
    identity = get_jwt_identity()
    user_id = int(identity)

    if "files" not in request.files:
        return jsonify({"error": "No files found"}), 400

    files = request.files.getlist("files")
    uploaded = []
    errors = []
    processed_results = []

    for file in files:
        if file.filename == "" or not allowed_file(file.filename):
            errors.append(f"{file.filename}: Invalid file")
            continue

        filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_name)
        file.save(filepath)

        try:
            #Get raw JSON data from AI 
            ai_data = analyze_invoice_with_ai(filepath)
            
            if not ai_data:
                raise Exception("AI service failed to return data")
            invoice_obj = Invoice(
                user_id=user_id,
                file_name=unique_name,
                ai_explanation=json.dumps(ai_data)
            )
            db.session.add(invoice_obj)
            db.session.flush() 

            new_report = Report(
                title=f"Audit Report - {filename}",
                report_data=ai_data, 
                invoice_id=invoice_obj.id
            )
            db.session.add(new_report)
            db.session.commit()
            processed_results.append(ai_data)
            uploaded.append(filename)

        except Exception as e:
            db.session.rollback()
            errors.append(f"{filename}: {str(e)}")

    return jsonify({
        "uploaded_files": uploaded,
        "processed_results": processed_results,
        "errors": errors
    })


#VIEW RESULTS
@invoice_bp.route("/user/results", methods=["GET"])
@jwt_required()
@role_required("user")
def view_results():
    user_id = int(get_jwt_identity())
    # Newest invoices first so "recent" view works correctly
    invoices = (
        Invoice.query.filter_by(user_id=user_id)
        .order_by(Invoice.created_at.desc())
        .all()
    )
    result = []

    for inv in invoices:
        # Try to enrich from stored AI explanation JSON
        ai_summary = {}
        if inv.ai_explanation:
            try:
                data = (
                    json.loads(inv.ai_explanation)
                    if isinstance(inv.ai_explanation, str)
                    else inv.ai_explanation
                )
                invoice_list = data.get("invoices", [])
                if invoice_list:
                    ai_summary = invoice_list[0] or {}
            except Exception:
                ai_summary = {}

        result.append({
            "id": inv.id,
            "invoice_number": ai_summary.get("invoice_number") or inv.invoice_number or "N/A",
            "client": ai_summary.get("vendor_name") or inv.client_name or "N/A",
            "invoice_date": ai_summary.get("invoice_date") or inv.invoice_date or "N/A",
            "total_amount": ai_summary.get("total_amount") or (inv.total_amount if inv.total_amount is not None else "N/A"),
            # Prefer human-readable risk_level from AI; fall back to numeric risk_score
            "risk_score": ai_summary.get("risk_level") or inv.risk_score or "N/A",
            "risk_tag": ai_summary.get("status_tag") or "",
            "details_html": ai_summary.get("detailed_review") or ai_summary.get("risk_explanation") or "",
            "ai_explanation": inv.ai_explanation,
            "line_items": [li.__dict__ for li in getattr(inv, 'line_items', [])],
            "file_name": inv.file_name
        })

    return jsonify({
        "user_id": user_id,
        "invoices": result
    })


@invoice_bp.route("/user/invoice/<int:invoice_id>/download", methods=["GET"])
@jwt_required()
def download_invoice_report(invoice_id):
    try:
        user_id = int(get_jwt_identity())
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=user_id).first()
        if not invoice:
            return jsonify({"error": "Invoice not found or unauthorized"}), 404

        report = Report.query.filter_by(invoice_id=invoice.id).first()
        if not report or not report.report_data:
            return jsonify({"error": "No data"}), 404

        # report_data might come back as a JSON string depending on how SQLAlchemy
        # serializes/stores it; ensure we have a dict before accessing .get()
        data = report.report_data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                data = {}

        invoices = data.get("invoices", [])

        table_rows = []
        detailed_findings = []
        counts = {"duplicate": 0, "mismatch": 0, "suspicious": 0, "fraud": 0}

        for inv in invoices:
            if not isinstance(inv, dict):
                current_app.logger.warning("Malformed invoice item; skipping: %r", inv)
                continue

            v_name = inv.get("vendor_name", "N/A")
            v_id = inv.get("invoice_number", "N/A")
            risk = inv.get("risk_level", "Low")
            details = inv.get("audit_details", {}) or {}
            detailed_review_text = inv.get("risk_explanation") or inv.get("detailed_review", "")

            has_issue = "Issues Found" if (details.get("math_mismatch") or details.get("line_item_duplicates")) else "Clean"
            table_rows.append([v_name, v_id, inv.get("total_amount", "0"), risk, has_issue])

            issue_text = ""
            if has_issue == "Issues Found":
                issue_text = f"<b>{v_name} (Inv: {v_id}):</b><br/>"
                if details.get("math_mismatch"):
                    issue_text += f"• {details['math_mismatch']}<br/>"
                    counts["mismatch"] += 1
                if details.get("line_item_duplicates"):
                    dup_items = details.get("line_item_duplicates")
                    if not isinstance(dup_items, (list, tuple)):
                        dup_items = [str(dup_items)]
                    issue_text += f"• Duplicate items: {', '.join(dup_items)}<br/>"
                    counts["duplicate"] += 1
                if detailed_review_text:
                    issue_text += f"<br/><b>Detailed Review:</b><br/>{detailed_review_text}<br/>"
            elif detailed_review_text:
                issue_text = f"<b>{v_name} (Inv: {v_id}):</b><br/>{detailed_review_text}<br/>"

            if risk == "High":
                counts["suspicious"] += 1

            detailed_findings.append(issue_text)

        pdf_data = {
            "client_name": invoice.client_name or "Audit Report",
            "invoice_date": datetime.now().strftime("%b %d, %Y"),
            "table_rows": table_rows,
            "detailed_findings": detailed_findings,
        }

        pdf_buffer = BytesIO()
        generate_invoice_pdf(pdf_data, counts, pdf_buffer)
        pdf_buffer.seek(0)
        return send_file(pdf_buffer, mimetype="application/pdf", as_attachment=True,
                         download_name=f"Audit_Report_{invoice_id}.pdf")

    except Exception as err:
        current_app.logger.exception("Error in /user/invoice/%s/download (user %s)", invoice_id, get_jwt_identity())
        # send the raw exception message so client can see what happened
        msg = str(err) or "Server error generating report"
        return jsonify({"error": msg}), 500


@invoice_bp.route("/user/invoice/<int:invoice_id>/delete", methods=["DELETE"])
@jwt_required()
@role_required("user")
def delete_invoice(invoice_id):
    user_id = int(get_jwt_identity())
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=user_id).first()
    
    if not invoice:
        return jsonify({"error": "Invoice not found or unauthorized"}), 404

    try:
        file_path = os.path.join(UPLOAD_FOLDER, invoice.file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
        Report.query.filter_by(invoice_id=invoice.id).delete()
        db.session.delete(invoice)
        db.session.commit()

        return jsonify({"message": "Invoice and report deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Delete failed: {str(e)}"}), 500
    
    