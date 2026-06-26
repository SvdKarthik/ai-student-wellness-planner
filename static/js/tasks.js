/**
 * tasks.js — Task creation, rendering, deletion, and status toggling
 */

import API from "./api.js";
import Validation from "./validation.js";
import Animations from "./animations.js";

const Tasks = {
    /** CSS selector for the dashboard task list */
    taskListSelector: 'section[aria-labelledby="today-tasks-heading"] ul',

    /** CSS selector for the add-task form */
    formSelector: 'section[aria-labelledby="add-task-heading"] form',

    /**
     * Initialize task features on the current page.
     */
    init() {
        this.initAddTaskForm();
        this.initDashboard();
    },

    /**
     * Wire up the add-task form with validation and API submission.
     */
    initAddTaskForm() {
        const form = document.querySelector(this.formSelector);
        if (!form) return;

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            await this.handleCreate(form);
        });

        // Clear field errors as the user types
        form.querySelectorAll("input, select, textarea").forEach((field) => {
            field.addEventListener("input", () => {
                Validation.clearErrors(form);
            });
        });
    },

    /**
     * Validate and submit a new task to the API.
     * @param {HTMLFormElement} form
     */
    async handleCreate(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const taskData = {
            title: form.querySelector("#task-title").value,
            subject: form.querySelector("#task-subject").value,
            priority: form.querySelector("#task-priority").value,
            due_date: form.querySelector("#task-due-date").value,
            description: form.querySelector("#task-description").value,
            workout_reminder: form.querySelector("#workout-reminder").checked,
        };

        const result = Validation.validateTask(taskData);
        if (!result.valid) {
            Validation.showErrors(form, result.errors);
            Animations.shake(form);
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Adding...";

            await API.createTask(taskData);

            submitBtn.textContent = "Task Added!";
            Animations.flashSuccess(form);

            setTimeout(() => {
                window.location.assign("/dashboard");
            }, 800);
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            this.showToast(error.message, "error");
        }
    },

    /**
     * Load and render tasks on the dashboard page.
     */
    async initDashboard() {
        const taskList = document.querySelector(this.taskListSelector);
        if (!taskList) return;

        try {
            const data = await API.getTasks();
            this.renderTaskList(taskList, data.tasks);
        } catch (error) {
            this.showToast("Could not load tasks.", "error");
        }
    },

    /**
     * Render task cards into the dashboard list.
     * @param {HTMLUListElement} container
     * @param {Array} tasks
     */
    renderTaskList(container, tasks) {
        container.innerHTML = "";

        if (tasks.length === 0) {
            const emptyItem = document.createElement("li");
            emptyItem.innerHTML =
                '<p style="color:#94a3b8;padding:1rem;">No tasks yet. Add your first task!</p>';
            container.appendChild(emptyItem);
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.dataset.taskId = task.id;

            const isCompleted = task.status === "completed";
            const subjectLabel = this.formatSubject(task.subject);

            li.innerHTML = `
                <article>
                    <h3>${this.escapeHtml(task.title)}</h3>
                    <p>Subject: ${subjectLabel}</p>
                    <p>Priority: ${this.capitalize(task.priority)}</p>
                    <p>Status: ${this.capitalize(task.status)}</p>
                    <p>Due: ${task.due_date}</p>
                    <div class="task-actions" style="display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap;"></div>
                </article>
            `;

            const actions = li.querySelector(".task-actions");

            // Toggle complete button
            const toggleBtn = document.createElement("button");
            toggleBtn.type = "button";
            toggleBtn.textContent = isCompleted ? "Mark Pending" : "Mark Complete";
            toggleBtn.style.cssText = this.buttonStyle(isCompleted ? "#64748b" : "#22c55e");
            toggleBtn.addEventListener("click", () => this.handleToggle(task.id, isCompleted, li));

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";
            deleteBtn.style.cssText = this.buttonStyle("#ef4444");
            deleteBtn.addEventListener("click", () => this.handleDelete(task.id, li));

            actions.appendChild(toggleBtn);
            actions.appendChild(deleteBtn);
            container.appendChild(li);

            Animations.fadeInUp(li, index * 100);
        });
    },

    /**
     * Toggle a task between pending and completed.
     */
    async handleToggle(taskId, isCompleted, listItem) {
        const newStatus = isCompleted ? "pending" : "completed";

        try {
            await API.updateTaskStatus(taskId, newStatus);
            Animations.flashSuccess(listItem);
            await this.initDashboard();
            document.dispatchEvent(new CustomEvent("progress:updated"));
        } catch (error) {
            this.showToast(error.message, "error");
        }
    },

    /**
     * Delete a task after user confirmation.
     */
    async handleDelete(taskId, listItem) {
        const confirmed = confirm("Are you sure you want to delete this task?");
        if (!confirmed) return;

        try {
            Animations.fadeOut(listItem, async () => {
                await API.deleteTask(taskId);
                listItem.remove();
                document.dispatchEvent(new CustomEvent("progress:updated"));
                this.showToast("Task deleted.", "success");

                const taskList = document.querySelector(this.taskListSelector);
                if (taskList && taskList.children.length === 0) {
                    await this.initDashboard();
                }
            });
        } catch (error) {
            this.showToast(error.message, "error");
        }
    },

    /** Inline button styles (no CSS file changes) */
    buttonStyle(color) {
        return `
            padding:0.4rem 0.85rem;font-size:0.78rem;font-weight:600;
            border:none;border-radius:8px;cursor:pointer;color:#fff;
            background:${color};transition:opacity 0.2s,transform 0.2s;
        `;
    },

    formatSubject(value) {
        return this.capitalize(value.replace(/-/g, " "));
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Show a temporary toast notification (injected via JS).
     */
    showToast(message, type = "info") {
        const colors = {
            success: "#22c55e",
            error: "#ef4444",
            info: "#6366f1",
        };

        const toast = document.createElement("div");
        toast.setAttribute("role", "status");
        toast.textContent = message;
        toast.style.cssText = `
            position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
            padding:0.85rem 1.25rem;border-radius:12px;color:#fff;
            font-size:0.875rem;font-weight:600;
            background:${colors[type] || colors.info};
            box-shadow:0 8px 24px rgba(0,0,0,0.35);
            transform:translateY(20px);opacity:0;
            transition:transform 0.3s ease,opacity 0.3s ease;
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = "translateY(0)";
            toast.style.opacity = "1";
        });

        setTimeout(() => {
            toast.style.transform = "translateY(20px)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
};

export default Tasks;
