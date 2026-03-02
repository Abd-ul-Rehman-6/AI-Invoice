from extensions import db

class InvoiceLineItem(db.Model):
    __tablename__ = "invoice_line_items"

    id = db.Column(db.Integer, primary_key=True)

    invoice_id = db.Column(
        db.Integer,
        db.ForeignKey("invoices.id"),  # 👈 MUST be EXACT
        nullable=False
    )

    description = db.Column(db.String(255))
    quantity = db.Column(db.Float)
    rate = db.Column(db.Float)
    total = db.Column(db.Float)
