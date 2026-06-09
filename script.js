const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const slider = document.querySelector("#projects-track");
const sliderButtons = document.querySelectorAll("[data-slide]");
const projectsTrack = document.querySelector("#projects-track");
const certGrid = document.querySelector("#cert-grid");
const achievementsList = document.querySelector("#achievements-list");
const activitiesList = document.querySelector("#activities-list");

const DATA_FILES = {
  projects: "data/projects.json",
  certificates: "data/certificates.json",
  achievements: "data/achievements.json",
  extra: "data/extra.json",
};

function createList(items) {
  const list = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  return list;
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const link = document.createElement("a");
  link.className = "corner-link";
  link.href = project.link;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", `Open ${project.title} repository`);
  link.innerHTML = "&#8599;";

  const imageWrap = document.createElement("div");
  imageWrap.className = "project-image";

  const img = document.createElement("img");
  img.src = project.image;
  img.alt = project.alt || `${project.title} preview`;
  img.loading = "lazy";
  img.decoding = "async";
  imageWrap.appendChild(img);

  const content = document.createElement("div");
  content.className = "project-content";

  const meta = document.createElement("p");
  meta.className = "project-meta";
  meta.textContent = project.meta;

  const title = document.createElement("h3");
  title.textContent = project.title;

  content.append(meta, title, createList(project.bullets));
  article.append(link, imageWrap, content);
  return article;
}

function createCertificateCard(certificate) {
  const article = document.createElement("article");
  article.className = "glass-card cert-card";

  if (certificate.image) {
    const holder = document.createElement("div");
    holder.className = "certificate-holder";

    const img = document.createElement("img");
    img.src = certificate.image;
    img.alt = certificate.alt || `${certificate.title} certificate`;
    img.loading = "lazy";
    img.decoding = "async";

    holder.appendChild(img);
    article.appendChild(holder);
  }

  const copy = document.createElement("div");
  copy.className = certificate.image ? "cert-copy" : "certificate-copy-only";

  const title = document.createElement("h3");
  title.textContent = certificate.title;

  const issuer = document.createElement("p");
  issuer.textContent = `${certificate.issuer} | ${certificate.date}`;

  copy.append(title, issuer);

  if (certificate.note) {
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = certificate.note;
    copy.appendChild(note);
  }

  article.appendChild(copy);

  return article;
}

function createTimelineItem(item) {
  const article = document.createElement("article");
  article.className = "timeline-item";

  const dot = document.createElement("div");
  dot.className = "timeline-dot";

  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.title;

  const result = document.createElement("p");
  result.textContent = item.result;

  const date = document.createElement("span");
  date.textContent = item.date;

  content.append(title, result, date);
  article.append(dot, content);
  return article;
}

function createActivityCard(activity) {
  const article = document.createElement("article");
  article.className = "activity-card glass-card";

  const title = document.createElement("h3");
  title.textContent = activity.title;

  const meta = document.createElement("p");
  meta.className = "muted";
  meta.textContent = `${activity.org} | ${activity.period}`;

  article.append(title, meta, createList(activity.bullets));
  return article;
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function showLoadError(container, message) {
  if (!container) return;
  container.innerHTML = "";
  const error = document.createElement("p");
  error.className = "muted data-error";
  error.textContent = message;
  container.appendChild(error);
}

async function renderPortfolioData() {
  try {
    const [projects, certificates, achievements, extra] = await Promise.all([
      loadJSON(DATA_FILES.projects),
      loadJSON(DATA_FILES.certificates),
      loadJSON(DATA_FILES.achievements),
      loadJSON(DATA_FILES.extra),
    ]);

    if (projectsTrack) {
      projectsTrack.innerHTML = "";
      projects.forEach((project) => {
        projectsTrack.appendChild(createProjectCard(project));
      });
    }

    if (certGrid) {
      certGrid.innerHTML = "";
      certificates.forEach((certificate) => {
        certGrid.appendChild(createCertificateCard(certificate));
      });
    }

    if (achievementsList) {
      achievementsList.innerHTML = "";
      achievements.forEach((item) => {
        achievementsList.appendChild(createTimelineItem(item));
      });
    }

    if (activitiesList) {
      activitiesList.innerHTML = "";
      extra.forEach((activity) => {
        activitiesList.appendChild(createActivityCard(activity));
      });
    }
  } catch (error) {
    console.error(error);
    showLoadError(projectsTrack, "Project data could not be loaded.");
    showLoadError(certGrid, "Certificate data could not be loaded.");
    showLoadError(achievementsList, "Achievement data could not be loaded.");
    showLoadError(activitiesList, "Activity data could not be loaded.");
  }
}

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

renderPortfolioData();
