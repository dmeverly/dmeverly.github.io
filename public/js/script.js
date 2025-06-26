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


  // 👇 NEW: Auto-expand sidebar if screen is wide enough
  document.addEventListener('DOMContentLoaded', function () {
    const emToPx = em => em * 16; // assuming base font-size = 16px
    if (window.innerWidth >= emToPx(48)) { // 48em = ~768px
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }
  });

})(document);
