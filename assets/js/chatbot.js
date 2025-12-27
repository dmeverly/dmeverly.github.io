(() => {
    const CHATBOT_MOCK_MODE = false;

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
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

    ready(() => {
        const root = document.getElementById("chatbot");
        const fab = document.getElementById("chatbot-fab");
        const closeBtn = document.getElementById("chatbot-close");
        const form = document.getElementById("chatbot-form");
        const input = document.getElementById("chatbot-input");
        const messages = document.getElementById("chatbot-messages");
        const statusEl = document.getElementById("chatbot-status"); // optional

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
                setStatus("Online");
                await new Promise((r) => setTimeout(r, 200));
                addMessage("bot", `Mock reply: "${userText}"\n\n(Backend not connected yet.)`);
                return;
            }

            try {
                setStatus("Thinking…");
                const result = await sendChatRequest(userText); // from site.js (global)
                addMessage("bot", result?.response ?? "(empty response)");
                setStatus("Online");
            } catch (e) {
                addMessage("bot", "Chatbot is currently offline.");
                setStatus("Offline");
                console.error(e);
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
