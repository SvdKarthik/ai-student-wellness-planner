/**
 * progress.js — Fetch and update progress stats across pages
 */

import API from "./api.js";
import Animations from "./animations.js";

const Progress = {
    /**
     * Initialize progress updates on dashboard and progress pages.
     */
    init() {
        this.refresh();
        document.addEventListener("progress:updated", () => this.refresh());
    },

    /**
     * Fetch latest progress from API and update the DOM.
     */
    async refresh() {
        try {
            const data = await API.getProgress();
            this.updateDashboardSummary(data);
            this.updateProgressPage(data);
        } catch (error) {
            console.warn("Progress update failed:", error.message);
        }
    },

    /**
     * Update the dashboard daily summary section.
     * @param {object} data - Progress API response
     */
    updateDashboardSummary(data) {
        const section = document.querySelector(
            'section[aria-labelledby="daily-summary-heading"]'
        );
        if (!section) return;

        const dds = section.querySelectorAll("dd");
        if (dds.length >= 2) {
            this.animateValue(dds[0], `${data.completed} of ${data.total}`);
        }

        if (dds.length >= 3 && data.total > 0) {
            const topPending = data.pending > 0
                ? `${data.pending} task(s) remaining — ${data.completion_rate}% complete.`
                : "All tasks completed! Great work.";
            this.animateValue(dds[2], topPending);
        }
    },

    /**
     * Update the progress page weekly stats and subject table.
     * @param {object} data - Progress API response
     */
    updateProgressPage(data) {
        const statsSection = document.querySelector(
            'section[aria-labelledby="weekly-stats-heading"]'
        );
        if (!statsSection) return;

        const dds = statsSection.querySelectorAll("dd");
        if (dds.length >= 4) {
            this.animateValue(dds[0], `${data.completed} of ${data.total}`);
            this.animateValue(dds[1], `${data.completed} completed`);
            this.animateValue(dds[2], data.total > 0 ? `${data.completion_rate}%` : "0 days");
            this.animateValue(dds[3], `${data.total} total`);
        }

        this.updateSubjectTable(data.by_subject);
    },

    /**
     * Rebuild the subject progress table from API data.
     * @param {Array} subjects
     */
    updateSubjectTable(subjects) {
        const table = document.querySelector(
            'section[aria-labelledby="task-progress-heading"] tbody'
        );
        if (!table) return;

        if (subjects.length === 0) {
            table.innerHTML =
                '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No task data yet</td></tr>';
            return;
        }

        table.innerHTML = subjects
            .map(
                (s) => `
            <tr>
                <td>${this.capitalize(s.subject)}</td>
                <td>${s.completed}</td>
                <td>${s.total}</td>
                <td>${s.rate}%</td>
            </tr>
        `
            )
            .join("");

        table.querySelectorAll("tr").forEach((row, i) => {
            Animations.fadeInUp(row, i * 80);
        });
    },

    /**
     * Animate a stat value change with a brief highlight.
     * @param {HTMLElement} element
     * @param {string} newValue
     */
    animateValue(element, newValue) {
        if (element.textContent === newValue) return;

        element.style.transition = "transform 0.3s ease, color 0.3s ease";
        element.style.transform = "scale(1.1)";
        element.style.color = "#06b6d4";
        element.textContent = newValue;

        setTimeout(() => {
            element.style.transform = "scale(1)";
            element.style.color = "";
        }, 400);
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
};

export default Progress;
