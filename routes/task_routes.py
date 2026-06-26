"""
Task API routes — REST endpoints for study task CRUD and progress.
"""

from flask import Blueprint, jsonify, request

from database.db import get_db

task_api_bp = Blueprint("task_api", __name__, url_prefix="/api")


def _task_to_dict(row):
    """Convert a SQLite row into a JSON-friendly dictionary."""
    return {
        "id": row["id"],
        "title": row["title"],
        "subject": row["subject"],
        "priority": row["priority"],
        "due_date": row["due_date"],
        "description": row["description"],
        "workout_reminder": bool(row["workout_reminder"]),
        "status": row["status"],
        "created_at": row["created_at"],
    }


@task_api_bp.route("/tasks", methods=["GET"])
def get_tasks():
    """Return all study tasks ordered by due date."""
    db = get_db()
    rows = db.execute(
        "SELECT * FROM tasks ORDER BY due_date ASC, id DESC"
    ).fetchall()
    return jsonify({"tasks": [_task_to_dict(row) for row in rows]})


@task_api_bp.route("/tasks", methods=["POST"])
def create_task():
    """Create a new study task from JSON body."""
    data = request.get_json(silent=True) or {}

    required_fields = ["title", "subject", "priority", "due_date"]
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO tasks (title, subject, priority, due_date, description, workout_reminder, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        """,
        (
            data["title"].strip(),
            data["subject"],
            data["priority"],
            data["due_date"],
            data.get("description", "").strip(),
            1 if data.get("workout_reminder") else 0,
        ),
    )
    db.commit()

    row = db.execute("SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify({"message": "Task created", "task": _task_to_dict(row)}), 201


@task_api_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a study task by ID."""
    db = get_db()
    row = db.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Task not found"}), 404

    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return jsonify({"message": "Task deleted", "id": task_id})


@task_api_bp.route("/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    """Update task status (pending / completed)."""
    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in ("pending", "completed"):
        return jsonify({"error": "Status must be 'pending' or 'completed'"}), 400

    db = get_db()
    row = db.execute("SELECT id FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Task not found"}), 404

    db.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
    db.commit()

    updated = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return jsonify({"message": "Task updated", "task": _task_to_dict(updated)})


@task_api_bp.route("/progress", methods=["GET"])
def get_progress():
    """Return aggregated progress statistics."""
    db = get_db()

    total = db.execute("SELECT COUNT(*) AS count FROM tasks").fetchone()["count"]
    completed = db.execute(
        "SELECT COUNT(*) AS count FROM tasks WHERE status = 'completed'"
    ).fetchone()["count"]
    pending = total - completed

    by_subject = db.execute(
        """
        SELECT
            subject,
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM tasks
        GROUP BY subject
        ORDER BY subject
        """
    ).fetchall()

    subject_stats = []
    for row in by_subject:
        subject_total = row["total"]
        subject_completed = row["completed"]
        rate = round((subject_completed / subject_total) * 100) if subject_total else 0
        subject_stats.append(
            {
                "subject": row["subject"],
                "total": subject_total,
                "completed": subject_completed,
                "rate": rate,
            }
        )

    return jsonify(
        {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": round((completed / total) * 100) if total else 0,
            "by_subject": subject_stats,
        }
    )
