document.addEventListener("DOMContentLoaded", function () {
  // Sidebar logic
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('#sidebar');
  const checkbox = document.querySelector('#sidebar-checkbox');
  const emToPx = em => em * 16;

  if (checkbox && window.innerWidth >= emToPx(30)) {
    checkbox.checked = true;
  }

  document.addEventListener('click', function (e) {
    const target = e.target;
    if (!checkbox.checked ||
        sidebar.contains(target) ||
        target === checkbox || target === toggle) return;
    checkbox.checked = false;
  });

  // Modal logic
  const modal = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-content");
  const modalLink = document.getElementById("modal-link");
  const modalTitle = document.getElementById("modal-title");
  const closeModal = document.getElementById("modal-close");

  document.querySelectorAll(".open-modal").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      modal.style.display = "flex";
      modalTitle.textContent = this.dataset.title || "";
      modalContent.innerHTML = "<p style='text-align:center;'>Loading…</p>";
      modalLink.href = this.dataset.url;

      fetch(this.dataset.url)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const content = doc.querySelector(".post, main, article");
          modalContent.innerHTML = content ? content.innerHTML : "<p>Could not load content.</p>";
        })
        .catch(err => {
          modalContent.innerHTML = "<p>Error loading project content.</p>";
          console.error("Modal fetch error:", err);
        });
    });
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
