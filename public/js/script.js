document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('#sidebar');
  const checkbox = document.querySelector('#sidebar-checkbox');
  const emToPx = em => em * 16;

  if (checkbox && window.innerWidth >= emToPx(30)) {
    checkbox.checked = true;
  }

  document.addEventListener('click', function(e) {
    const target = e.target;
    if (!checkbox.checked ||
        sidebar.contains(target) ||
        (target === checkbox || target === toggle)) return;
    checkbox.checked = false;
  });

  // --- Modal Logic ---
  const modal = document.getElementById("modal-overlay");
  const modalContent = document.getElementById("modal-content");
  const modalLink = document.getElementById("modal-link");
  const closeModal = document.getElementById("modal-close");

  document.querySelectorAll(".open-modal").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      modalContent.innerHTML = "<p style='text-align:center;'>Loading...</p>";
      modalLink.href = this.dataset.url;
      document.getElementById("modal-title").textContent = this.dataset.title || "";
      modal.style.display = "flex";

      fetch(this.dataset.url)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const content = doc.querySelector(".post") || doc.querySelector("main") || doc.querySelector("article");
          modalContent.innerHTML = content ? content.innerHTML : "<p>Could not load content.</p>";
        })
        .catch(err => {
          modalContent.innerHTML = "<p>Error loading project content.</p>";
          console.error("Modal fetch error:", err);
        });
    });
  });

  closeModal.onclick = () => modal.style.display = "none";
  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };
});
