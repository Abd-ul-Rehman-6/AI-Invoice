from extensions import db
from datetime import datetime

class LoginLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    role = db.Column(db.String(20))
    login_time = db.Column(db.DateTime, default=datetime.utcnow)
