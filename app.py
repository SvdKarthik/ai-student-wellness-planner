"""
AI Student Wellness Planner — Flask application entry point.

Run locally:
    python app.py
"""

import os

from flask import Flask

from config import Config
from database.db import close_db, init_db
from routes.main_routes import main_bp
from routes.task_routes import task_api_bp
from routes.workout_routes import workout_api_bp
from routes.ai_routes import ai_api_bp


def create_app():
    """Create and configure the Flask application."""
    # __name__ tells Flask where to find templates and static files.
    app = Flask(__name__, instance_relative_config=True)

    # Load settings from our Config class (SECRET_KEY, DEBUG, paths, etc.).
    app.config.from_object(Config)

    # Make sure the instance folder exists (for SQLite DB in later features).
    os.makedirs(app.instance_path, exist_ok=True)

    # Connect blueprints to the application.
    app.register_blueprint(main_bp)
    app.register_blueprint(task_api_bp)
    app.register_blueprint(workout_api_bp)
    app.register_blueprint(ai_api_bp)

    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db(app)

    return app


# Create the app instance so other modules (and gunicorn) can import it.
app = create_app()


if __name__ == "__main__":
    # Start the development server only when this file is run directly.
    app.run(debug=app.config["DEBUG"])
