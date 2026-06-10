# 🎂 18th Birthday Photo Site

A beautiful, **zero-cost** photo upload & gallery site for parties — hosted on GitHub Pages, photos stored on Cloudinary.

---

## 🚀 Quick Start (3 steps)

### Step 1 — Set up Cloudinary (free)

1. Create a free account at **[cloudinary.com](https://cloudinary.com)**
2. On your dashboard, note your **Cloud Name** (shown top-right)
3. Go to **Settings → Upload → Upload Presets → Add upload preset**
   - Signing mode: **Unsigned**
   - Folder: `18th-bday`
   - Click **Save** and copy the **Preset name**

### Step 2 — Configure the site

Open `app.js` and replace the placeholder values at the top:

```js
const CONFIG = {
  cloudName:    "YOUR_CLOUD_NAME",    // ← paste your Cloud Name here
  uploadPreset: "YOUR_UPLOAD_PRESET", // ← paste your preset name here
  folder:       "18th-bday",          // ← Cloudinary folder (match your preset)
  birthdayName: "Sofia",              // ← birthday person's name
  partyDate:    "June 14, 2026",      // ← party date
};
```

### Step 3 — Deploy to GitHub Pages

1. Create a new GitHub repository (public, any name — e.g. `18th-bday`)
2. Upload all 4 files: `index.html`, `style.css`, `app.js`, `README.md`
3. Go to **Settings → Pages → Source → Deploy from branch → main**
4. Your site will be live at: `https://YOUR_USERNAME.github.io/18th-bday`

**Generate a QR code** pointing to that URL (use [qr.io](https://qr.io) or any free QR generator) and print/display it at the party! 🎉

---

## ⚙️ Enable Gallery (Cloudinary list API)

For the gallery to load all photos, you need to enable the **list resource** tag in Cloudinary:

1. In Cloudinary, go to **Settings → Security**
2. Under **Restricted image types**, **uncheck** "Resource list"
3. Save

This lets the JavaScript call `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/list/18th-bday.json` to fetch all photos.

---

## 📁 File Structure

```
├── index.html   — Page structure (hero, upload, gallery, lightbox)
├── style.css    — Pink & gold dark theme, animations, responsive layout
├── app.js       — All logic: upload, gallery, confetti, drag-and-drop
└── README.md    — This setup guide
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Drag & Drop Upload** | Drop photos directly onto the page |
| **Multi-file Upload** | Upload multiple photos at once |
| **Upload Preview** | See thumbnails before uploading |
| **Progress Bar** | Per-file upload progress |
| **Confetti 🎉** | Burst animation on successful upload |
| **Masonry Gallery** | Auto-loading gallery with Cloudinary photos |
| **Auto-Refresh** | Gallery refreshes every 30 seconds |
| **Lightbox** | Full-screen photo viewer with keyboard & swipe nav |
| **Mobile-first** | Fully responsive for phone camera rolls |
| **Toast Notifications** | Friendly error/info messages |

---

## 💰 Costs

| Service | Cost |
|---|---|
| GitHub Pages | **Free** (always) |
| Cloudinary | **Free** (25 GB storage, 25 GB bandwidth/month) |
| **Total** | **$0** |

---

## 🎨 Customization

All easy tweaks are in `app.js` (top `CONFIG` object) and `style.css` (top `:root` variables for colors).
