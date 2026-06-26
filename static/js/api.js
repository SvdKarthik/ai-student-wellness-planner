/**
 * api.js — Fetch wrapper for Flask REST API calls
 */

const API = {
    baseUrl: "",

    /**
     * Send a request to the backend API.
     * @param {string} endpoint - API path (e.g. "/api/tasks")
     * @param {object} options - fetch options
     * @returns {Promise<object>} Parsed JSON response
     */
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Request failed (${response.status})`);
        }

        return data;
    },

    /** GET /api/tasks — fetch all tasks */
    getTasks() {
        return this.request("/api/tasks");
    },

    /** POST /api/tasks — create a new task */
    createTask(taskData) {
        return this.request("/api/tasks", {
            method: "POST",
            body: JSON.stringify(taskData),
        });
    },

    /** DELETE /api/tasks/:id — remove a task */
    deleteTask(taskId) {
        return this.request(`/api/tasks/${taskId}`, {
            method: "DELETE",
        });
    },

    /** PATCH /api/tasks/:id — update task status */
    updateTaskStatus(taskId, status) {
        return this.request(`/api/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        });
    },

    /** GET /api/progress — fetch progress statistics */
    getProgress() {
        return this.request("/api/progress");
    },
};

export default API;
