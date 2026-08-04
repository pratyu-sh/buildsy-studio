/* ============================================
   Buildsy Inspiration Gallery — Core Logic
   Dynamic routing, image loading, lightbox
   ============================================ */

(function () {
  'use strict';

  let imageBasePath = 'public/images';

  // ---------- Init ----------
  async function init() {
    try {
      let res = await fetch('public/images/manifest.json');
      if (res.ok) {
        imageBasePath = 'public/images';
      } else {
        res = await fetch('images/manifest.json');
        if (res.ok) {
          imageBasePath = 'images';
        }
      }
      if (res.ok) {
        manifest = await res.json();
      } else {
        manifest = {};
      }
    } catch (e) {
      console.error('Failed to load manifest:', e);
      manifest = {};
    }

    buildMobileNav();
    setupMobileMenu();

    // Route based on hash
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
  }

  // ---------- Routing ----------
  function handleRoute() {
    const hash = window.location.hash.replace('#', '').toLowerCase().trim();
    currentCategory = hash || null;
    renderPage();
  }

  function renderPage() {
    if (currentCategory && manifest[currentCategory]) {
      renderCategoryPage(currentCategory);
    } else if (currentCategory) {
      // Unknown category
      renderEmptyCategory(currentCategory);
    } else {
      renderAllCategories();
    }
    updateSEO();
    updateActiveNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Render: Single Category ----------
  function renderCategoryPage(cat) {
    const meta = CATEGORY_META[cat] || { label: capitalize(cat), tagline: '' };
    const images = manifest[cat] || [];

    galleryTitle.textContent = meta.label + ' Inspirations';
    galleryCount.textContent = images.length + ' Inspiration' + (images.length !== 1 ? 's' : '');
    galleryDesc.textContent = meta.tagline;

    breadcrumbCat.textContent = meta.label;
    breadcrumbSep.style.display = '';
    breadcrumbCat.style.display = '';

    categoryPills.innerHTML = '';
    categoryPills.style.display = 'none';

    if (images.length === 0) {
      galleryGrid.innerHTML = '';
      emptyState.style.display = '';
      return;
    }

    emptyState.style.display = 'none';
    currentImages = images.map(img => ({
      src: IMAGE_BASE + '/' + cat + '/' + encodeURIComponent(img),
      name: img,
      category: meta.label,
    }));

    renderGrid(currentImages);
  }

  // ---------- Render: All Categories Overview ----------
  function renderAllCategories() {
    galleryTitle.textContent = 'Inspiration Gallery';
    const totalImages = Object.values(manifest).reduce((sum, arr) => sum + arr.length, 0);
    galleryCount.textContent = totalImages + ' Inspirations';
    galleryDesc.textContent = 'Visualize your dream space with Buildsy — browse real-life inspirations';

    breadcrumbSep.style.display = 'none';
    breadcrumbCat.style.display = 'none';

    // Build pills
    categoryPills.style.display = 'flex';
    categoryPills.innerHTML = '';
    const allPill = createPill('All', '#', true);
    categoryPills.appendChild(allPill);
    Object.keys(manifest).forEach(cat => {
      const meta = CATEGORY_META[cat] || { label: capitalize(cat) };
      const pill = createPill(meta.label + ' (' + manifest[cat].length + ')', '#' + cat, false);
      categoryPills.appendChild(pill);
    });

    // Merge all images
    currentImages = [];
    Object.entries(manifest).forEach(([cat, images]) => {
      const meta = CATEGORY_META[cat] || { label: capitalize(cat) };
      images.forEach(img => {
        currentImages.push({
          src: IMAGE_BASE + '/' + cat + '/' + encodeURIComponent(img),
          name: img,
          category: meta.label,
        });
      });
    });

    if (currentImages.length === 0) {
      galleryGrid.innerHTML = '';
      emptyState.style.display = '';
      return;
    }

    emptyState.style.display = 'none';
    renderGrid(currentImages);
  }

  // ---------- Render: Empty Category ----------
  function renderEmptyCategory(cat) {
    const label = capitalize(cat);
    galleryTitle.textContent = label + ' Inspirations';
    galleryCount.textContent = '';
    galleryDesc.textContent = '';
    breadcrumbCat.textContent = label;
    breadcrumbSep.style.display = '';
    breadcrumbCat.style.display = '';
    categoryPills.innerHTML = '';
    categoryPills.style.display = 'none';
    galleryGrid.innerHTML = '';
    emptyState.style.display = '';
  }

  // ---------- Render Grid ----------
  function renderGrid(images) {
    galleryGrid.innerHTML = '';
    images.forEach((img, idx) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', img.category + ' Image ' + String(idx + 1).padStart(2, '0'));

      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.category + ' inspiration — ' + cleanFileName(img.name);
      imgEl.loading = 'lazy';
      imgEl.decoding = 'async';

      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      overlay.innerHTML =
        '<span class="card-overlay-cat">' + escapeHtml(img.category) + '</span>' +
        '<span class="card-overlay-label">Image ' + String(idx + 1).padStart(2, '0') + '</span>';

      card.appendChild(imgEl);
      card.appendChild(overlay);

      card.addEventListener('click', function () { openLightbox(idx); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
      });

      galleryGrid.appendChild(card);
    });
  }

  // ---------- Lightbox ----------
  function openLightbox(idx) {
    lightboxIndex = idx;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightboxImage() {
    const img = currentImages[lightboxIndex];
    if (!img) return;
    lbImg.style.opacity = '0';
    setTimeout(function () {
      lbImg.src = img.src;
      lbImg.alt = img.category + ' — ' + cleanFileName(img.name);
      lbCaption.textContent = img.category + ' — Image ' + String(lightboxIndex + 1).padStart(2, '0');
      lbCounter.textContent = (lightboxIndex + 1) + ' / ' + currentImages.length;
      lbImg.style.opacity = '1';
    }, 150);
  }

  function lightboxPrev() {
    lightboxIndex = (lightboxIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
  }

  function lightboxNext() {
    lightboxIndex = (lightboxIndex + 1) % currentImages.length;
    updateLightboxImage();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', lightboxPrev);
  lbNext.addEventListener('click', lightboxNext);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-img-wrap')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
  });

  // Touch / swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx > 0 ? lightboxPrev() : lightboxNext();
    }
  }, { passive: true });

  // ---------- Mobile Nav ----------
  function buildMobileNav() {
    mobileNavLinks.innerHTML = '';
    var homeLink = document.createElement('a');
    homeLink.href = 'buildsy-inspiration-gallery (2).html';
    homeLink.textContent = 'Home';
    mobileNavLinks.appendChild(homeLink);

    var allLink = document.createElement('a');
    allLink.href = 'inspirations.html';
    allLink.textContent = 'All Inspirations';
    mobileNavLinks.appendChild(allLink);

    Object.keys(CATEGORY_META).forEach(function (cat) {
      var a = document.createElement('a');
      a.href = 'inspirations.html#' + cat;
      a.textContent = CATEGORY_META[cat].label;
      a.addEventListener('click', function () { closeMobileMenu(); });
      mobileNavLinks.appendChild(a);
    });
  }

  function setupMobileMenu() {
    mobileMenuBtn.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        openMobileMenu();
      }
    });
    mobileClose.addEventListener('click', closeMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  function openMobileMenu() {
    mobileOverlay.classList.add('active');
    mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileOverlay.classList.remove('active');
    mobileDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ---------- Active Nav Highlight ----------
  function updateActiveNav() {
    if (!navLinks) return;
    var links = navLinks.querySelectorAll('a');
    links.forEach(function (a) {
      a.classList.remove('active');
      var href = a.getAttribute('href') || '';
      if (currentCategory && href.includes('#' + currentCategory)) {
        a.classList.add('active');
      } else if (!currentCategory && href === 'inspirations.html') {
        a.classList.add('active');
      }
    });

    // Mobile nav
    var mLinks = mobileNavLinks.querySelectorAll('a');
    mLinks.forEach(function (a) {
      a.classList.remove('active');
      var href = a.getAttribute('href') || '';
      if (currentCategory && href.includes('#' + currentCategory)) {
        a.classList.add('active');
      }
    });
  }

  // ---------- SEO ----------
  function updateSEO() {
    var meta = currentCategory && CATEGORY_META[currentCategory];
    if (meta) {
      document.title = meta.label + ' Inspirations | Buildsy';
      setMetaDesc('Browse premium ' + meta.label + ' inspiration images on Buildsy.');
    } else {
      document.title = 'Inspiration Gallery | Buildsy';
      setMetaDesc('Browse premium building material inspiration images on Buildsy.');
    }
  }

  function setMetaDesc(content) {
    var el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute('content', content);
  }

  // ---------- Helpers ----------
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }

  function cleanFileName(name) {
    return name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function createPill(label, href, isActive) {
    var btn = document.createElement('a');
    btn.href = href;
    btn.className = 'cat-pill' + (isActive ? ' active' : '');
    btn.textContent = label;
    return btn;
  }

  // ---------- Start ----------
  init();

})();
