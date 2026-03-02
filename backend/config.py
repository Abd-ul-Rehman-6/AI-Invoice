import os
from datetime import timedelta

class Config:
    SECRET_KEY = "super-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///site.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "jwt-secret-key"
    GEMINI_API_KEY="AIzaSyCjNfrCc0ypUk39nJivxgH7yBnutS8TchM"

    POPPLER_PATH = r"C:\poppler\Library\bin"

MAIL_SERVER = 'smtp.gmail.com' 
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'your-email@gmail.com'
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'your-password'
MAIL_DEFAULT_SENDER = 'noreply@invoiceguard.com'