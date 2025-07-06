(function(document) {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('#sidebar');
  var checkbox = document.querySelector('#sidebar-checkbox');

  // Close sidebar when clicking outside of it
  document.addEventListener('click', function(e) {
    var target = e.target;

    if (!checkbox.checked ||
        sidebar.contains(target) ||
        (target === checkbox || target === toggle)) return;

    checkbox.checked = false;
  }, false);

  // DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.getElementById("sidebar-checkbox");
    const emToPx = em => em * 16;

    // Auto-open sidebar only if viewport >= 30em
    if (window.innerWidth >= emToPx(30)) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }

    // --- Modal Logic ---
    const modal = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalSummary = document.getElementById("modal-summary");
    const modalLink = document.getElementById("modal-link");
    const closeModal = document.getElementById("modal-close");

    document.querySelectorAll(".open-modal").forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
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

})(document);
