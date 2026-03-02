from extensions import db

class Timesheet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    client_name = db.Column(db.String(200))
    data = db.Column(db.JSON)
