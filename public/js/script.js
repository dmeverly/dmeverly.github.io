(function(document) {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('#sidebar');
  const checkbox = document.querySelector('#sidebar-checkbox');

  // Close sidebar on outside click
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (!checkbox || !checkbox.checked ||
        sidebar.contains(target) ||
        target === checkbox || target === toggle) return;
    checkbox.checked = false;
  }, false);

  // DOM ready
  document.addEventListener("DOMContentLoaded", function () {
    // Auto-toggle sidebar based on screen width
    const checkbox = document.getElementById("sidebar-checkbox");
    const emToPx = em => em * 16;
    if (window.innerWidth >= emToPx(30)) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }

    // Modal references
    const modal = document.getElementById("modal-overlay");
    const modalContent = document.getElementById("modal-content");
    const modalLink = document.getElementById("modal-link");
    const closeModal = document.getElementById("modal-close");

    if (!modal || !modalContent || !modalLink || !closeModal) {
      console.warn("Modal components missing from DOM.");
      return;
    }

    // Click handler for modal openers
    document.querySelectorAll(".open-modal").forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const url = this.dataset.url;

        if (!url) {
          console.warn("Missing data-url on modal link");
          return;
        }

        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error("Page fetch failed");
            return response.text();
          })
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const postContent = doc.querySelector('.post') || doc.querySelector('.page') || doc.body;

            modalContent.innerHTML = postContent.innerHTML;
            modalLink.href = url;
            modalLink.style.display = "inline-block";
            modal.style.display = "flex";
          })
          .catch(error => {
            modalContent.innerHTML = "<p style='color:red;'>Failed to load project content.</p>";
            modalLink.style.display = "none";
            console.error(error);
            modal.style.display = "flex";
          });
      });
    });

    // Modal close logic
    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = e => {
      if (e.target === modal) modal.style.display = "none";
    };
  });
})(document);
