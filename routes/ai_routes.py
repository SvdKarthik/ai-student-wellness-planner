"""
AI Routes

Handles all Gemini AI API requests.
"""

from flask import Blueprint, request, jsonify

from services.gemini_service import (
    generate_response,
    generate_study_plan,
    generate_workout_plan,
    prioritize_tasks,
    productivity_tips,
    motivation_message,
)

ai_api_bp = Blueprint("ai_api", __name__, url_prefix="/api/ai")


@ai_api_bp.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    prompt = data.get("prompt", "")

    result = generate_response(prompt)

    return jsonify(result)


@ai_api_bp.route("/study-plan", methods=["POST"])
def study_plan():

    data = request.get_json()

    subjects = data.get("subjects", "")

    available_time = data.get("available_time", "")

    result = generate_study_plan(subjects, available_time)

    return jsonify(result)


@ai_api_bp.route("/workout-plan", methods=["POST"])
def workout_plan():

    data = request.get_json()

    goal = data.get("goal", "")

    duration = data.get("duration", "")

    level = data.get("level", "")

    result = generate_workout_plan(
        goal,
        duration,
        level,
    )

    return jsonify(result)


@ai_api_bp.route("/prioritize", methods=["POST"])
def prioritize():

    data = request.get_json()

    tasks = data.get("tasks", "")

    result = prioritize_tasks(tasks)

    return jsonify(result)


@ai_api_bp.route("/productivity", methods=["GET"])
def productivity():

    result = productivity_tips()

    return jsonify(result)


@ai_api_bp.route("/motivation", methods=["GET"])
def motivation():

    result = motivation_message()

    return jsonify(result)