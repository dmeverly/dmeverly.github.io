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
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-overlay");
  const contentEl = document.getElementById("modal-content");
  const linkEl = document.getElementById("modal-link");
  const closeEl = document.getElementById("modal-close");

  document.querySelectorAll(".open-modal").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const url = a.dataset.url;
      linkEl.href = url;
      modal.style.display = "flex";
      contentEl.innerHTML = "<p>Loading…</p>";

      fetch(url)
        .then(r => r.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const c = doc.querySelector(".post, main, article");
          contentEl.innerHTML = c ? c.innerHTML : "<p>Can't load content</p>";
        });
    });
  });

  closeEl.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });
});


  closeModal.onclick = () => modal.style.display = "none";
  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };
});
