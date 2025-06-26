(function(document) {
  var toggle = document.querySelector('.sidebar-toggle');
  var sidebar = document.querySelector('#sidebar');
  var checkbox = document.querySelector('#sidebar-checkbox');

  document.addEventListener('click', function(e) {
    var target = e.target;

    if(!checkbox.checked ||
       sidebar.contains(target) ||
       (target === checkbox || target === toggle)) return;

    checkbox.checked = false;
  }, false);

  document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("sidebar-checkbox");
  const emToPx = em => em * 16;

  // Only auto-check (open) sidebar if viewport wider than 30em (480px)
  if (window.innerWidth >= emToPx(30)) {
    checkbox.checked = true;
  } else {
    checkbox.checked = false;
  }
});


})(document);