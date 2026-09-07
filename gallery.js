/* ============================================
   Buildsy Inspiration Gallery — Core Logic
   Dynamic routing, image loading, lightbox
   ============================================ */

(function () {
  'use strict';

  // ---------- Config ----------
  const MANIFEST_URL = 'public/manifest.json';
  const IMAGE_BASE = 'public';

  const CATEGORY_META = {
    tiles:        { label: 'Tiles',        tagline: 'Explore premium floor & wall tile inspirations' },
    sanitaryware: { label: 'Sanitaryware', tagline: 'Modern basins, WCs & sanitary fixtures' },
    bathware:     { label: 'Bathware',     tagline: 'Luxury showers, faucets & bath accessories' },
    kitchen:      { label: 'Kitchen',      tagline: 'Beautiful modular kitchen design ideas' },
    panels:       { label: 'Panels',       tagline: 'Elegant wall panels & decorative cladding' },
    homedecor:    { label: 'Home Decor',   tagline: 'Stunning interiors & living space inspirations' },
  };

  // ---------- DOM refs ----------
  const galleryGrid    = document.getElementById('galleryGrid');
  const galleryTitle   = document.getElementById('galleryTitle');
  const galleryCount   = document.getElementById('galleryCount');
  const galleryDesc    = document.getElementById('galleryDesc');
  const breadcrumbCat  = document.getElementById('breadcrumbCat');
  const breadcrumbSep  = document.getElementById('breadcrumbCatSep');
  const categoryPills  = document.getElementById('categoryPills');
  const emptyState     = document.getElementById('emptyState');
  const navLinks       = document.getElementById('navLinks');

  // Lightbox
  const lightbox       = document.getElementById('lightbox');
  const lbImg          = document.getElementById('lightboxImg');
  const lbCaption      = document.getElementById('lightboxCaption');
  const lbCounter      = document.getElementById('lightboxCounter');
  const lbClose        = document.getElementById('lightboxClose');
  const lbPrev         = document.getElementById('lightboxPrev');
  const lbNext         = document.getElementById('lightboxNext');

  // Mobile nav
  const mobileMenuBtn   = document.getElementById('mobileMenuBtn');
  const mobileOverlay   = document.getElementById('mobileNavOverlay');
  const mobileDrawer    = document.getElementById('mobileNavDrawer');
  const mobileClose     = document.getElementById('mobileNavClose');
  const mobileNavLinks  = document.getElementById('mobileNavLinks');

  let manifest = {};
  let currentImages = [];
  let lightboxIndex = 0;
  let currentCategory = null;
  const BAG_STORAGE_KEY = 'buildsy-showroom-wishlist';
  let bag = loadBag();

  function loadBag() {
    try {
      const saved = JSON.parse(localStorage.getItem(BAG_STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveBag() {
    localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bag));
    renderBag();
  }

  function renderBag() {
    const count = bag.length;
    const countEl = document.getElementById('galleryBagCount');
    const itemsEl = document.getElementById('galleryBagItems');
    const emptyEl = document.getElementById('galleryBagEmpty');
    const footerEl = document.getElementById('galleryBagFooter');
    const summaryEl = document.getElementById('galleryBagSummary');
    if (!countEl || !itemsEl) return;
    countEl.textContent = count;
    itemsEl.innerHTML = '';
    emptyEl.hidden = bag.length > 0;
    footerEl.hidden = bag.length === 0;
    summaryEl.textContent = count + ' Product' + (count === 1 ? '' : 's') + ' Saved';
    bag.forEach(item => {
      const row = document.createElement('div');
      row.className = 'gallery-bag-row';
      const visual = item.img ? '<img src="' + escapeAttribute(item.img) + '" alt="' + escapeAttribute(item.name) + '">' : '<div class="gallery-bag-color" style="background:' + escapeAttribute(item.bgColor || '#3E6B8C') + '">' + escapeHtml(item.tag || item.name) + '</div>';
      row.innerHTML = visual + '<div><h3>' + escapeHtml(item.name) + '</h3><p>' + escapeHtml(item.dim || item.tag || item.category) + '</p><span class="gallery-saved-label">Saved for quote discussion</span></div><button type="button" data-remove-bag-id="' + escapeAttribute(item.id) + '" aria-label="Remove ' + escapeAttribute(item.name) + ' from wishlist">Remove</button>';
      itemsEl.appendChild(row);
    });
  }

  function addToBag(item) {
    const itemId = getWishlistId(item);
    const existing = bag.find(entry => entry.id === itemId);
    if (existing) return false;
    bag.push({ id: itemId, name: item.name, category: item.category, img: item.src, tag: item.category, quantity: 1 });
    saveBag();
    return true;
  }

  function removeFromWishlist(item) {
    bag = bag.filter(entry => entry.id !== getWishlistId(item));
    saveBag();
  }

  function getWishlistId(item) {
    return item.id || item.category + '::' + item.name;
  }

  function escapeAttribute(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- Init ----------
  async function init() {
    try {
      let res = await fetch(MANIFEST_URL);
      if (!res.ok) {
        res = await fetch('manifest.json');
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
    setupGalleryBag();
    renderBag();

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

      const actions = document.createElement('div');
      actions.className = 'gallery-card-actions';
      const addButton = document.createElement('button');
      addButton.className = 'gallery-add-button';
      addButton.type = 'button';
      const isSaved = bag.some(entry => entry.id === getWishlistId(img));
      addButton.textContent = isSaved ? '♥' : '♡';
      addButton.classList.toggle('saved', isSaved);
      addButton.setAttribute('aria-pressed', String(isSaved));
      addButton.setAttribute('aria-label', (isSaved ? 'Remove ' : 'Add ') + img.category + ' image ' + String(idx + 1).padStart(2, '0') + ' ' + (isSaved ? 'from' : 'to') + ' wishlist');
      addButton.addEventListener('click', function (e) {
        e.stopPropagation();
        const saved = bag.some(entry => entry.id === getWishlistId(img));
        if (saved) removeFromWishlist(img);
        else addToBag(img);
        const nowSaved = bag.some(entry => entry.id === getWishlistId(img));
        addButton.textContent = nowSaved ? '♥' : '♡';
        addButton.classList.toggle('saved', nowSaved);
        addButton.setAttribute('aria-pressed', String(nowSaved));
        addButton.setAttribute('aria-label', (nowSaved ? 'Remove ' : 'Add ') + img.category + ' image ' + String(idx + 1).padStart(2, '0') + ' ' + (nowSaved ? 'from' : 'to') + ' wishlist');
      });
      actions.appendChild(addButton);
      card.appendChild(actions);

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
    if (!mobileNavLinks) return;
    mobileNavLinks.innerHTML = '';
    var homeLink = document.createElement('a');
    homeLink.href = 'index.html';
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
    if (!mobileMenuBtn) return;
    mobileMenuBtn.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        openMobileMenu();
      }
    });
    if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  function setupGalleryBag() {
    const toggle = document.getElementById('galleryBagToggle');
    const overlay = document.getElementById('galleryBagOverlay');
    const close = document.getElementById('galleryBagClose');
    const items = document.getElementById('galleryBagItems');
    const update = document.getElementById('updateWishlist');
    const share = document.getElementById('shareWishlist');
    if (!toggle || !overlay) return;
    toggle.addEventListener('click', function () {
      renderBag();
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      close.focus();
    });
    close.addEventListener('click', function () { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; });
    overlay.addEventListener('click', function (event) { if (event.target === overlay) close.click(); });
    items.addEventListener('click', function (event) {
      const id = event.target.getAttribute('data-remove-bag-id');
      if (!id) return;
      bag = bag.filter(item => item.id !== id);
      saveBag();
    });
    if (update) update.addEventListener('click', function () { close.click(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if (share) share.addEventListener('click', async function () {
      const shareText = 'My Buildsy wishlist: ' + bag.map(item => item.name).join(', ');
      try {
        await navigator.clipboard.writeText(shareText);
        share.textContent = 'Wishlist copied';
        setTimeout(function () { share.textContent = 'Share wishlist'; }, 1400);
      } catch (error) {
        share.textContent = 'Copy unavailable';
        setTimeout(function () { share.textContent = 'Share wishlist'; }, 1400);
      }
    });
  }

  function openMobileMenu() {
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (mobileDrawer) mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ---------- Active Nav Highlight ----------
  function updateActiveNav() {
    if (navLinks) {
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
    }

    if (mobileNavLinks) {
      var mLinks = mobileNavLinks.querySelectorAll('a');
      mLinks.forEach(function (a) {
        a.classList.remove('active');
        var href = a.getAttribute('href') || '';
        if (currentCategory && href.includes('#' + currentCategory)) {
          a.classList.add('active');
        }
      });
    }
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
