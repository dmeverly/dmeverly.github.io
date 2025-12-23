---
layout: page
title: Interactive Portfolio Chatbot
sidebar_category: Hire Me!
order: 1
---

<style>
  .portfolio-chat-section {
    margin-top: 1.5rem;
  }

  .portfolio-chat-intro {
    font-size: 1.05rem;
    color: #444;
    margin-bottom: 1rem;
  }

  .portfolio-chat-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .portfolio-chat-window {
    border: 1px solid var(--accent, #5BA386);
    border-radius: 12px;
    background: #fafafa;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .portfolio-chat-messages {
    max-height: 420px;
    overflow-y: auto;
    padding-right: 0.25rem;
  }

  .portfolio-chat-message {
    margin-bottom: 0.75rem;
    line-height: 1.5;
    font-size: 0.95rem;
    display: flex;
  }

  .portfolio-chat-message p {
    margin: 0;
  }

  .portfolio-chat-message.agent {
    justify-content: flex-start;
  }

  .portfolio-chat-message.agent p {
    background: rgba(91, 163, 134, 0.1); /* soft green tint */
    border-left: 3px solid var(--accent, #5BA386);
    border-radius: 10px;
    padding: 0.5rem 0.75rem;
  }

  .portfolio-chat-message.user {
    justify-content: flex-end;
  }

  .portfolio-chat-message.user p {
    background: var(--accent, #5BA386);
    color: #fff;
    border-radius: 10px;
    padding: 0.5rem 0.75rem;
  }

  .portfolio-chat-meta {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-bottom: 0.15rem;
  }

  .portfolio-chat-input-row {
    margin-top: 0.25rem;
  }

  .portfolio-chat-form {
    display: flex;
    gap: 0.5rem;
  }

  .portfolio-chat-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    border: 1px solid #ccc;
    font-size: 0.95rem;
  }

  .portfolio-chat-input:focus {
    outline: none;
    border-color: var(--accent, #5BA386);
    box-shadow: 0 0 0 2px rgba(91, 163, 134, 0.2);
  }

  .portfolio-chat-send {
    border-radius: 999px;
    padding: 0.5rem 1.1rem;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    background: var(--accent, #5BA386);
    color: #fff;
    transition: background 0.15s ease-in-out, transform 0.05s ease-in-out;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .portfolio-chat-send:hover {
    background: #4a8c72; /* link-hover tone */
  }

  .portfolio-chat-send:active {
    transform: translateY(1px);
  }

  .portfolio-chat-status {
    font-size: 0.85rem;
    color: #666;
    min-height: 1.2em;
  }

  .portfolio-chat-error {
    color: #b00020;
  }

  @media (max-width: 600px) {
    .portfolio-chat-form {
      flex-direction: column;
      align-items: stretch;
    }

    .portfolio-chat-send {
      justify-content: center;
      width: 100%;
    }
  }
</style>

<div class="section portfolio-chat-section">
  <div class="section-divider"></div>

  <div class="portfolio-chat-container">
    <h2>Interactive Portfolio Chatbot</h2>

    <p class="portfolio-chat-intro">
      This is the SynapSys portfolio agent. Ask it about my background, clinical experience,
      AI and security projects, or how I approach systems design. It’s powered by my own
      backend, not a generic hosted chatbot.
    </p>

    <div class="portfolio-chat-window" aria-label="Portfolio chatbot" role="region">
      <div id="portfolio-chat-messages" class="portfolio-chat-messages">
        <div class="portfolio-chat-message agent">
          <p>
            Hi, I’m David’s portfolio agent. 👋<br>
            You can ask me about his experience, projects, or how he approaches AI systems
            and clinical workflows. What would you like to talk about?
          </p>
        </div>
      </div>

      <div class="portfolio-chat-input-row">
        <form id="portfolio-chat-form" class="portfolio-chat-form" autocomplete="off">
          <input
            id="portfolio-chat-input"
            class="portfolio-chat-input"
            type="text"
            name="question"
            placeholder="Ask about my experience, projects, or background..."
            aria-label="Ask the portfolio chatbot a question"
            required
          >
          <button type="submit" class="portfolio-chat-send">
            <span>Send</span>
            <i class="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>

      <div id="portfolio-chat-status" class="portfolio-chat-status"></div>
    </div>

  </div>
</div>

<script>
  (function() {
     // Your Spring Boot endpoint const API_URL = '/api/portfolio/ask';
    const API_URL = 'http://localhost:8080/api/portfolio/ask';

    const form = document.getElementById('portfolio-chat-form');
    const input = document.getElementById('portfolio-chat-input');
    const messagesEl = document.getElementById('portfolio-chat-messages');
    const statusEl = document.getElementById('portfolio-chat-status');

    // We'll keep a simple array of previous messages (both sides) as plain strings
    const previousMessages = [];

    function appendMessage(text, sender) {
      const wrapper = document.createElement('div');
      wrapper.className = 'portfolio-chat-message ' + sender;

      const bubble = document.createElement('p');
      bubble.textContent = text;

      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendQuestion(question) {
      statusEl.textContent = 'Thinking...';

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: question,
            previousMessages: previousMessages
          })
        });

        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();
        const answerText = data.answer || '[No answer field in response]';

        // Record and display the agent answer
        previousMessages.push('assistant: ' + answerText);
        appendMessage(answerText, 'agent');
      } catch (err) {
        console.error(err);
        statusEl.innerHTML = '<span class="portfolio-chat-error">Sorry — I couldn’t reach the portfolio agent. Please try again in a moment.</span>';
      } finally {
        setTimeout(function () {
          if (!statusEl.classList.contains('portfolio-chat-error')) {
            statusEl.textContent = '';
          }
        }, 2000);
      }
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const question = input.value.trim();
      if (!question) return;

      // Record and display user message
      previousMessages.push('user: ' + question);
      appendMessage(question, 'user');
      input.value = '';
      input.focus();

      statusEl.textContent = '';
      statusEl.classList.remove('portfolio-chat-error');

      sendQuestion(question);
    });
  })();
</script>

