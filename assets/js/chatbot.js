(() => {
    const CHATBOT_MOCK_MODE = false;

    const API_URL =
        window.CHATBOT_API_URL ||
        ((location.hostname === "localhost" || location.hostname === "127.0.0.1")
            ? "http://localhost:3000/api/chat"
            : "https://everlybot.dev/api/chat");

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
        const nudge = document.getElementById("chatbot-nudge");


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

        function snapFabHome() {
            root.style.transition = "transform 120ms ease";
            root.style.transform = "scale(0.96)";

            root.style.left = "auto";
            root.style.top = "auto";
            root.style.right = "20px";
            root.style.bottom = "20px";

            setTimeout(() => {
                root.style.transform = "";
            }, 120);
        }


        function clampPanelIntoViewport() {
            const panel = document.getElementById("chatbot-panel");
            if (!panel) return;

            const wasHidden = panel.style.display === "none" || getComputedStyle(panel).display === "none";
            if (wasHidden) panel.style.display = "flex";

            const rectRoot = root.getBoundingClientRect();
            const rectPanel = panel.getBoundingClientRect();

            const padding = 8;

            let left = rectRoot.left;
            let top = rectRoot.top;

            const panelLeft = rectPanel.left;
            const panelRight = rectPanel.right;
            const panelTop = rectPanel.top;
            const panelBottom = rectPanel.bottom;

            if (panelLeft < padding) {
                left += (padding - panelLeft);
            }
            if (panelRight > window.innerWidth - padding) {
                left -= (panelRight - (window.innerWidth - padding));
            }

            if (panelTop < padding) {
                top += (padding - panelTop);
            }
            if (panelBottom > window.innerHeight - padding) {
                top -= (panelBottom - (window.innerHeight - padding));
            }

            const maxLeft = window.innerWidth - root.offsetWidth - padding;
            const maxTop = window.innerHeight - root.offsetHeight - padding;

            left = Math.max(padding, Math.min(maxLeft, left));
            top = Math.max(padding, Math.min(maxTop, top));

            root.style.left = `${left}px`;
            root.style.top = `${top}px`;
            root.style.right = "auto";
            root.style.bottom = "auto";

            if (wasHidden) panel.style.display = "none";
        }


        function setOpen(open) {
            isOpen = open;
            root.classList.toggle("chatbot--open", open);
            fab.setAttribute("aria-expanded", String(open));

            if (open) {
                clampPanelIntoViewport();
                setTimeout(() => input.focus(), 0);
                scrollToBottom();
            }

            if (open && nudge) {
                nudge.classList.remove("is-visible");
            }
        }

        function initDraggableFab() {
            const finePointer = window.matchMedia?.("(pointer: fine)").matches;
            if (!finePointer) return;

            fab.classList.add("is-draggable");

            let dragging = false;
            let didDrag = false;

            let offsetX = 0;
            let offsetY = 0;

            let downX = 0;
            let downY = 0;

            const DRAG_THRESHOLD = 6;

            function ensureLeftTopAnchoring() {
                const rect = root.getBoundingClientRect();
                root.style.left = `${rect.left}px`;
                root.style.top = `${rect.top}px`;
                root.style.right = "auto";
                root.style.bottom = "auto";
            }

            function clamp(v, min, max) {
                return Math.max(min, Math.min(max, v));
            }

            function onPointerDown(e) {
                if (e.button !== undefined && e.button !== 0) return;

                ensureLeftTopAnchoring();

                const rect = root.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                downX = e.clientX;
                downY = e.clientY;

                dragging = true;
                didDrag = false;

                e.preventDefault();

                try {
                    fab.setPointerCapture(e.pointerId);
                } catch (_) {
                }

                e.stopPropagation();
            }

            function onPointerMove(e) {
                if (!dragging) return;

                const dx = Math.abs(e.clientX - downX);
                const dy = Math.abs(e.clientY - downY);

                if (!didDrag && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
                    didDrag = true;
                }
                if (!didDrag) return;

                const nextLeft = e.clientX - offsetX;
                const nextTop = e.clientY - offsetY;

                const pad = 8;
                const maxLeft = window.innerWidth - root.offsetWidth - pad;
                const maxTop = window.innerHeight - root.offsetHeight - pad;

                root.style.left = `${clamp(nextLeft, pad, maxLeft)}px`;
                root.style.top = `${clamp(nextTop, pad, maxTop)}px`;

                e.preventDefault();
                e.stopPropagation();
            }

            function onPointerUp(e) {
                if (!dragging) return;
                dragging = false;

                if (didDrag) {
                    fab.dataset.suppressClick = "1";
                    setTimeout(() => delete fab.dataset.suppressClick, 250);
                }

                e.stopPropagation();
            }

            fab.addEventListener("pointerdown", onPointerDown);
            fab.addEventListener("pointermove", onPointerMove);
            fab.addEventListener("pointerup", onPointerUp);
            fab.addEventListener("pointercancel", onPointerUp);
        }


        function initNudge() {
            if (!nudge) return;
            if (sessionStorage.getItem("chatbotNudgeSeen") === "1") return;

            const SHOW_DELAY = 6000;
            const HIDE_AFTER = 12000;

            setTimeout(() => {
                if (isOpen) return;
                nudge.classList.add("is-visible");
                sessionStorage.setItem("chatbotNudgeSeen", "1");

                setTimeout(() => {
                    nudge.classList.remove("is-visible");
                }, HIDE_AFTER);
            }, SHOW_DELAY);
        }


        function addMessage(role, text) {
            const normalized =
                role === "user" ? "user" :
                    "bot";

            const wrapper = document.createElement("div");
            wrapper.className = "chatbot__msg " + (normalized === "user"
                ? "chatbot__msg--user"
                : "chatbot__msg--bot");

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
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({message: String(userText)}),
                });

                const json = await res.json().catch(() => ({}));

                if (!res.ok) {
                    const errMsg =
                        (json && typeof json.error === "string" && json.error) ||
                        `Request failed (${res.status}).`;
                    addMessage("bot", errMsg);
                    setStatus("Offline");
                    return;
                }

                const reply =
                    (json && typeof json.content === "string" && json.content) ||
                    (json && typeof json.error === "string" && json.error) ||
                    "No content returned.";

                addMessage("bot", reply);
                setStatus("Online");
            } catch (e) {
                addMessage("bot", "Chatbot is currently offline.");
                setStatus("Offline");
            }
        }

        setStatus(CHATBOT_MOCK_MODE ? "Online" : "Offline");

        window.addEventListener("resize", () => {
            snapFabHome();

            if (isOpen) {
                clampPanelIntoViewport();
            }
        });


        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) clampPanelIntoViewport();
        });

        fab.addEventListener("dblclick", (e) => {
            e.preventDefault();
            e.stopPropagation();
            snapFabHome();
            if (isOpen) clampPanelIntoViewport();
        });

        function toggleChatbot(e) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!isOpen);
        }

        fab.addEventListener("pointerup", (e) => {
            if (e.pointerType === "touch") toggleChatbot(e);
        });

        fab.addEventListener("click", (e) => {
            if (fab.dataset.suppressClick === "1") return;
            toggleChatbot(e);
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

        initDraggableFab();
        initNudge();
        console.log("[chatbot] initialized", {API_URL});
    });
})();
