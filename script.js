const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav a");
const projectsTrack = document.querySelector("#projects-track");
const certGrid = document.querySelector("#cert-grid");
const achievementsList = document.querySelector("#achievements-list");
const activitiesList = document.querySelector("#activities-list");
const contactForm = document.querySelector("#contact-form");
const contactToast = document.querySelector("#contact-toast");

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

function createPhotoGallery(photos, label, options = {}) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  const gallery = document.createElement("div");
  gallery.className = "photo-gallery";

  const slots = options.forceSlots ? 3 : Math.min(photos.length, 3);

  for (let index = 0; index < slots; index += 1) {
    const photo = photos[index];
    if (!photo) {
      const emptyFrame = document.createElement("div");
      emptyFrame.className = "photo-thumb empty";
      gallery.appendChild(emptyFrame);
      continue;
    }

    const frame = document.createElement("a");
    frame.className = "photo-thumb";
    frame.href = photo;
    frame.target = "_blank";
    frame.rel = "noreferrer";
    frame.setAttribute("aria-label", `${label} photo ${index + 1}`);

    const img = document.createElement("img");
    img.src = photo;
    img.alt = `${label} photo ${index + 1}`;
    img.loading = "lazy";
    img.decoding = "async";

    frame.appendChild(img);
    gallery.appendChild(frame);
  }

  return gallery.childElementCount ? gallery : null;
}

function getProjectImages(project) {
  if (Array.isArray(project.images) && project.images.length) {
    return project.images.filter(Boolean);
  }

  if (Array.isArray(project.image) && project.image.length) {
    return project.image.filter(Boolean);
  }

  if (typeof project.image === "string" && project.image) {
    return [project.image];
  }

  return [];
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "project-image";
  const projectImages = getProjectImages(project);
  const imageSources = projectImages.length ? projectImages : [];
  let imageIndex = 0;
  let imageTimer = null;
  let stage = null;

  let currentImage = null;

  function showImage(index) {
    if (!imageSources.length) return;
    const nextIndex = index % imageSources.length;
    if (nextIndex === imageIndex && currentImage) return;

    const nextImage = document.createElement("img");
    nextImage.className = "project-image-frame project-image-next";
    nextImage.src = imageSources[nextIndex];
    nextImage.alt = project.alt || `${project.title} preview`;
    nextImage.loading = "lazy";
    nextImage.decoding = "async";
    stage.appendChild(nextImage);

    if (!currentImage) {
      nextImage.classList.add("project-image-active");
      currentImage = nextImage;
      imageIndex = nextIndex;
      return;
    }

    requestAnimationFrame(() => {
      currentImage.classList.add("slide-out-left");
      nextImage.classList.add("slide-in-from-right");
    });

    const finishTransition = () => {
      if (!currentImage || !nextImage.isConnected) return;
      currentImage.remove();
      nextImage.classList.remove("project-image-next", "slide-in-from-right");
      nextImage.classList.add("project-image-active");
      currentImage = nextImage;
      imageIndex = nextIndex;
    };

    nextImage.addEventListener("transitionend", finishTransition, { once: true });
    window.setTimeout(finishTransition, 550);
  }

  function startImageAutoplay() {
    if (imageTimer || imageSources.length < 2) return;
    imageTimer = window.setInterval(() => {
      showImage((imageIndex + 1) % imageSources.length);
    }, 2000);
  }

  function stopImageAutoplay() {
    if (!imageTimer) return;
    window.clearInterval(imageTimer);
    imageTimer = null;
  }

  if (imageSources.length) {
    stage = document.createElement("div");
    stage.className = "project-image-stage";
    imageWrap.appendChild(stage);

    currentImage = document.createElement("img");
    currentImage.className = "project-image-frame project-image-active";
    currentImage.src = imageSources[0];
    currentImage.alt = project.alt || `${project.title} preview`;
    currentImage.loading = "lazy";
    currentImage.decoding = "async";
    stage.appendChild(currentImage);
  } else {
    imageWrap.classList.add("project-image-placeholder");

    const placeholder = document.createElement("div");
    placeholder.className = "project-placeholder";

    const placeholderLabel = document.createElement("span");
    placeholderLabel.textContent = "Project";

    const placeholderTitle = document.createElement("strong");
    placeholderTitle.textContent = project.title;

    placeholder.append(placeholderLabel, placeholderTitle);
    imageWrap.appendChild(placeholder);
  }

  if (imageSources.length > 1) {
    article.addEventListener("pointerenter", startImageAutoplay);
    article.addEventListener("pointerleave", stopImageAutoplay);
    article.addEventListener("mouseenter", startImageAutoplay);
    article.addEventListener("mouseleave", stopImageAutoplay);
    article.addEventListener("focusin", startImageAutoplay);
    article.addEventListener("focusout", stopImageAutoplay);
  }

  const link = document.createElement("a");
  link.className = "corner-link";
  link.href = project.link || "#";
  link.target = "_blank";
  link.rel = "noreferrer";
  link.setAttribute("aria-label", `Open ${project.title} repository`);
  link.innerHTML = "&#8599;";

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
  article.className = "achievement-card glass-card";

  const title = document.createElement("h3");
  title.textContent = item.title;

  const result = document.createElement("p");
  result.className = "achievement-meta";
  result.textContent = item.result;

  const date = document.createElement("span");
  date.textContent = item.date;

  const content = document.createElement("div");
  content.className = "achievement-copy";
  content.append(title, result, date);

  const gallery = createPhotoGallery(item.photos, item.title, { forceSlots: 3 });
  if (gallery) {
    gallery.classList.add("achievement-gallery");
    content.appendChild(gallery);
  }

  article.append(content);
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

  const gallery = createPhotoGallery(activity.photos, activity.title, { forceSlots: 3 });
  if (gallery) {
    gallery.classList.add("activity-gallery");
    article.appendChild(gallery);
  }

  return article;
}

async function loadJSON(path) {
  const response = await fetch(path, { cache: "no-store" });
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

function showContactToast(message, type = "success") {
  if (!contactToast) return;

  contactToast.textContent = message;
  contactToast.dataset.state = type;
  contactToast.classList.add("is-visible");

  window.clearTimeout(showContactToast.hideTimer);
  showContactToast.hideTimer = window.setTimeout(() => {
    contactToast.classList.remove("is-visible");
  }, 3200);
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        contactForm.reset();
        showContactToast("Message sent successfully", "success");
        return;
      }

      showContactToast("Message could not be sent", "error");
    } catch (error) {
      console.error(error);
      showContactToast("Message could not be sent", "error");
    }
  });
}
