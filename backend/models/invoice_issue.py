from extensions import db

class InvoiceIssue(db.Model):
    __tablename__ = "invoice_issues"

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(
        db.Integer,
        db.ForeignKey("invoices.id")  
    )
    severity = db.Column(db.String(20), nullable=False)
    code = db.Column(db.String(50), nullable=False)

    issue_text = db.Column(db.Text)

