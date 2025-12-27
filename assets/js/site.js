const CHATBOT_API_BASE =
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "http://localhost:8080"
        : "";

const CHATBOT_CHAT_URL = `${CHATBOT_API_BASE}/api/chat`;
const CHATBOT_HEALTH_URL = `${CHATBOT_API_BASE}/health`;

async function sendChatRequest(userQuery) {
    const r = await fetch(CHATBOT_CHAT_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({userQuery})
    });

    if (!r.ok) {
        throw new Error(`Chat request failed: ${r.status}`);
    }

    return await r.json(); // { response: "..." }
}

async function checkChatbotHealth() {
    try {
        const r = await fetch(CHATBOT_HEALTH_URL);
        return r.ok;
    } catch {
        return false;
    }
}


function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderTagPills(tags = []) {
    return tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
}

function renderProjects(projects, rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    root.innerHTML = projects.map(p => `
        <div class="card project-card ${escapeHtml(p.span || "")}">
            <h3 class="project-card__title">${escapeHtml(p.title)}</h3>
            <p class="project-card__summary">${escapeHtml(p.summary)}</p>

            <div class="project-card__tags">
                ${renderTagPills(p.tags)}
            </div>

            ${p.github ? `
                <div class="project-card__links">
                    <a href="${escapeHtml(p.github)}"
                       target="_blank"
                       rel="noopener"
                       class="project-card__link">
                        View on GitHub →
                    </a>
                </div>
            ` : ""}
        </div>
    `).join("");
}


document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) {
                e.target.classList.add("in-view");
                obs.unobserve(e.target);
            }
        }
    }, {threshold: 0.18});

    items.forEach(el => obs.observe(el));
    const spotlight = PROJECTS.filter(p => p.spotlight);
    const rest = PROJECTS.filter(p => !p.spotlight);

    renderProjects(spotlight, "spotlight-grid");
    renderProjects(rest, "projects-grid");
});

async function updateStatus() {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    if (!dot || !text) return;

    try {
        const ok = await checkChatbotHealth();

        dot.classList.toggle("status-dot--ok", ok);
        dot.classList.toggle("status-dot--down", !ok);
        text.textContent = ok ? "Online" : "Offline";
    } catch {
        dot.classList.add("status-dot--down");
        text.textContent = "Offline";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    updateStatus();
});
