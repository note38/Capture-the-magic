/* =====================================================
   🎂 BIRTHDAY PHOTO SITE — app.js
   GitHub Pages + Cloudinary (unsigned uploads)

   ⚙️  CONFIGURATION — replace these 3 values before deploying:
   ===================================================== */

const CONFIG = {
  cloudName:    "dr1mk4f7r",            // e.g. "my-cloud-abc123"
  uploadPreset: "bday_upload",          // e.g. "bday_upload"
  folder:       "18th-bday",            // Cloudinary folder name
  birthdayName: "Jewel",                // Birthday person's name (shown in hero)
  partyDate:    "June 13, 2026",        // Party date (shown in hero)
  maxFileSizeMB: 20,                    // Max file size per photo
  galleryRefreshMs: 30000,              // Auto-refresh interval (30 seconds)
};

/* =====================================================
   STATE
   ===================================================== */
let filesToUpload   = [];   // Queue of File objects selected by user
let galleryPhotos   = [];   // Array of photo URLs from Cloudinary
let lightboxIndex   = 0;    // Current lightbox photo index
let galleryTimer    = null; // setInterval handle for auto-refresh

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initParticles();
  initDropzone();
  initFileInput();
  initLightboxKeyboard();
  initStickyNav();
  switchTab("upload");
});

/* ===== Apply config to DOM ===== */
function applyConfig() {
  const nameEl = document.getElementById("heroName");
  const dateEl = document.getElementById("heroDate");
  if (nameEl) nameEl.textContent = CONFIG.birthdayName + "'s";
  if (dateEl) dateEl.textContent = CONFIG.partyDate;
  document.title = `✨ Happy 18th ${CONFIG.birthdayName}! — Share Your Photos`;
}

/* =====================================================
   TAB SWITCHING
   ===================================================== */
function switchTab(tab) {
  // Update buttons
  document.getElementById("tabBtnUpload").classList.toggle("active", tab === "upload");
  document.getElementById("tabBtnGallery").classList.toggle("active", tab === "gallery");

  // Update panels
  document.getElementById("panelUpload").classList.toggle("active", tab === "upload");
  document.getElementById("panelGallery").classList.toggle("active", tab === "gallery");

  // Scroll to content
  document.getElementById("mainContent").scrollIntoView({ behavior: "smooth", block: "start" });

  if (tab === "gallery") {
    loadGallery();
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
}

/* =====================================================
   ANIMATED BACKGROUND PARTICLES
   ===================================================== */
function initParticles() {
  const container = document.getElementById("bgParticles");
  if (!container) return;

  const COLORS = ["rgba(236,72,153,", "rgba(217,119,6,", "rgba(201,160,122,", "rgba(252,211,77,"];
  const COUNT  = 28;

  for (let i = 0; i < COUNT; i++) {
    const el  = document.createElement("div");
    const col = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.random() * 6 + 3;

    el.className = "particle";
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${col}${(Math.random() * 0.4 + 0.2).toFixed(2)});
      --dur: ${(Math.random() * 10 + 8)}s;
      --delay: -${Math.random() * 12}s;
      --op: ${(Math.random() * 0.4 + 0.2).toFixed(2)};
    `;
    container.appendChild(el);
  }
}

/* =====================================================
   STICKY NAV VISIBILITY
   ===================================================== */
function initStickyNav() {
  const nav = document.getElementById("tabNav");
  const hero = document.getElementById("hero");

  const observer = new IntersectionObserver(
    ([entry]) => {
      nav.style.opacity = entry.isIntersecting ? "0" : "1";
      nav.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
    },
    { threshold: 0.1 }
  );

  observer.observe(hero);
}

/* =====================================================
   DRAG & DROP ZONE
   ===================================================== */
function initDropzone() {
  const zone = document.getElementById("dropzone");

  zone.addEventListener("click", (e) => {
    if (e.target.closest(".btn")) return;
    document.getElementById("fileInput").click();
  });

  zone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") document.getElementById("fileInput").click();
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", (e) => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const dropped = Array.from(e.dataTransfer.files).filter(isValidImage);
    addFilesToQueue(dropped);
  });
}

/* =====================================================
   FILE INPUT
   ===================================================== */
function initFileInput() {
  const input = document.getElementById("fileInput");
  input.addEventListener("change", () => {
    const selected = Array.from(input.files).filter(isValidImage);
    addFilesToQueue(selected);
    input.value = "";  // reset so same file can be re-selected
  });
}

/* =====================================================
   FILE QUEUE MANAGEMENT
   ===================================================== */
function isValidImage(file) {
  if (!file.type.startsWith("image/")) {
    showToast(`"${file.name}" is not an image — skipped.`, "error");
    return false;
  }
  if (file.size > CONFIG.maxFileSizeMB * 1024 * 1024) {
    showToast(`"${file.name}" is too large (max ${CONFIG.maxFileSizeMB} MB).`, "error");
    return false;
  }
  return true;
}

function addFilesToQueue(files) {
  if (files.length === 0) return;
  filesToUpload.push(...files);
  renderPreviewQueue();
}

function removeFromQueue(index) {
  filesToUpload.splice(index, 1);
  renderPreviewQueue();
}

function clearQueue() {
  filesToUpload = [];
  renderPreviewQueue();
}

function renderPreviewQueue() {
  const queueEl = document.getElementById("previewQueue");
  const gridEl  = document.getElementById("previewGrid");

  if (filesToUpload.length === 0) {
    queueEl.style.display = "none";
    return;
  }

  queueEl.style.display = "block";
  gridEl.innerHTML = "";

  filesToUpload.forEach((file, idx) => {
    const item  = document.createElement("div");
    item.className = "preview-item";
    item.innerHTML = `
      <img src="${URL.createObjectURL(file)}" alt="${file.name}" loading="lazy" />
      <button class="remove-btn" onclick="removeFromQueue(${idx})" aria-label="Remove photo">✕</button>
    `;
    gridEl.appendChild(item);
  });
}

/* =====================================================
   UPLOAD TO CLOUDINARY
   ===================================================== */
async function uploadAll() {
  if (filesToUpload.length === 0) return;

  if (CONFIG.cloudName === "YOUR_CLOUD_NAME" || CONFIG.uploadPreset === "YOUR_UPLOAD_PRESET") {
    showToast("⚠️ Please set your Cloudinary Cloud Name & Upload Preset in app.js first!", "error");
    return;
  }

  const total   = filesToUpload.length;
  const files   = [...filesToUpload];

  // Hide queue, show progress
  document.getElementById("previewQueue").style.display   = "none";
  document.getElementById("uploadProgress").style.display = "block";
  document.getElementById("dropzone").style.display       = "none";
  document.getElementById("uploadSuccess").style.display  = "none";

  const progressLabel = document.getElementById("progressLabel");
  const progressPct   = document.getElementById("progressPct");
  const progressFill  = document.getElementById("progressFill");

  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    progressLabel.textContent = `Uploading ${i + 1} of ${total}…`;
    setProgress(progressFill, progressPct, Math.round((i / total) * 100));

    try {
      await uploadFile(files[i]);
      successCount++;
    } catch (err) {
      console.error("Upload failed for", files[i].name, err);
      showToast(`Failed to upload "${files[i].name}". Please try again.`, "error");
    }
  }

  setProgress(progressFill, progressPct, 100);
  await delay(400);

  // Show success
  document.getElementById("uploadProgress").style.display = "none";
  document.getElementById("uploadSuccess").style.display  = "block";
  filesToUpload = [];

  if (successCount > 0) launchConfetti();
}

function setProgress(fill, label, pct) {
  fill.style.width  = `${pct}%`;
  label.textContent = `${pct}%`;
}

async function uploadFile(file) {
  const url  = `https://api.cloudinary.com/v1_1/${CONFIG.cloudName}/image/upload`;
  const form = new FormData();
  form.append("file",           file);
  form.append("upload_preset",  CONFIG.uploadPreset);
  form.append("folder",         CONFIG.folder);

  const res = await fetch(url, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  return await res.json();
}

function resetUpload() {
  filesToUpload = [];
  document.getElementById("uploadSuccess").style.display  = "none";
  document.getElementById("uploadProgress").style.display = "none";
  document.getElementById("previewQueue").style.display   = "none";
  document.getElementById("dropzone").style.display       = "block";
}

/* =====================================================
   GALLERY — LOAD FROM CLOUDINARY
   ===================================================== */
async function loadGallery() {
  const grid    = document.getElementById("galleryGrid");
  const loading = document.getElementById("galleryLoading");
  const empty   = document.getElementById("galleryEmpty");
  const refresh = document.getElementById("refreshIcon");

  empty.style.display   = "none";
  loading.style.display = "block";
  grid.innerHTML        = "";
  refresh.style.animation = "spin360 0.8s linear infinite";

  if (CONFIG.cloudName === "YOUR_CLOUD_NAME") {
    loading.style.display = "none";
    renderDemoGallery(grid, empty);
    refresh.style.animation = "";
    return;
  }

  try {
    const photos = await fetchCloudinaryPhotos();
    loading.style.display = "none";
    refresh.style.animation = "";

    if (photos.length === 0) {
      empty.style.display = "flex";
      updateGalleryCount(0);
      return;
    }

    galleryPhotos = photos;
    renderGallery(grid, photos);
    updateGalleryCount(photos.length);

  } catch (err) {
    console.error("Gallery load error:", err);
    loading.style.display   = "none";
    refresh.style.animation = "";
    showToast("Couldn't load gallery. Check your Cloudinary settings.", "error");
  }
}

/* Fetch gallery from backend API */
async function fetchCloudinaryPhotos() {
  const url = '/api/gallery';
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Gallery API returned ${res.status}`);

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');

  return data.photos;
}

function renderGallery(grid, photos) {
  grid.innerHTML = "";
  photos.forEach((photo, idx) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `View photo ${idx + 1}`);
    item.innerHTML = `
      <img src="${photo.url}" alt="Party photo ${idx + 1}" loading="lazy" />
      <span class="expand-icon">🔍</span>
    `;
    item.addEventListener("click", () => openLightbox(idx));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter") openLightbox(idx);
    });
    grid.appendChild(item);
  });
}

/* Demo gallery shown when Cloudinary is not yet configured */
function renderDemoGallery(grid, empty) {
  const DEMO_COLORS = [
    ["#ec4899","#d97706"], ["#d97706","#ec4899"], ["#c9a07a","#ec4899"],
    ["#f59e0b","#ec4899"], ["#ec4899","#c9a07a"], ["#fcd34d","#d97706"],
  ];
  const HEIGHTS = [160, 220, 180, 140, 200, 170, 130, 210, 160, 190, 150, 180];

  galleryPhotos = DEMO_COLORS.map((_, i) => ({ urlFull: null, url: null }));

  grid.innerHTML = "";
  DEMO_COLORS.forEach((cols, idx) => {
    const h    = HEIGHTS[idx % HEIGHTS.length];
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.style.cssText = `background: linear-gradient(135deg, ${cols[0]}, ${cols[1]}); height: ${h}px; margin-bottom: 0.75px; display:flex; align-items:center; justify-content:center; cursor:default;`;
    item.innerHTML = `<span style="font-size:2rem; opacity:0.4;">📸</span>`;
    grid.appendChild(item);
  });

  // Show demo notice
  const notice = document.createElement("p");
  notice.style.cssText = "text-align:center; color: var(--text-muted); font-size:0.8rem; margin-top:1rem; grid-column:1/-1; padding:0.75rem; background:var(--bg-card); border-radius:8px; border:1px solid var(--border);";
  notice.textContent = "⚙️ Demo mode — add your Cloudinary details in app.js to load real photos";
  grid.after(notice);

  updateGalleryCount(0);
}

function updateGalleryCount(n) {
  const countEl = document.getElementById("galleryCount");
  if (n > 0) {
    countEl.textContent    = n;
    countEl.style.display  = "inline";
    const subtitle = document.getElementById("gallerySubtitle");
    if (subtitle) subtitle.textContent = `${n} photo${n === 1 ? "" : "s"} from tonight 💕`;
  } else {
    countEl.style.display = "none";
  }
}

/* =====================================================
   AUTO REFRESH
   ===================================================== */
function startAutoRefresh() {
  stopAutoRefresh();
  galleryTimer = setInterval(() => {
    if (document.getElementById("panelGallery").classList.contains("active")) {
      loadGallery();
    }
  }, CONFIG.galleryRefreshMs);
}

function stopAutoRefresh() {
  if (galleryTimer) {
    clearInterval(galleryTimer);
    galleryTimer = null;
  }
}

/* =====================================================
   LIGHTBOX
   ===================================================== */
function openLightbox(idx) {
  if (!galleryPhotos.length || !galleryPhotos[0].urlFull) return; // demo mode
  lightboxIndex = idx;
  const lb = document.getElementById("lightbox");
  lb.style.display = "flex";
  document.body.style.overflow = "hidden";
  updateLightbox();
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
  document.body.style.overflow = "";
}

function lightboxNav(dir) {
  lightboxIndex = (lightboxIndex + dir + galleryPhotos.length) % galleryPhotos.length;
  updateLightbox();
}

function updateLightbox() {
  const photo   = galleryPhotos[lightboxIndex];
  const img     = document.getElementById("lightboxImg");
  const counter = document.getElementById("lightboxCounter");

  img.src = photo.urlFull || photo.url;
  counter.textContent = `${lightboxIndex + 1} / ${galleryPhotos.length}`;
}

function initLightboxKeyboard() {
  document.addEventListener("keydown", (e) => {
    const lb = document.getElementById("lightbox");
    if (lb.style.display === "none") return;
    if (e.key === "Escape")      closeLightbox();
    if (e.key === "ArrowLeft")   lightboxNav(-1);
    if (e.key === "ArrowRight")  lightboxNav(1);
  });

  // Touch swipe support
  let touchStartX = 0;
  const lb = document.getElementById("lightbox");
  lb.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend",   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) lightboxNav(diff > 0 ? 1 : -1);
  });
}

/* =====================================================
   CONFETTI
   ===================================================== */
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx    = canvas.getContext("2d");

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ["#ec4899","#f59e0b","#fcd34d","#c9a07a","#f7a8cc","#fce4f0","#ffffff"];
  const pieces  = Array.from({ length: 140 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * -canvas.height,
    r:    Math.random() * 7 + 3,
    d:    Math.random() * 80 + 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltAngleDelta: (Math.random() * 0.07 + 0.05) * (Math.random() < 0.5 ? 1 : -1),
    opacity: Math.random() * 0.8 + 0.2,
    shape: Math.random() < 0.5 ? "circle" : "rect",
  }));

  let angle   = 0;
  let frameId = null;
  let elapsed = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle     += 0.01;
    elapsed   += 16;

    pieces.forEach(p => {
      p.tiltAngle += p.tiltAngleDelta;
      p.y          += (Math.cos(angle + p.d) + 2.5) * 1.8;
      p.x          += Math.sin(angle) * 0.8;
      p.tilt        = Math.sin(p.tiltAngle) * 12;

      ctx.globalAlpha = elapsed > 2500 ? Math.max(0, p.opacity - (elapsed - 2500) / 1500) : p.opacity;
      ctx.fillStyle   = p.color;
      ctx.beginPath();

      if (p.shape === "circle") {
        ctx.arc(p.x + p.tilt, p.y, p.r, 0, Math.PI * 2);
      } else {
        ctx.rect(p.x + p.tilt, p.y, p.r * 1.5, p.r * 0.7);
      }
      ctx.fill();
    });

    if (elapsed < 4000) {
      frameId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frameId);
    }
  }

  draw();
}

/* =====================================================
   TOAST NOTIFICATIONS
   ===================================================== */
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.cssText = `
      position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
      z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;
      pointer-events: none; width: max-content; max-width: 90vw;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.cssText = `
    background: ${type === "error" ? "#7f1d3d" : "#1e1425"};
    color: #fff;
    border: 1px solid ${type === "error" ? "rgba(236,72,153,0.4)" : "rgba(247,168,204,0.2)"};
    padding: 0.75rem 1.25rem;
    border-radius: 100px;
    font-size: 0.875rem;
    font-family: var(--font-body, sans-serif);
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    animation: fadeInUp 0.3s ease;
    pointer-events: none;
    text-align: center;
    backdrop-filter: blur(12px);
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

/* =====================================================
   UTILITIES
   ===================================================== */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
