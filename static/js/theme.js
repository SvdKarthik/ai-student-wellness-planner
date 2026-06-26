/**
 * theme.js — Dark / light theme toggle (injected via JavaScript)
 */

const Theme = {
    storageKey: "wellness-theme",

    lightVars: {
        "--color-bg-deep": "#eef2f7",
        "--color-bg-base": "#f8fafc",
        "--color-bg-elevated": "#ffffff",
        "--color-bg-surface": "#f1f5f9",
        "--color-text-primary": "#0f172a",
        "--color-text-secondary": "#475569",
        "--color-text-muted": "#94a3b8",
        "--glass-bg": "rgba(255, 255, 255, 0.65)",
        "--glass-bg-hover": "rgba(255, 255, 255, 0.85)",
        "--glass-border": "rgba(0, 0, 0, 0.08)",
        "--glass-border-hover": "rgba(0, 0, 0, 0.15)",
        "--glass-shadow": "0 8px 32px rgba(0, 0, 0, 0.08)",
    },

    darkVars: {
        "--color-bg-deep": "#0a0a12",
        "--color-bg-base": "#0f1117",
        "--color-bg-elevated": "#161822",
        "--color-bg-surface": "#1c1e2e",
        "--color-text-primary": "#f1f5f9",
        "--color-text-secondary": "#94a3b8",
        "--color-text-muted": "#64748b",
        "--glass-bg": "rgba(255, 255, 255, 0.04)",
        "--glass-bg-hover": "rgba(255, 255, 255, 0.08)",
        "--glass-border": "rgba(255, 255, 255, 0.1)",
        "--glass-border-hover": "rgba(255, 255, 255, 0.18)",
        "--glass-shadow": "0 8px 32px rgba(0, 0, 0, 0.35)",
    },

    /**
     * Initialize theme from localStorage and inject toggle button.
     */
    init() {
        const saved = localStorage.getItem(this.storageKey) || "dark";
        this.apply(saved);
        this.injectToggle();
    },

    /**
     * Inject a theme toggle button into the sidebar header.
     */
    injectToggle() {
        const header = document.querySelector("body > header");
        if (!header || header.querySelector(".theme-toggle")) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "theme-toggle";
        btn.setAttribute("aria-label", "Toggle dark/light theme");
        btn.style.cssText = `
            margin-top:auto;padding:0.65rem 1rem;border-radius:14px;
            border:1px solid var(--glass-border);background:var(--glass-bg);
            color:var(--color-text-primary);cursor:pointer;font-size:0.85rem;
            font-weight:600;transition:transform 0.2s,box-shadow 0.2s;
        `;

        this.updateButtonLabel(btn);

        btn.addEventListener("mouseenter", () => {
            btn.style.transform = "translateY(-2px)";
            btn.style.boxShadow = "0 4px 16px rgba(99,102,241,0.2)";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.transform = "";
            btn.style.boxShadow = "";
        });

        btn.addEventListener("click", () => {
            const current = document.documentElement.dataset.theme || "dark";
            const next = current === "dark" ? "light" : "dark";
            this.apply(next);
            this.updateButtonLabel(btn);
            localStorage.setItem(this.storageKey, next);
        });

        header.appendChild(btn);
    },

    /**
     * Apply theme by setting CSS variables on :root.
     * @param {"dark"|"light"} theme
     */
    apply(theme) {
        const vars = theme === "light" ? this.lightVars : this.darkVars;
        const root = document.documentElement;

        root.dataset.theme = theme;

        Object.entries(vars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        if (theme === "light") {
            document.body.style.backgroundImage = "none";
            document.body.style.backgroundColor = "#eef2f7";
        } else {
            document.body.style.backgroundImage = "";
            document.body.style.backgroundColor = "";
        }
    },

    updateButtonLabel(btn) {
        const isDark = (document.documentElement.dataset.theme || "dark") === "dark";
        btn.textContent = isDark ? "☀ Light Mode" : "🌙 Dark Mode";
    },
};

export default Theme;
