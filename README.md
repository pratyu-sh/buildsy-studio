# Buildsy — Inspiration Gallery

> A premium, dynamic inspiration gallery for building materials & interior design.  
> Browse real-life inspirations across **Tiles**, **Sanitaryware**, **Bathware**, **Kitchen**, **Panels**, and **Home Decor**.

---

## 🖼️ Live Preview

```bash
npx serve . -p 3456
```

Then open:

| Page | URL |
|------|-----|
| **Home (Carousel)** | `http://localhost:3456/buildsy-inspiration-gallery (2).html` |
| **All Inspirations** | `http://localhost:3456/inspirations.html` |
| **Tiles Gallery** | `http://localhost:3456/inspirations.html#tiles` |
| **Kitchen Gallery** | `http://localhost:3456/inspirations.html#kitchen` |
| **Sanitaryware Gallery** | `http://localhost:3456/inspirations.html#sanitaryware` |
| **Bathware Gallery** | `http://localhost:3456/inspirations.html#bathware` |
| **Panels Gallery** | `http://localhost:3456/inspirations.html#panels` |
| **Home Decor Gallery** | `http://localhost:3456/inspirations.html#homedecor` |

---

## 📁 Project Structure

```
buildsy/
├── buildsy-inspiration-gallery (2).html   # Homepage — category carousel
├── inspirations.html                      # Dynamic gallery page (hash routing)
├── gallery.css                            # Gallery styles (masonry, lightbox, responsive)
├── gallery.js                             # Core logic (routing, rendering, lightbox)
├── generate-manifest.js                   # Script to rebuild image manifest
├── public/
│   └── images/
│       ├── manifest.json                  # Auto-generated image catalog
│       ├── tiles/                         # 15 images
│       ├── kitchen/                       # 6 images
│       ├── sanitaryware/                  # 9 images
│       ├── bathware/                      # 4 images
│       ├── panels/                        # 3 images
│       └── homedecor/                     # 8 images
└── README.md
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| **Primary** | `#10263F` (Navy) |
| **Accent** | `#2563EB` (Blue) |
| **Copper** | `#B8794F` |
| **Background** | `#F8FAFC` |
| **Serif Font** | Fraunces |
| **Sans Font** | Inter |
| **Border Radius** | 14px / 20px |

---

## ✨ Features

### Gallery
- **Masonry grid layout** — CSS columns, 4 → 3 → 2 column responsive
- **Staggered reveal animations** — cards fade in sequentially on load
- **Hover effects** — card lift, image zoom, gradient overlay with category label
- **Dynamic image count** — "15 Inspirations" calculated from folder contents
- **Category pills** — filter by category on the "All" view
- **Empty state** — graceful placeholder when no images exist

### Lightbox
- **Fullscreen image viewer** with blurred backdrop
- **Previous / Next** navigation buttons
- **Keyboard shortcuts** — `←` `→` arrows, `Escape` to close
- **Click outside** to close
- **Swipe gestures** on mobile (touch support)
- **Smooth crossfade** between images
- **Image counter** — "3 / 15"

### Navigation
- **Hash-based routing** — `inspirations.html#tiles`, `#kitchen`, etc.
- **Breadcrumb** — Home › Inspirations › Category
- **Active nav highlighting** — current category underlined in navbar
- **Mobile drawer** — hamburger menu with slide-in navigation
- **Sticky navbar** — stays visible while scrolling

### Performance
- **Lazy loading** — `loading="lazy"` on all gallery images
- **Async decoding** — `decoding="async"` for non-blocking rendering
- **No framework overhead** — pure HTML / CSS / JS

### SEO & Accessibility
- **Dynamic `<title>`** — "Tiles Inspirations | Buildsy"
- **Dynamic meta description** — updates per category
- **ARIA labels** — on buttons, lightbox, breadcrumb
- **Keyboard navigation** — all interactive elements focusable
- **Alt text** — descriptive alt on every image
- **Semantic HTML** — `<nav>`, `<main>`, `<header>`, `<footer>`

---

## 🔄 Adding New Images

1. **Drop images** into the appropriate category folder:
   ```
   public/images/tiles/my-new-tile.jpg
   public/images/kitchen/kitchen-upgrade.png
   ```

2. **Regenerate the manifest:**
   ```bash
   node generate-manifest.js
   ```

3. **Done!** The gallery automatically picks up new images — no code changes needed.

### Adding a New Category

1. Create a new folder:
   ```bash
   mkdir public/images/wardrobes
   ```

2. Add images to the folder.

3. Run `node generate-manifest.js`.

4. *(Optional)* Add a label and tagline in `gallery.js` under `CATEGORY_META`:
   ```js
   wardrobes: { label: 'Wardrobes', tagline: 'Custom wardrobe design inspirations' },
   ```

5. *(Optional)* Add a nav link in `inspirations.html`:
   ```html
   <a href="inspirations.html#wardrobes">Wardrobes</a>
   ```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | Vanilla CSS (custom properties) |
| Logic | Vanilla JavaScript (ES6, IIFE) |
| Fonts | Google Fonts (Fraunces, Inter) |
| Server | `npx serve` (static file server) |

No build tools, no bundlers, no dependencies — just files.

---

## 📱 Responsive Breakpoints

| Breakpoint | Columns | Behavior |
|-----------|---------|----------|
| `> 1200px` | 4 columns | Full desktop masonry |
| `900–1200px` | 3 columns | Tablet landscape |
| `540–900px` | 2 columns | Tablet / large phone |
| `< 540px` | 2 columns | Mobile (compact cards) |
| `< 768px` | — | Hamburger menu activates |

---

## 📄 License

© 2026 Buildsy.in — Building Materials & Inspiration Platform. All rights reserved.
