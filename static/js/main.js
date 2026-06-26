/**
 * main.js — Application entry point
 * Initializes all JavaScript modules when the DOM is ready.
 */

import API from "./api.js";
import Validation from "./validation.js";
import Tasks from "./tasks.js";
import Progress from "./progress.js";
import Theme from "./theme.js";
import Countdown from "./countdown.js";
import Animations from "./animations.js";

/**
 * Bootstraps every module for the current page.
 */
function initApp() {
    Theme.init();
    Animations.initScrollAnimations();
    Tasks.init();
    Progress.init();
    Countdown.init();

    console.log("AI Student Wellness Planner — JS initialized");
}

document.addEventListener("DOMContentLoaded", initApp);

// Export modules for debugging in browser console
window.WellnessApp = { API, Validation, Tasks, Progress, Theme, Countdown, Animations };
