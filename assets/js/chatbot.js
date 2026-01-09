(() => {
    const CHATBOT_MOCK_MODE = false;
    const API_URL = window.CHATBOT_API_URL || "/api/chat";

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(() => {
        const root = document.getElementById("chatbot");
        const fab = document.getElementById("chatbot-fab");
        const closeBtn = document.getElementById("chatbot-close");
        const form = document.getElementById("chatbot-form");
        const input = document.getElementById("chatbot-input");
        const messages = document.getElementById("chatbot-messages");
        const statusEl = document.getElementById("chatbot-status");

        if (!root || !fab || !closeBtn || !form || !input || !messages) {
            console.error("[chatbot] Missing required DOM elements", {
                root: !!root,
                fab: !!fab,
                closeBtn: !!closeBtn,
                form: !!form,
                input: !!input,
                messages: !!messages,
            });
            return;
        }

        let isOpen = false;

        function escapeHtml(str = "") {
            return String(str)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }

        function scrollToBottom() {
            messages.scrollTop = messages.scrollHeight;
        }

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
        }

        function setOpen(open) {
            isOpen = open;
            root.classList.toggle("chatbot--open", open);
            fab.setAttribute("aria-expanded", String(open));

            if (open) {
                setTimeout(() => input.focus(), 0);
                scrollToBottom();
            }
        }

        function addMessage(role, text) {
            const wrapper = document.createElement("div");
            wrapper.className =
                "chatbot__msg " + (role === "user" ? "chatbot__msg--user" : "chatbot__msg--bot");

            const bubble = document.createElement("div");
            bubble.className = "chatbot__bubble";
            bubble.innerHTML = escapeHtml(text);

            wrapper.appendChild(bubble);
            messages.appendChild(wrapper);
            scrollToBottom();
        }

        async function send(userText) {
            if (CHATBOT_MOCK_MODE) {
                await new Promise((r) => setTimeout(r, 200));
                addMessage("bot", `Mock reply: "${userText}"\n\n(Backend not connected yet.)`);
                return;
            }

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userText }),
                });
                if (!res.ok) throw new Error("Bad response");
                const json = await res.json();
                const reply =
                    (json && typeof json.content === "string" && json.content) ||
                    (json && typeof json.response === "string" && json.response) ||
                    (json && typeof json.reply === "string" && json.reply) ||
                    (json && typeof json.message === "string" && json.message) ||
                    (json && typeof json.output === "string" && json.output) ||
                    "No response field returned.";
                addMessage("bot", reply);
            } catch (e) {
                addMessage("bot", "Chatbot is currently offline.");
                setStatus("Offline");
            }
        }

        setStatus(CHATBOT_MOCK_MODE ? "Online" : "Offline");

        fab.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!isOpen);
        });

        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
        });

        document.addEventListener("keydown", (e) => {
            if (!isOpen) return;
            if (e.key === "Escape") setOpen(false);
        });

        document.addEventListener("click", (e) => {
            if (!isOpen) return;
            if (!root.contains(e.target)) setOpen(false);
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            addMessage("user", text);
            input.value = "";
            await send(text);
        });

        console.log("[chatbot] initialized");
    });
})();
