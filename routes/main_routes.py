"""
Main routes — landing page, dashboard, and static HTML pages.
"""

from flask import Blueprint, render_template

main_bp = Blueprint("main", __name__, url_prefix="")


@main_bp.route("/")
def landing():
    """Show the public landing page."""
    return render_template("index.html", active_page="landing")


@main_bp.route("/dashboard")
def dashboard():
    """Show the daily dashboard overview."""
    return render_template("dashboard.html", active_page="dashboard")


@main_bp.route("/add-task", methods=["GET", "POST"])
def add_task():
    """Show the add task form. POST handling will be added in Feature 3."""
    return render_template("add_task.html", active_page="add_task")


@main_bp.route("/ai-suggestions", methods=["GET", "POST"])
def ai_suggestions():
    """Show AI suggestions page. POST handling will be added in Feature 5."""
    return render_template("ai_suggestions.html", active_page="ai_suggestions")


@main_bp.route("/progress")
def progress():
    """Show progress and statistics page."""
    return render_template("progress.html", active_page="progress")
