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
    const modalContent = document.getElementById("modal-content");
    const closeModal = document.getElementById("modal-close");

    document.querySelectorAll(".open-modal").forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const url = this.dataset.url;

        // Fetch the full rendered page content
        fetch(url)
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // You can select only the inner content if needed:
            const postContent = doc.querySelector('.post') || doc.querySelector('.page') || doc.body;
            modalContent.innerHTML = postContent.innerHTML;

            modal.style.display = "flex";
          });
      });
    });

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = e => {
      if (e.target === modal) modal.style.display = "none";
    };
  });

})(document);
