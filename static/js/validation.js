/**
 * validation.js — Client-side task form validation
 */

const Validation = {
    /** Minimum and maximum character limits */
    limits: {
        titleMin: 3,
        titleMax: 100,
        descriptionMax: 500,
    },

    /**
     * Validate all task form fields.
     * @param {object} data - Form field values
     * @returns {{ valid: boolean, errors: object }} Validation result
     */
    validateTask(data) {
        const errors = {};

        // Title validation
        const title = (data.title || "").trim();
        if (!title) {
            errors.title = "Task title is required.";
        } else if (title.length < this.limits.titleMin) {
            errors.title = `Title must be at least ${this.limits.titleMin} characters.`;
        } else if (title.length > this.limits.titleMax) {
            errors.title = `Title must be under ${this.limits.titleMax} characters.`;
        }

        // Subject validation
        if (!data.subject) {
            errors.subject = "Please select a subject.";
        }

        // Priority validation
        const validPriorities = ["high", "medium", "low"];
        if (!data.priority) {
            errors.priority = "Please select a priority.";
        } else if (!validPriorities.includes(data.priority)) {
            errors.priority = "Invalid priority selected.";
        }

        // Due date validation
        if (!data.due_date) {
            errors.due_date = "Due date is required.";
        } else {
            const dueDate = new Date(data.due_date + "T23:59:59");
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dueDate < today) {
                errors.due_date = "Due date cannot be in the past.";
            }
        }

        // Description validation (optional)
        const description = (data.description || "").trim();
        if (description.length > this.limits.descriptionMax) {
            errors.description = `Description must be under ${this.limits.descriptionMax} characters.`;
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors,
        };
    },

    /**
     * Show or clear inline error messages next to form fields.
     * @param {HTMLFormElement} form - The task form element
     * @param {object} errors - Field name → error message map
     */
    showErrors(form, errors) {
        this.clearErrors(form);

        Object.entries(errors).forEach(([fieldName, message]) => {
            const field = form.querySelector(`#task-${fieldName.replace("_", "-")}`);
            if (!field) return;

            const errorEl = document.createElement("span");
            errorEl.className = "field-error";
            errorEl.setAttribute("role", "alert");
            errorEl.textContent = message;
            errorEl.style.cssText =
                "display:block;color:#ef4444;font-size:0.8rem;margin-top:0.35rem;";

            field.style.borderColor = "#ef4444";
            field.parentElement.appendChild(errorEl);
        });
    },

    /**
     * Remove all inline error messages from the form.
     * @param {HTMLFormElement} form
     */
    clearErrors(form) {
        form.querySelectorAll(".field-error").forEach((el) => el.remove());
        form.querySelectorAll("input, select, textarea").forEach((field) => {
            field.style.borderColor = "";
        });
    },
};

export default Validation;
