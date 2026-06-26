/**
 * animations.js — Scroll and interaction animations via Web Animations API
 */

const Animations = {
    /**
     * Fade in and slide up an element on entry.
     * @param {HTMLElement} element
     * @param {number} delay - Delay in milliseconds
     */
    fadeInUp(element, delay = 0) {
        element.style.opacity = "0";

        element.animate(
            [
                { opacity: 0, transform: "translateY(24px)" },
                { opacity: 1, transform: "translateY(0)" },
            ],
            {
                duration: 500,
                delay,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                fill: "forwards",
            }
        );
    },

    /**
     * Fade out and remove an element.
     * @param {HTMLElement} element
     * @param {Function} onComplete
     */
    fadeOut(element, onComplete) {
        const animation = element.animate(
            [
                { opacity: 1, transform: "scale(1)" },
                { opacity: 0, transform: "scale(0.95)" },
            ],
            { duration: 300, easing: "ease-in", fill: "forwards" }
        );

        animation.onfinish = () => {
            if (onComplete) onComplete();
        };
    },

    /**
     * Brief green flash to confirm a successful action.
     * @param {HTMLElement} element
     */
    flashSuccess(element) {
        element.animate(
            [
                { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
                { boxShadow: "0 0 0 6px rgba(34,197,94,0.3)" },
                { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
            ],
            { duration: 600, easing: "ease-out" }
        );
    },

    /**
     * Shake animation for validation errors.
     * @param {HTMLElement} element
     */
    shake(element) {
        element.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-8px)" },
                { transform: "translateX(8px)" },
                { transform: "translateX(-6px)" },
                { transform: "translateX(6px)" },
                { transform: "translateX(0)" },
            ],
            { duration: 400, easing: "ease-in-out" }
        );
    },

    /**
     * Observe sections and animate them when they scroll into view.
     */
    initScrollAnimations() {
        const sections = document.querySelectorAll("main > section");
        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.fadeInUp(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        sections.forEach((section, index) => {
            section.style.opacity = "0";
            observer.observe(section);
        });
    },
};

export default Animations;
