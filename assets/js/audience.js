(() => {
    const STORAGE_KEY = "audienceMode";
    const DEFAULT = "engineer";
    const MODES = ["engineer", "general"];

    function apply(mode) {
        const html = document.documentElement;
        html.classList.remove("audience-engineer", "audience-general");
        html.classList.add(`audience-${mode}`);

        document.querySelectorAll("[data-audience-btn]").forEach((btn) => {
            const isActive = btn.dataset.audienceBtn === mode;
            btn.classList.toggle("btn-primary", isActive);
            btn.classList.toggle("btn-ghost", !isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });
    }

    function init() {
        let saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (_) {
            // Storage can be blocked; fall back to the default.
        }
        const mode = saved === "general" ? "general" : DEFAULT;
        apply(mode);

        document.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-audience-btn]");
            if (!btn) return;

            const mode = btn.dataset.audienceBtn;
            if (!MODES.includes(mode)) return;
            try {
                localStorage.setItem(STORAGE_KEY, mode);
            } catch (_) {
                // Storage can be blocked; the choice still applies for this page view.
            }
            apply(mode);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
