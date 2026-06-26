"""
Application configuration settings.

Loads values from environment variables (.env file in development).
"""

import os

from dotenv import load_dotenv

# Load variables from a .env file in the project root (if it exists).
load_dotenv()


class Config:
    """Default Flask configuration used by the application."""

    # Secret key used to sign session cookies and flash messages.
    # In production, always set a strong random value in .env.
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

    # Where Flask stores local-only files such as the SQLite database.
    INSTANCE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "instance")

    # Full path to the SQLite database file.
    DATABASE_PATH = os.path.join(INSTANCE_PATH, "wellness.db")

    # Google Gemini API key (used in a later feature).
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Enable Flask debug mode when FLASK_DEBUG is set to "True".
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
