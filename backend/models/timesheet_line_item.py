from extensions import db

class TimesheetLineItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timesheet_id = db.Column(db.Integer)
    description = db.Column(db.String(255))
    hours = db.Column(db.Float)
    approved_rate = db.Column(db.Float)
