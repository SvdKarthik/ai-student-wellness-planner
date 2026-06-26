"""
Workout API routes — REST endpoints for workout CRUD.
"""

from flask import Blueprint, jsonify, request

from database.db import get_db

workout_api_bp = Blueprint("workout_api", __name__, url_prefix="/api")


def _workout_to_dict(row):
    return {
        "id": row["id"],
        "workout_name": row["workout_name"],
        "category": row["category"],
        "difficulty": row["difficulty"],
        "duration": row["duration"],
        "calories": row["calories"],
        "workout_date": row["workout_date"],
        "notes": row["notes"],
        "completed": bool(row["completed"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


@workout_api_bp.route("/workouts", methods=["GET"])
def get_workouts():

    db = get_db()

    rows = db.execute(
        """
        SELECT *
        FROM workouts
        ORDER BY workout_date ASC, id DESC
        """
    ).fetchall()

    return jsonify(
        {
            "workouts": [
                _workout_to_dict(row)
                for row in rows
            ]
        }
    )


@workout_api_bp.route("/workouts", methods=["POST"])
def create_workout():

    data = request.get_json(silent=True) or {}

    required = [
        "workout_name",
        "category",
        "difficulty",
        "duration",
        "workout_date",
    ]

    missing = [x for x in required if not data.get(x)]

    if missing:
        return jsonify(
            {
                "error": f"Missing fields: {', '.join(missing)}"
            }
        ), 400

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
        VALUES
        (?, ?, ?, ?, ?, ?, ?, 0)
        """,
        (
            data["workout_name"],
            data["category"],
            data["difficulty"],
            data["duration"],
            data.get("calories", 0),
            data["workout_date"],
            data.get("notes", ""),
        ),
    )

    db.commit()

    row = db.execute(
        "SELECT * FROM workouts WHERE id=?",
        (cursor.lastrowid,),
    ).fetchone()

    return jsonify(
        {
            "message": "Workout created",
            "workout": _workout_to_dict(row),
        }
    ), 201


@workout_api_bp.route("/workouts/<int:workout_id>", methods=["PUT"])
def update_workout(workout_id):

    data = request.get_json(silent=True) or {}

    db = get_db()

    exists = db.execute(
        "SELECT id FROM workouts WHERE id=?",
        (workout_id,),
    ).fetchone()

    if exists is None:
        return jsonify({"error": "Workout not found"}), 404

    db.execute(
        """
        UPDATE workouts
        SET
            workout_name=?,
            category=?,
            difficulty=?,
            duration=?,
            calories=?,
            workout_date=?,
            notes=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            data["workout_name"],
            data["category"],
            data["difficulty"],
            data["duration"],
            data.get("calories", 0),
            data["workout_date"],
            data.get("notes", ""),
            workout_id,
        ),
    )

    db.commit()

    updated = db.execute(
        "SELECT * FROM workouts WHERE id=?",
        (workout_id,),
    ).fetchone()

    return jsonify(
        {
            "message": "Workout updated",
            "workout": _workout_to_dict(updated),
        }
    )


@workout_api_bp.route(
    "/workouts/<int:workout_id>/complete",
    methods=["PATCH"],
)
def complete_workout(workout_id):

    db = get_db()

    row = db.execute(
        "SELECT completed FROM workouts WHERE id=?",
        (workout_id,),
    ).fetchone()

    if row is None:
        return jsonify({"error": "Workout not found"}), 404

    completed = 0 if row["completed"] else 1

    db.execute(
        """
        UPDATE workouts
        SET
            completed=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            completed,
            workout_id,
        ),
    )

    db.commit()

    updated = db.execute(
        "SELECT * FROM workouts WHERE id=?",
        (workout_id,),
    ).fetchone()

    return jsonify(
        {
            "message": "Workout updated",
            "workout": _workout_to_dict(updated),
        }
    )


@workout_api_bp.route(
    "/workouts/<int:workout_id>",
    methods=["DELETE"],
)
def delete_workout(workout_id):

    db = get_db()

    row = db.execute(
        "SELECT id FROM workouts WHERE id=?",
        (workout_id,),
    ).fetchone()

    if row is None:
        return jsonify({"error": "Workout not found"}), 404

    db.execute(
        "DELETE FROM workouts WHERE id=?",
        (workout_id,),
    )

    db.commit()

    return jsonify(
        {
            "message": "Workout deleted",
            "id": workout_id,
        }
    )