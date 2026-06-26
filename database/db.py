"""
SQLite database connection helper.
"""

import sqlite3

from flask import current_app, g


def get_db():
    """Open a database connection for the current request."""
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE_PATH"],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(error=None):
    """Close the database connection at the end of a request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(app=None):
    """Create tables from schema.sql if they do not exist."""
    import os

    if app is not None:
        db_path = app.config["DATABASE_PATH"]
    else:
        db_path = current_app.config["DATABASE_PATH"]

    schema_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "schema.sql"
    )

    db = sqlite3.connect(db_path)
    with open(schema_path, "r", encoding="utf-8") as schema_file:
        db.executescript(schema_file.read())
    db.commit()
    db.close()


# ==========================
# Workout Database Functions
# ==========================

def get_all_workouts():
    """Return all workouts."""
    db = get_db()
    return db.execute(
        """
        SELECT *
        FROM workouts
        ORDER BY workout_date ASC, created_at DESC
        """
    ).fetchall()


def get_workout(workout_id):
    """Return a single workout."""
    db = get_db()
    return db.execute(
        """
        SELECT *
        FROM workouts
        WHERE id = ?
        """,
        (workout_id,),
    ).fetchone()


def create_workout(
    workout_name,
    category,
    difficulty,
    duration,
    calories,
    workout_date,
    notes,
):
    """Insert a new workout."""
    db = get_db()

    cursor = db.execute(
        """
        INSERT INTO workouts
        (
            workout_name,
            category,
            difficulty,
            duration,
            calories,
            workout_date,
            notes,
            completed
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        """,
        (
            workout_name,
            category,
            difficulty,
            duration,
            calories,
            workout_date,
            notes,
        ),
    )

    db.commit()
    return cursor.lastrowid


def update_workout(
    workout_id,
    workout_name,
    category,
    difficulty,
    duration,
    calories,
    workout_date,
    notes,
):
    """Update an existing workout."""
    db = get_db()

    db.execute(
        """
        UPDATE workouts
        SET
            workout_name = ?,
            category = ?,
            difficulty = ?,
            duration = ?,
            calories = ?,
            workout_date = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            workout_name,
            category,
            difficulty,
            duration,
            calories,
            workout_date,
            notes,
            workout_id,
        ),
    )

    db.commit()


def delete_workout(workout_id):
    """Delete a workout."""
    db = get_db()

    db.execute(
        """
        DELETE FROM workouts
        WHERE id = ?
        """,
        (workout_id,),
    )

    db.commit()


def toggle_workout_complete(workout_id):
    """Toggle workout completion."""
    db = get_db()

    workout = db.execute(
        """
        SELECT completed
        FROM workouts
        WHERE id = ?
        """,
        (workout_id,),
    ).fetchone()

    if workout is None:
        return False

    completed = 0 if workout["completed"] else 1

    db.execute(
        """
        UPDATE workouts
        SET
            completed = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (completed, workout_id),
    )

    db.commit()

    return True


def get_workout_statistics():
    """Return workout dashboard statistics."""
    db = get_db()

    total = db.execute(
        "SELECT COUNT(*) FROM workouts"
    ).fetchone()[0]

    completed = db.execute(
        """
        SELECT COUNT(*)
        FROM workouts
        WHERE completed = 1
        """
    ).fetchone()[0]

    pending = total - completed

    completion_percentage = (
        round((completed / total) * 100, 2)
        if total > 0
        else 0
    )

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "completion_percentage": completion_percentage,
    }

