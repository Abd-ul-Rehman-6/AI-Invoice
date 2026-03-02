from flask import Flask, render_template
from config import Config
from extensions import db, jwt
from flask_cors import CORS

# Blueprints
from routes.auth_routes import auth_bp
from routes.dashboard_routes import dashboard_bp
from routes.invoice_routes import invoice_bp
from routes.admin_users import admin_users_bp
from routes.contact_routes import contact_bp

app = Flask(__name__)
app.config.from_object(Config)


# Allow Next.js dev server to call the API with JWT Authorization header
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
db.init_app(app)
jwt.init_app(app)

#Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(dashboard_bp, url_prefix="/dashboard")
app.register_blueprint(admin_users_bp)
app.register_blueprint(invoice_bp)
app.register_blueprint(contact_bp)

with app.app_context():
    db.create_all()

#Routes for pages
@app.route("/")
def home():
    return render_template("login.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/admin-register")
def admin_register_page():
    return render_template("register.html")

@app.route("/admin-login")
def admin_login_page():
    return render_template("admin_login.html")

@app.route("/user-dashboard")
def user_dashboard_page():
    return render_template("user_dashboard.html")

@app.route("/admin-dashboard")
def admin_dashboard_page():
    return render_template("admin_dashboard.html")

@app.route("/dashboard/admin/users")
def admin_users_page():
    return render_template("admin_users.html")

@app.route("/dashboard/admin/reports")
def admin_reports_page():
    return render_template("admin_reports.html")


if __name__ == "__main__":
    app.run(debug=True)
