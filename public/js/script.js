document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('#sidebar');
  const checkbox = document.querySelector('#sidebar-checkbox');
  const emToPx = em => em * 16;

  // Auto-open sidebar if wide enough
  if (checkbox && window.innerWidth >= emToPx(30)) {
    checkbox.checked = true;
  }

  // Close sidebar on outside click
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (!checkbox.checked ||
        sidebar.contains(target) ||
        (target === checkbox || target === toggle)) return;

    checkbox.checked = false;
  });

  // --- Modal Logic ---
  const modal = document.getElementById("modal-overlay");
  const modalTitle = document.getElementById("modal-title");
  const modalSummary = document.getElementById("modal-summary");
  const modalLink = document.getElementById("modal-link");
  const closeModal = document.getElementById("modal-close");

  document.querySelectorAll(".open-modal").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent reload
      modalTitle.textContent = this.dataset.title;
      modalSummary.textContent = this.dataset.summary;
      modalLink.href = this.dataset.url;
      modal.style.display = "flex";
    });
  });

  closeModal.onclick = () => modal.style.display = "none";
  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };
});
