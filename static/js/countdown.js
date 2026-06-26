/**
 * countdown.js — Countdown timer to nearest task due date or end of day
 */

import API from "./api.js";

const Countdown = {
    intervalId: null,

    /**
     * Initialize countdown on the dashboard page.
     */
    init() {
        const dashboardHeader = document.querySelector(
            'section[aria-labelledby="dashboard-heading"] header'
        );
        if (!dashboardHeader) return;

        this.injectTimer(dashboardHeader);
        this.start();
    },

    /**
     * Inject countdown display element into the dashboard header.
     * @param {HTMLElement} container
     */
    injectTimer(container) {
        if (container.querySelector(".countdown-timer")) return;

        const timer = document.createElement("div");
        timer.className = "countdown-timer";
        timer.setAttribute("role", "timer");
        timer.setAttribute("aria-live", "polite");
        timer.style.cssText = `
            margin-top:1rem;padding:0.85rem 1.25rem;border-radius:14px;
            background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);
            font-family:monospace;font-size:0.9rem;color:#06b6d4;
        `;
        timer.innerHTML = `
            <span style="font-family:inherit;font-weight:600;color:var(--color-text-secondary);margin-right:0.5rem;">
                ⏱ Next deadline:
            </span>
            <span class="countdown-value">Loading...</span>
        `;

        container.appendChild(timer);
    },

    /**
     * Start the countdown interval (updates every second).
     */
    start() {
        this.tick();
        this.intervalId = setInterval(() => this.tick(), 1000);
    },

    /**
     * Calculate and display the countdown.
     */
    async tick() {
        const valueEl = document.querySelector(".countdown-value");
        if (!valueEl) return;

        let targetDate = await this.getNearestDeadline();

        if (!targetDate) {
            targetDate = this.getEndOfDay();
        }

        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            valueEl.textContent = "Deadline reached!";
            valueEl.style.color = "#ef4444";
            return;
        }

        valueEl.style.color = "#06b6d4";
        valueEl.textContent = this.formatDuration(diff);
    },

    /**
     * Find the nearest pending task due date from the API.
     * @returns {Date|null}
     */
    async getNearestDeadline() {
        try {
            const data = await API.getTasks();
            const pending = data.tasks
                .filter((t) => t.status === "pending")
                .map((t) => new Date(t.due_date + "T23:59:59"))
                .filter((d) => d > new Date())
                .sort((a, b) => a - b);

            return pending.length > 0 ? pending[0] : null;
        } catch {
            return null;
        }
    },

    /** Get tonight at 11:59 PM as fallback countdown target. */
    getEndOfDay() {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
    },

    /**
     * Format milliseconds into HH:MM:SS string.
     * @param {number} ms
     * @returns {string}
     */
    formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [hours, minutes, seconds]
            .map((n) => String(n).padStart(2, "0"))
            .join(":");
    },

    /** Stop the countdown interval (cleanup). */
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
};

export default Countdown;
