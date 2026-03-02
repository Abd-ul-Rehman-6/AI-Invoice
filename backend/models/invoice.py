from extensions import db
from datetime import datetime

class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    invoice_nmber = db.Column(db.String(100))
    client_name = db.Column(db.String(200))
    total_amount = db.Column(db.Float)
    risk_score = db.Column(db.Integer)
    date = db.Column(db.DateTime, default = datetime.utcnow)
    ai_explanation = db.Column(db.Text, nullable=True)
    file_name = db.Column(db.String(255))
    invoice_number = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    line_items = db.relationship("InvoiceLineItem", backref="invoice", lazy=True)
    issues = db.relationship("InvoiceIssue", backref="invoice", lazy=True)
    invoice_date = db.Column(db.String(20), nullable=True)

