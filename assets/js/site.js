const CHATBOT_API_BASE =
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "http://localhost:3000"
        : "https://everlybot.dev";

const CHATBOT_HEALTH_URL = `${CHATBOT_API_BASE}/health`;

async function checkChatbotHealth() {
    try {
        const r = await fetch(CHATBOT_HEALTH_URL);
        return r.ok;
    } catch {
        return false;
    }
}

const SPAN_CLASS_RE = /^span-(?:[1-9]|1[0-2])$/;
const GITHUB_URL_RE = /^https:\/\/github\.com\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\/?$/;

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
}

function buildProjectCard(p) {
    const card = el("div", `card project-card ${SPAN_CLASS_RE.test(p.span) ? p.span : "span-4"}`);
    card.appendChild(el("h3", "project-card__title", p.title));

    const summary = el("p", "project-card__summary", p.summary);
    summary.dataset.audience = "engineer";
    const generalSummary = el("p", "project-card__summary", p.generalSummary);
    generalSummary.dataset.audience = "general";
    card.append(summary, generalSummary);

    const tags = el("div", "project-card__tags");
    tags.dataset.audience = "engineer";
    (p.tags || []).forEach((tag) => tags.appendChild(el("span", "tag", tag)));
    card.appendChild(tags);

    if (typeof p.github === "string" && GITHUB_URL_RE.test(p.github)) {
        const links = el("div", "project-card__links");
        const link = el("a", "project-card__link", "View on GitHub \u2192");
        link.href = p.github;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        links.appendChild(link);
        card.appendChild(links);
    }
    return card;
}

function renderProjects(projects, rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.replaceChildren(...projects.map(buildProjectCard));
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
        text.textContent = ok ? "Chat Online" : "Chat Offline";
    } catch {
        dot.classList.add("status-dot--down");
        text.textContent = "Chat Offline";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateStatus();
});
