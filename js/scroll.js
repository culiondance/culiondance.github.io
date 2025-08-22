window.addEventListener("load", () => {
  const overlay = document.getElementById("scroll-overlay");

  //delay for unfurling effect
  setTimeout(() => {
    overlay.classList.add("unfurling");
  }, 350);

  // Fade out after scroll fully slides
  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 3000);
});

