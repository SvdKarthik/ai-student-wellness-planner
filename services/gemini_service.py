"""
Google Gemini AI Service

Handles:
- Chat
- Study Planner
- Workout Planner
- Task Prioritization
- Productivity Suggestions
- Motivation Messages
"""

import os

import google.generativeai as genai

from config import Config


# -----------------------------------
# Configure Gemini
# -----------------------------------

API_KEY = Config.GEMINI_API_KEY

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file.")

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


# -----------------------------------
# Generic AI Response
# -----------------------------------

def generate_response(prompt):
    """
    Generate a response from Gemini.
    """

    if not prompt.strip():
        return {
            "success": False,
            "response": "Prompt cannot be empty."
        }

    try:

        response = model.generate_content(prompt)

        return {
            "success": True,
            "response": response.text
        }

    except Exception as e:

        return {
            "success": False,
            "response": str(e)
        }
    
def generate_study_plan(subjects, available_time):
    prompt = f"""
    You are an AI Study Planner.

    Subjects:
    {subjects}

    Available Time:
    {available_time}

    Create a well-balanced study schedule with breaks.
    """

    return generate_response(prompt)


def generate_workout_plan(goal, duration, level):
    prompt = f"""
    Create a home workout plan.

    Goal:
    {goal}

    Duration:
    {duration}

    Fitness Level:
    {level}

    Include warm-up, exercises and cool-down.
    """

    return generate_response(prompt)


def prioritize_tasks(tasks):
    prompt = f"""
    Prioritize the following tasks based on urgency and importance.

    Tasks:
    {tasks}

    Return the tasks in priority order with explanations.
    """

    return generate_response(prompt)


def productivity_tips():
    prompt = """
    Give five productivity tips for a college student balancing
    studies and fitness.
    """

    return generate_response(prompt)


def motivation_message():
    prompt = """
    Give a short motivational message for a student.
    """

    return generate_response(prompt)    