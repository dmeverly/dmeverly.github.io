window.CHATBOT_API_BASE =
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "http://localhost:3000"
        : "https://everlybot.dev";

window.CHATBOT_API_URL = `${window.CHATBOT_API_BASE}/api/chat`;
window.CHATBOT_HEALTH_URL = `${window.CHATBOT_API_BASE}/health`;

async function checkChatbotHealth() {
    try {
        const r = await fetch(window.CHATBOT_HEALTH_URL);
        return r.ok;
    } catch {
        return false;
    }
}

async function updateStatus() {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    if (!dot || !text) return;

    const ok = await checkChatbotHealth();
    dot.classList.toggle("status-dot--ok", ok);
    dot.classList.toggle("status-dot--down", !ok);
    text.textContent = ok ? "Online" : "Offline";
}

document.addEventListener("DOMContentLoaded", updateStatus);

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
            <div class="project-card__tags">${renderTagPills(p.tags)}</div>
        </div>
    `).join("");
}
