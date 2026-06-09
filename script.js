const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const slider = document.querySelector(".projects-track");
const sliderButtons = document.querySelectorAll("[data-slide]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (slider && sliderButtons.length) {
  const getScrollAmount = () => Math.min(420, slider.clientWidth * 0.9);

  sliderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.slide === "next" ? 1 : -1;
      slider.scrollBy({
        left: direction * getScrollAmount(),
        behavior: "smooth",
      });
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = "0s";
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});
