from extensions import db

class Report(db.Model):
    __tablename__ = "reports"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    report_data = db.Column(db.JSON) 
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"))
    
