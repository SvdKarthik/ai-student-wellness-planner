const API_URL = "/api/workouts";

const workoutForm = document.getElementById("workout-form");
const workoutList = document.getElementById("workout-list");
const emptyState = document.getElementById("empty-workouts");
const loadingSpinner = document.getElementById("loading-spinner");

document.addEventListener("DOMContentLoaded", () => {
    loadWorkouts();
});

async function loadWorkouts() {

    loadingSpinner.style.display = "block";

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        renderWorkouts(data.workouts);

    } catch (error) {

        console.error(error);

        showError("Unable to load workouts.");

    }

    loadingSpinner.style.display = "none";

}

function renderWorkouts(workouts) {

    workoutList.innerHTML = "";

    if (workouts.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    workouts.forEach(workout => {

        const card = document.createElement("div");

        card.className = "col-md-6";

        card.innerHTML = `

        <div class="card shadow">

            <div class="card-body">

                <h4>${workout.workout_name}</h4>

                <p>

                    <strong>Category:</strong> ${workout.category}

                </p>

                <p>

                    <strong>Difficulty:</strong>

                    <span class="badge bg-info">

                        ${workout.difficulty}

                    </span>

                </p>

                <p>

                    <strong>Duration:</strong>

                    ${workout.duration} mins

                </p>

                <p>

                    <strong>Date:</strong>

                    ${workout.workout_date}

                </p>

                <p>

                    <strong>Status:</strong>

                    ${workout.completed
                        ? '<span class="badge bg-success">Completed</span>'
                        : '<span class="badge bg-warning">Pending</span>'}

                </p>

                <button
                    class="btn btn-success btn-sm"
                    onclick="toggleWorkout(${workout.id})">

                    ✔ Complete

                </button>

                <button
                    class="btn btn-primary btn-sm"
                    onclick="editWorkout(${workout.id})">

                    Edit

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteWorkout(${workout.id})">

                    Delete

                </button>

            </div>

        </div>

        `;

        workoutList.appendChild(card);

    });

}

workoutForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const workout = {

        workout_name: document.getElementById("workout-name").value,

        category: document.getElementById("category").value,

        difficulty: document.getElementById("difficulty").value,

        duration: parseInt(document.getElementById("duration").value),

        calories: parseInt(document.getElementById("calories").value),

        workout_date: document.getElementById("workout-date").value,

        notes: document.getElementById("notes").value

    };

    if (!workout.workout_name.trim()) {
    showError("Workout Name is required");
    return;
}

if (workout.duration <= 0) {
    showError("Duration must be greater than 0");
    return;
}

if (!workout.workout_date) {
    showError("Select Workout Date");
    return;
}

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {

            "Content-Type":"application/json"

        },

        body: JSON.stringify(workout)

    });

    if(response.ok){

        workoutForm.reset();

        showSuccess("Workout Added");

        loadWorkouts();

    }

    else{

        showError("Unable to Add Workout");

    }

});

async function deleteWorkout(id) {

    if (!confirm("Are you sure you want to delete this workout?")) {
        return;
    }

    try {

        const response = await fetch(`/api/workouts/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {

            showSuccess("Workout Deleted");

            loadWorkouts();

        } else {

            showError("Unable to delete workout.");

        }

    } catch (error) {

        console.error(error);

        showError("Server Error");

    }

}

async function toggleWorkout(id) {

    try {

        const response = await fetch(`/api/workouts/${id}/complete`, {

            method: "PATCH"

        });

        if (response.ok) {

            showSuccess("Workout Updated");

            loadWorkouts();

        } else {

            showError("Unable to update workout.");

        }

    } catch (error) {

        console.error(error);

        showError("Server Error");

    }

}

let editingWorkout = null;

async function editWorkout(id) {

    editingWorkout = id;

    const response = await fetch(API_URL);

    const data = await response.json();

    const workout = data.workouts.find(w => w.id === id);

    if (!workout) return;

    document.getElementById("edit-id").value = workout.id;

    document.getElementById("edit-workout-name").value = workout.workout_name;

    document.getElementById("edit-category").value = workout.category;

    document.getElementById("edit-difficulty").value = workout.difficulty;

    document.getElementById("edit-duration").value = workout.duration;

    document.getElementById("edit-calories").value = workout.calories;

    document.getElementById("edit-date").value = workout.workout_date;

    document.getElementById("edit-notes").value = workout.notes;

    const modal = new bootstrap.Modal(
        document.getElementById("editWorkoutModal")
    );

    modal.show();

}

document.getElementById("save-edit").addEventListener("click", async () => {

    const workout = {

        workout_name: document.getElementById("edit-workout-name").value,

        category: document.getElementById("edit-category").value,

        difficulty: document.getElementById("edit-difficulty").value,

        duration: parseInt(document.getElementById("edit-duration").value),

        calories: parseInt(document.getElementById("edit-calories").value),

        workout_date: document.getElementById("edit-date").value,

        notes: document.getElementById("edit-notes").value

    };

    const response = await fetch(`/api/workouts/${editingWorkout}`, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(workout)

    });

    if (response.ok) {

        bootstrap.Modal.getInstance(
            document.getElementById("editWorkoutModal")
        ).hide();

        showSuccess("Workout Updated");

        loadWorkouts();

    } else {

        showError("Unable to update workout.");

    }

});

function showSuccess(message) {

    document.querySelector("#successToast .toast-body").textContent = message;

    new bootstrap.Toast(
        document.getElementById("successToast")
    ).show();

}

function showError(message) {

    document.querySelector("#errorToast .toast-body").textContent = message;

    new bootstrap.Toast(
        document.getElementById("errorToast")
    ).show();

}