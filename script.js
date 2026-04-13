/* ============================================================
   ODTÜ Uluslararası Gençlik Topluluğu — Main Script
   ============================================================ */

'use strict';

// ─── Google Apps Script Endpoints ────────────────────────────
const ENDPOINTS = {
  // Kendi Google Apps Script endpoint URL'nizi buraya yapıştırın
  contact: 'https://script.google.com/macros/s/AKfycbxtk9Nalnsa3FKhZw5z-zmt_eYYmwKs_dw1i0m_6WNBKaVwoUk8k9qQQCaQ2zLAFSrB/exec',
  // Blog Apps Script endpoint URL'nizi buraya yapıştırın (blog-gas.js dosyasını deploy edin)
  blog: 'https://script.google.com/macros/s/AKfycbxugCTSEa6-rXQAStyyOyKXhPLaoMbsVgs0hYk8iVk3fD_vFHB_Xymxx5I9VB5O7A0/exec',
};

// ─── DOM Ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initPageRouter();
  initFAQ();
  initApplicationChoice();
  initMultiStepForm('muz', 'applicationForm');
  initMultiStepForm('vok', 'vokalApplicationForm');
  initRangeSliders();
  initContactForm();
  initSpotifyToggle();
  initBlog();
});

// ─── 1. Navbar Scroll Effect ──────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

// ─── 2. Mobile Menu ───────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on any nav link click
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ─── 3. Page Router ──────────────────────────────────────────
function initPageRouter() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  // Map of hash → section id (hero is the default/home page)
  function navigateTo(hash) {
    // Determine target id
    let targetId = hash ? hash.replace('#', '') : 'hero';
    if (targetId === '') targetId = 'hero';

    // Check if target section exists
    const targetSection = document.getElementById(targetId);
    if (!targetSection) targetId = 'hero';

    // Hide all sections, show only target
    sections.forEach(s => s.classList.remove('page-active'));
    const active = document.getElementById(targetId);
    if (active) {
      active.classList.add('page-active');
      // Make all fade-in elements visible immediately on the active page
      active.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }

    // Update active nav link
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (targetId === 'hero') {
        link.classList.remove('active');
      } else {
        link.classList.toggle('active', href === `#${targetId}`);
      }
    });

    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  // Intercept all hash links for page navigation
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      window.location.hash = '';
      navigateTo('');
      return;
    }
    e.preventDefault();
    window.location.hash = href;
  });

  // Listen for hash changes (back/forward browser buttons)
  window.addEventListener('hashchange', () => {
    navigateTo(window.location.hash);
  });

  // Initial navigation based on current hash
  navigateTo(window.location.hash);
}

// ─── 6. FAQ Accordion ─────────────────────────────────────────
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all
      items.forEach(i => i.classList.remove('active'));

      // Open clicked (if it wasn't open)
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

// ─── 7. Application Form Choice ───────────────────────────────
function initApplicationChoice() {
  const choiceEl   = document.getElementById('applicationChoice');
  const muzForm    = document.getElementById('muzisyenForm');
  const vokForm    = document.getElementById('vokalForm');
  const backMuz    = document.getElementById('backFromMuzisyen');
  const backVok    = document.getElementById('backFromVokal');

  if (!choiceEl) return;

  // Show form based on choice
  document.querySelectorAll('.choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      choiceEl.style.display = 'none';
      if (type === 'muzisyen') {
        muzForm.style.display = 'block';
      } else {
        vokForm.style.display = 'block';
      }
      window.scrollTo(0, 0);
    });
  });

  // Back buttons
  if (backMuz) {
    backMuz.addEventListener('click', () => {
      muzForm.style.display = 'none';
      choiceEl.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }
  if (backVok) {
    backVok.addEventListener('click', () => {
      vokForm.style.display = 'none';
      choiceEl.style.display = 'block';
      window.scrollTo(0, 0);
    });
  }
}

// ─── 8. Multi-Step Form ───────────────────────────────────────
function initMultiStepForm(prefix, formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const container   = form.closest('.form-container');
  const steps       = form.querySelectorAll('.form-step');
  const progressBar = container.querySelector('.progress-bar');

  let currentStep = 1;

  // Next buttons
  form.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(form, currentStep, prefix)) {
        goToStep(currentStep + 1);
      }
    });
  });

  // Prev buttons
  form.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(form, currentStep, prefix)) return;
    submitForm(form, prefix, formId);
  });

  function goToStep(n) {
    if (n < 1 || n > steps.length) return;

    // Hide all steps
    steps.forEach(s => s.classList.remove('active'));

    // Show target step
    const target = form.querySelector(`.form-step[data-step="${n}"]`);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    currentStep = n;
    updateProgressBar(progressBar, n, steps.length);
  }
}

function updateProgressBar(progressBar, current, total) {
  if (!progressBar) return;
  const steps = progressBar.querySelectorAll('.progress-step');
  const lines = progressBar.querySelectorAll('.progress-line');

  steps.forEach((step, i) => {
    const stepNum = i + 1;
    step.classList.toggle('active', stepNum === current);
    step.classList.toggle('completed', stepNum < current);
  });

  lines.forEach((line, i) => {
    line.classList.toggle('active', i + 1 < current);
  });
}

// ─── 9. Form Validation ───────────────────────────────────────
function validateStep(form, step, prefix) {
  const stepEl = form.querySelector(`.form-step[data-step="${step}"]`);
  if (!stepEl) return true;

  let valid = true;

  // Clear previous errors
  stepEl.querySelectorAll('.field-error').forEach(e => { e.textContent = ''; });
  stepEl.querySelectorAll('.error-field').forEach(e => e.classList.remove('error-field'));

  // Required text/email/tel/url/select/textarea
  stepEl.querySelectorAll('[required]').forEach(field => {
    if (field.type === 'checkbox') {
      if (!field.checked) {
        showFieldError(field, 'Bu alan zorunludur.');
        valid = false;
      }
      return;
    }

    const val = field.value.trim();
    if (!val) {
      showFieldError(field, 'Bu alan zorunludur.');
      valid = false;
      return;
    }

    // Email validation
    if (field.type === 'email') {
      if (!isValidEmail(val)) {
        showFieldError(field, 'Geçerli bir e-posta adresi girin.');
        valid = false;
        return;
      }
      // ODTÜ email check for application forms (not contact form)
      if (field.id !== 'contact-email' && !val.endsWith('@metu.edu.tr')) {
        showFieldError(field, 'Lütfen ODTÜ e-posta adresinizi kullanın (@metu.edu.tr).');
        valid = false;
        return;
      }
    }

    // Phone validation
    if (field.type === 'tel') {
      if (!isValidPhone(val)) {
        showFieldError(field, 'Geçerli bir telefon numarası girin. (05XX XXX XX XX)');
        valid = false;
        return;
      }
    }

    // YouTube URL validation
    if (field.type === 'url' && val) {
      if (!isYouTubeURL(val)) {
        showFieldError(field, 'Lütfen geçerli bir YouTube linki girin.');
        valid = false;
        return;
      }
    }
  });

  // Optional URL fields (video_other etc.)
  stepEl.querySelectorAll('input[type="url"]:not([required])').forEach(field => {
    const val = field.value.trim();
    if (val && !isYouTubeURL(val)) {
      showFieldError(field, 'Lütfen geçerli bir YouTube linki girin.');
      valid = false;
    }
  });

  // Checkbox group validation (genres)
  const genreError = stepEl.querySelector('[id$="-genres-error"]');
  if (genreError) {
    const checkboxes = stepEl.querySelectorAll('input[type="checkbox"][name$="genres"]');
    if (checkboxes.length > 0) {
      const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
      if (!anyChecked) {
        genreError.textContent = 'Lütfen en az bir tür seçin.';
        valid = false;
      }
    }
  }

  // Consent checkbox
  const consentError = stepEl.querySelector('[id$="-consent-error"]');
  if (consentError) {
    const consent = stepEl.querySelector('input[type="checkbox"][id$="-consent"]');
    if (consent && !consent.checked) {
      consentError.textContent = 'Devam etmek için onay vermeniz gerekiyor.';
      valid = false;
    }
  }

  return valid;
}

function showFieldError(field, msg) {
  field.classList.add('error-field');
  const errorEl = field.closest('.form-group')?.querySelector('.field-error');
  if (errorEl) errorEl.textContent = msg;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9\s\(\)\-\+]{10,15}$/.test(phone.replace(/\s/g, ''));
}

function isYouTubeURL(url) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+/.test(url);
}

// ─── 10. Form Submission ──────────────────────────────────────
function submitForm(form, prefix, formId) {
  const submitBtn = form.querySelector('.btn-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor...';
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Collect checkbox arrays
  const checkboxGroups = {};
  form.querySelectorAll('input[type="checkbox"]:not([id$="-consent"])').forEach(cb => {
    if (!checkboxGroups[cb.name]) checkboxGroups[cb.name] = [];
    if (cb.checked) checkboxGroups[cb.name].push(cb.value);
  });
  Object.assign(data, checkboxGroups);

  const endpoint = formId === 'applicationForm' ? ENDPOINTS.musician : ENDPOINTS.vocal;

  // Use fetch with no-cors since Google Apps Script returns opaque response
  fetch(endpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  .then(() => {
    showFormSuccess(prefix, form);
  })
  .catch(() => {
    // With no-cors, errors are opaque — still show success if request was sent
    showFormSuccess(prefix, form);
  });
}

function showFormSuccess(prefix, form) {
  form.style.display = 'none';
  const successEl = document.getElementById(`${prefix}-success`);
  if (successEl) {
    successEl.style.display = 'block';
    successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Reset form to initial state
window.resetForm = function(prefix) {
  const formId = prefix === 'muz' ? 'applicationForm' : 'vokalApplicationForm';
  const form = document.getElementById(formId);
  const successEl = document.getElementById(`${prefix}-success`);
  const container = form?.closest('.form-container');

  if (form) {
    form.reset();
    form.style.display = 'block';
    // Reset to step 1
    form.querySelectorAll('.form-step').forEach((s, i) => {
      s.classList.toggle('active', i === 0);
    });
    const progressBar = container?.querySelector('.progress-bar');
    if (progressBar) updateProgressBar(progressBar, 1, 5);
    // Re-enable submit button
    const submitBtn = form.querySelector('.btn-submit');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Başvuruyu Gönder'; }
    // Reset range value displays
    form.querySelectorAll('.range-slider').forEach(slider => {
      slider.dispatchEvent(new Event('input'));
    });
  }
  if (successEl) successEl.style.display = 'none';
};

// ─── 11. Range Sliders ────────────────────────────────────────
function initRangeSliders() {
  const sliderMap = {
    'muz-tech':  'muz-tech-val',
    'muz-stage': 'muz-stage-val',
    'muz-team':  'muz-team-val',
    'muz-read':  'muz-read-val',
    'vok-control': 'vok-control-val',
    'vok-stage':   'vok-stage-val',
    'vok-eng':     'vok-eng-val',
    'vok-ear':     'vok-ear-val',
  };

  Object.entries(sliderMap).forEach(([sliderId, valId]) => {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(valId);
    if (!slider || !display) return;

    const update = () => {
      display.textContent = slider.value;
      // Color the track filled portion
      const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)`;
    };

    slider.addEventListener('input', update);
    update(); // initialize
  });
}

// ─── 12. Contact Form ─────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear errors
    form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));

    let valid = true;

    const nameEl    = form.querySelector('#contact-name');
    const emailEl   = form.querySelector('#contact-email');
    const messageEl = form.querySelector('#contact-message');

    if (!nameEl.value.trim()) { showFieldError(nameEl, 'Ad soyad gereklidir.'); valid = false; }
    if (!emailEl.value.trim()) { showFieldError(emailEl, 'E-posta gereklidir.'); valid = false; }
    else if (!isValidEmail(emailEl.value.trim())) { showFieldError(emailEl, 'Geçerli bir e-posta girin.'); valid = false; }
    else if (!emailEl.value.trim().endsWith('@metu.edu.tr')) { showFieldError(emailEl, 'Lütfen ODTÜ e-posta adresinizi kullanın (@metu.edu.tr).'); valid = false; }
    if (!messageEl.value.trim()) { showFieldError(messageEl, 'Mesaj gereklidir.'); valid = false; }

    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Gönderiliyor...'; }

    const data = {
      name:    nameEl.value.trim(),
      email:   emailEl.value.trim(),
      subject: form.querySelector('#contact-subject')?.value.trim() || '',
      message: messageEl.value.trim(),
    };

    fetch(ENDPOINTS.contact, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(() => {
      form.style.display = 'none';
      const success = document.getElementById('contact-success');
      if (success) success.style.display = 'block';
    })
    .catch(() => {
      form.style.display = 'none';
      const success = document.getElementById('contact-success');
      if (success) success.style.display = 'block';
    });
  });
}

// ─── 13. Spotify Toggle ───────────────────────────────────────
function initSpotifyToggle() {
  const btn   = document.getElementById('spotifyToggle');
  const embed = document.getElementById('spotifyEmbed');
  if (!btn || !embed) return;

  btn.addEventListener('click', () => {
    const isVisible = embed.style.display !== 'none';
    embed.style.display = isVisible ? 'none' : 'block';
    btn.textContent = isVisible ? 'Çalma Listesini Göster' : 'Gizle';
  });
}

// ─── 14. Blog System ──────────────────────────────────────────
const blogState = {
  posts: [],
  currentPost: null,
  editingPost: null,
  isAdmin: false,
  password: '',
  view: 'listing',
  loginAttempts: 0,
  cooldownUntil: 0,
  cooldownTimer: null,
};

// Secret admin URL: navigate to #blog-yonetim-paneli to access admin login
const BLOG_ADMIN_HASH = '#blog-yonetim-paneli';

function checkBlogAdminHash() {
  if (window.location.hash === BLOG_ADMIN_HASH) {
    // Clear the hash so it's not visible
    history.replaceState(null, '', window.location.pathname + window.location.search);
    // Scroll to blog section
    const blogSection = document.getElementById('blog');
    if (blogSection) blogSection.scrollIntoView({ behavior: 'smooth' });
    // If not already admin, show login
    if (!blogState.isAdmin) {
      blogShowLogin();
    }
  }
}

function initBlog() {
  const saved = sessionStorage.getItem('blogAdmin');
  if (saved) {
    blogState.isAdmin = true;
    blogState.password = saved;
    updateAdminUI();
  }

  // Restore cooldown from sessionStorage
  const cooldownData = sessionStorage.getItem('blogLoginCooldown');
  if (cooldownData) {
    const data = JSON.parse(cooldownData);
    blogState.loginAttempts = data.attempts || 0;
    blogState.cooldownUntil = data.until || 0;
  }

  initBlogToolbar();

  // Cover image drag & drop
  const coverEl = document.getElementById('blogEditorCover');
  if (coverEl) {
    coverEl.addEventListener('dragover', (e) => { e.preventDefault(); coverEl.classList.add('drag-over'); });
    coverEl.addEventListener('dragleave', () => coverEl.classList.remove('drag-over'));
    coverEl.addEventListener('drop', (e) => {
      e.preventDefault();
      coverEl.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleCoverImage(file);
    });
  }

  // Editor content drag & drop + paste for images
  const editorContent = document.getElementById('blogEditorContent');
  if (editorContent) {
    editorContent.addEventListener('dragover', (e) => e.preventDefault());
    editorContent.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        e.preventDefault();
        insertImageToEditor(file);
      }
    });
    editorContent.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) insertImageToEditor(file);
          return;
        }
      }
    });
  }

  fetchBlogPosts();

  // Check if admin hash is present on load
  checkBlogAdminHash();
  window.addEventListener('hashchange', checkBlogAdminHash);
}

// ─── Blog: Fetch & Render ─────────────────────────────────────
function fetchBlogPosts() {
  const grid = document.getElementById('blogGrid');
  const empty = document.getElementById('blogEmpty');
  const loading = document.getElementById('blogLoading');

  let url = ENDPOINTS.blog + '?action=list';
  if (blogState.isAdmin) {
    url += '&admin=true&pw=' + encodeURIComponent(blogState.password);
  }

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (loading) loading.style.display = 'none';
      if (data.success) {
        blogState.posts = data.posts;
        renderBlogListing();
      } else {
        if (empty) { empty.style.display = 'block'; empty.querySelector('p').textContent = 'Yazılar yüklenirken hata oluştu.'; }
      }
    })
    .catch(() => {
      if (loading) loading.style.display = 'none';
      if (empty) { empty.style.display = 'block'; empty.querySelector('p').textContent = 'Blog bağlantısı kurulamadı.'; }
    });
}

function renderBlogListing() {
  const grid = document.getElementById('blogGrid');
  const empty = document.getElementById('blogEmpty');
  if (!grid) return;

  if (blogState.posts.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  grid.innerHTML = blogState.posts.map(post => {
    const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const isDraft = post.status === 'draft';
    const coverHtml = post.coverImage
      ? `<img class="blog-card-image" src="${escapeAttr(post.coverImage)}" alt="${escapeAttr(post.title)}" loading="lazy">`
      : `<div class="blog-card-image-placeholder">Blog</div>`;

    return `
      <div class="blog-card ${isDraft ? 'blog-card-draft' : ''}" onclick="showBlogPost('${escapeAttr(post.id)}')">
        ${coverHtml}
        <div class="blog-card-body">
          <div class="blog-card-category">${isDraft ? 'Taslak · ' : ''}${escapeHtml(post.category || 'Genel')}</div>
          <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt || '')}</p>
          <div class="blog-card-date">${escapeHtml(post.author || 'UGT')} · ${date}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Blog: Post Detail ────────────────────────────────────────
function showBlogPost(id) {
  fetch(ENDPOINTS.blog + '?action=get&id=' + encodeURIComponent(id))
    .then(r => r.json())
    .then(data => {
      if (!data.success || !data.post) return;
      blogState.currentPost = data.post;
      renderBlogDetail(data.post);
      setBlogView('detail');
    });
}

function renderBlogDetail(post) {
  const coverEl = document.getElementById('blogDetailCover');
  const catEl = document.getElementById('blogDetailCategory');
  const titleEl = document.getElementById('blogDetailTitle');
  const authorEl = document.getElementById('blogDetailAuthor');
  const dateEl = document.getElementById('blogDetailDate');
  const contentEl = document.getElementById('blogDetailContent');
  const actionsEl = document.getElementById('blogDetailActions');

  if (post.coverImage) {
    coverEl.innerHTML = `<img src="${escapeAttr(post.coverImage)}" alt="${escapeAttr(post.title)}">`;
    coverEl.style.display = 'block';
  } else {
    coverEl.style.display = 'none';
  }

  catEl.textContent = post.category || 'Genel';
  titleEl.textContent = post.title;
  authorEl.textContent = post.author || 'UGT';
  dateEl.textContent = post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  contentEl.innerHTML = sanitizeBlogHtml(post.content || '');
  contentEl.querySelectorAll('a').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  if (actionsEl) actionsEl.style.display = blogState.isAdmin ? 'flex' : 'none';
}

// ─── Blog: View Management ────────────────────────────────────
window.setBlogView = function(view) {
  blogState.view = view;
  const listing = document.getElementById('blogListing');
  const detail = document.getElementById('blogDetail');
  const editor = document.getElementById('blogEditor');
  const header = document.getElementById('blogHeader');

  if (listing) listing.style.display = view === 'listing' ? '' : 'none';
  if (detail) detail.style.display = view === 'detail' ? '' : 'none';
  if (editor) editor.style.display = view === 'editor' ? '' : 'none';
  if (header) header.style.display = view === 'listing' ? '' : 'none';

  // Hide insert menu when leaving editor
  if (view !== 'editor') {
    const im = document.getElementById('blogInsertMenu');
    if (im) im.style.display = 'none';
  }

  window.scrollTo(0, 0);
};

// ─── Blog: Admin Auth ─────────────────────────────────────────
window.blogShowLogin = function() {
  if (blogState.isAdmin) {
    showBlogEditor();
    return;
  }
  document.getElementById('blogLoginOverlay').style.display = 'flex';
  document.getElementById('blogLoginPassword').value = '';
  document.getElementById('blogLoginError').textContent = '';
  updateCooldownUI();
  document.getElementById('blogLoginPassword').focus();
};

window.blogHideLogin = function() {
  document.getElementById('blogLoginOverlay').style.display = 'none';
  if (blogState.cooldownTimer) {
    clearInterval(blogState.cooldownTimer);
    blogState.cooldownTimer = null;
  }
};

function updateCooldownUI() {
  const cooldownEl = document.getElementById('blogLoginCooldown');
  const cooldownText = document.getElementById('blogLoginCooldownText');
  const loginBtn = document.getElementById('blogLoginBtn');
  const pwInput = document.getElementById('blogLoginPassword');
  const now = Date.now();

  if (blogState.cooldownUntil > now) {
    const remaining = Math.ceil((blogState.cooldownUntil - now) / 1000);
    cooldownEl.style.display = 'flex';
    cooldownText.textContent = `Çok fazla hatalı deneme. ${remaining} saniye bekleyin.`;
    loginBtn.disabled = true;
    pwInput.disabled = true;
    loginBtn.style.opacity = '0.5';

    if (blogState.cooldownTimer) clearInterval(blogState.cooldownTimer);
    blogState.cooldownTimer = setInterval(() => {
      const rem = Math.ceil((blogState.cooldownUntil - Date.now()) / 1000);
      if (rem <= 0) {
        clearInterval(blogState.cooldownTimer);
        blogState.cooldownTimer = null;
        cooldownEl.style.display = 'none';
        loginBtn.disabled = false;
        pwInput.disabled = false;
        loginBtn.style.opacity = '1';
        pwInput.focus();
      } else {
        cooldownText.textContent = `Çok fazla hatalı deneme. ${rem} saniye bekleyin.`;
      }
    }, 1000);
  } else {
    cooldownEl.style.display = 'none';
    loginBtn.disabled = false;
    pwInput.disabled = false;
    loginBtn.style.opacity = '1';
  }
}

function startLoginCooldown() {
  // Cooldown escalation: 3 attempts → 30s, 5 → 60s, 7+ → 120s
  let cooldownSec = 30;
  if (blogState.loginAttempts >= 7) cooldownSec = 120;
  else if (blogState.loginAttempts >= 5) cooldownSec = 60;

  blogState.cooldownUntil = Date.now() + cooldownSec * 1000;
  sessionStorage.setItem('blogLoginCooldown', JSON.stringify({
    attempts: blogState.loginAttempts,
    until: blogState.cooldownUntil,
  }));
  updateCooldownUI();
}

window.blogLogin = function() {
  // Check cooldown
  if (blogState.cooldownUntil > Date.now()) {
    updateCooldownUI();
    return;
  }

  const pw = document.getElementById('blogLoginPassword').value;
  if (!pw) {
    document.getElementById('blogLoginError').textContent = 'Şifre gerekli.';
    return;
  }

  const loginBtn = document.getElementById('blogLoginBtn');
  loginBtn.disabled = true;
  loginBtn.style.opacity = '0.5';

  fetch(ENDPOINTS.blog, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'checkAuth', password: pw }),
  })
  .then(r => r.json())
  .then(data => {
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
    if (data.success) {
      blogState.isAdmin = true;
      blogState.password = pw;
      blogState.loginAttempts = 0;
      blogState.cooldownUntil = 0;
      sessionStorage.setItem('blogAdmin', pw);
      sessionStorage.removeItem('blogLoginCooldown');
      blogHideLogin();
      updateAdminUI();
      fetchBlogPosts();
    } else {
      blogState.loginAttempts++;
      document.getElementById('blogLoginError').textContent = 'Şifre hatalı.';
      document.getElementById('blogLoginPassword').value = '';
      // Trigger cooldown after 3 failed attempts
      if (blogState.loginAttempts >= 3) {
        startLoginCooldown();
      }
    }
  })
  .catch(() => {
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
    document.getElementById('blogLoginError').textContent = 'Bağlantı hatası.';
  });
};

function blogAdminLogout() {
  blogState.isAdmin = false;
  blogState.password = '';
  sessionStorage.removeItem('blogAdmin');
  updateAdminUI();
  fetchBlogPosts();
}

function updateAdminUI() {
  const btn = document.getElementById('blogAdminBtn');
  const actions = document.getElementById('blogHeaderActions');
  if (!btn || !actions) return;

  if (blogState.isAdmin) {
    actions.style.display = '';
    btn.textContent = '+ Yeni Yazı';
    btn.onclick = () => showBlogEditor();
    if (!document.getElementById('blogLogoutBtn')) {
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'blogLogoutBtn';
      logoutBtn.className = 'btn btn-secondary btn-sm';
      logoutBtn.textContent = 'Çıkış';
      logoutBtn.style.marginLeft = '8px';
      logoutBtn.onclick = blogAdminLogout;
      btn.parentElement.appendChild(logoutBtn);
    }
  } else {
    actions.style.display = 'none';
    const logoutBtn = document.getElementById('blogLogoutBtn');
    if (logoutBtn) logoutBtn.remove();
  }
}

// ─── Blog: Editor ─────────────────────────────────────────────
function showBlogEditor(post) {
  blogState.editingPost = post || null;

  const titleEl = document.getElementById('blogEditorTitle');
  const categoryEl = document.getElementById('blogEditorCategory');
  const authorEl = document.getElementById('blogEditorAuthor');
  const excerptEl = document.getElementById('blogEditorExcerpt');
  const contentEl = document.getElementById('blogEditorContent');
  const coverPreview = document.getElementById('blogEditorCoverPreview');
  const coverPlaceholder = document.getElementById('blogEditorCoverPlaceholder');

  if (post) {
    titleEl.value = post.title || '';
    categoryEl.value = post.category || 'Genel';
    authorEl.value = post.author || 'UGT';
    excerptEl.value = post.excerpt || '';
    contentEl.innerHTML = post.content || '';
    if (post.coverImage) {
      coverPreview.innerHTML = `<img src="${escapeAttr(post.coverImage)}"><button class="blog-editor-cover-remove" onclick="event.stopPropagation();removeCoverImage()">✕</button>`;
      coverPreview.style.display = 'block';
      coverPlaceholder.style.display = 'none';
      coverPreview.dataset.url = post.coverImage;
    } else {
      coverPreview.style.display = 'none';
      coverPlaceholder.style.display = 'flex';
      coverPreview.dataset.url = '';
    }
  } else {
    titleEl.value = '';
    categoryEl.value = 'Haber';
    authorEl.value = 'UGT';
    excerptEl.value = '';
    contentEl.innerHTML = '';
    coverPreview.style.display = 'none';
    coverPlaceholder.style.display = 'flex';
    coverPreview.dataset.url = '';
  }

  setBlogView('editor');
  titleEl.focus();
  updateWordCount();
}

window.blogEditorBack = function() {
  if (blogState.editingPost) {
    showBlogPost(blogState.editingPost.id);
  } else {
    setBlogView('listing');
  }
};

window.blogEditCurrent = function() {
  if (blogState.currentPost) showBlogEditor(blogState.currentPost);
};

window.blogDeleteCurrent = function() {
  if (!blogState.currentPost) return;
  if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;

  fetch(ENDPOINTS.blog, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'delete', id: blogState.currentPost.id, password: blogState.password }),
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      blogState.currentPost = null;
      setBlogView('listing');
      fetchBlogPosts();
    } else {
      alert('Silme hatası: ' + (data.error || ''));
    }
  })
  .catch(() => alert('Bağlantı hatası'));
};

// ─── Blog: Save Post ──────────────────────────────────────────
window.saveBlogPost = function(status) {
  const title = document.getElementById('blogEditorTitle').value.trim();
  const category = document.getElementById('blogEditorCategory').value;
  const author = document.getElementById('blogEditorAuthor').value.trim();
  const excerpt = document.getElementById('blogEditorExcerpt').value.trim();
  const content = document.getElementById('blogEditorContent').innerHTML;
  const coverImage = document.getElementById('blogEditorCoverPreview').dataset.url || '';

  if (!title) {
    alert('Başlık gerekli.');
    document.getElementById('blogEditorTitle').focus();
    return;
  }

  const data = {
    action: blogState.editingPost ? 'update' : 'create',
    password: blogState.password,
    title, excerpt: excerpt || title.substring(0, 150), content, category, coverImage,
    author: author || 'UGT', status,
  };
  if (blogState.editingPost) data.id = blogState.editingPost.id;

  const btns = document.querySelectorAll('.blog-editor-topbar-actions button');
  btns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });

  fetch(ENDPOINTS.blog, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
  })
  .then(r => r.json())
  .then(res => {
    btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
    if (res.success) { setBlogView('listing'); fetchBlogPosts(); }
    else alert('Kaydetme hatası: ' + (res.error || ''));
  })
  .catch(() => {
    btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
    alert('Bağlantı hatası');
  });
};

// ─── Blog: Image Upload ───────────────────────────────────────
function uploadImageToServer(file) {
  return new Promise((resolve, reject) => {
    resizeImage(file, 1200, (base64, mimeType) => {
      fetch(ENDPOINTS.blog, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'upload', password: blogState.password,
          imageData: base64, mimeType, fileName: file.name,
        }),
      })
      .then(r => r.json())
      .then(data => data.success ? resolve(data.url) : reject(new Error(data.error)))
      .catch(reject);
    });
  });
}

function resizeImage(file, maxWidth, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, mimeType === 'image/png' ? 1 : 0.85);
      callback(dataUrl.split(',')[1], mimeType);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

window.handleCoverImageSelect = function(e) {
  const file = e.target.files[0];
  if (file) handleCoverImage(file);
};

function handleCoverImage(file) {
  const preview = document.getElementById('blogEditorCoverPreview');
  const placeholder = document.getElementById('blogEditorCoverPlaceholder');

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}"><div class="blog-editor-cover-uploading">Yükleniyor...</div>`;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);

  uploadImageToServer(file)
    .then(url => {
      preview.dataset.url = url;
      preview.innerHTML = `<img src="${url}"><button class="blog-editor-cover-remove" onclick="event.stopPropagation();removeCoverImage()">✕</button>`;
    })
    .catch(() => {
      preview.innerHTML += '<div class="blog-editor-cover-error">Yükleme hatası</div>';
    });
}

window.removeCoverImage = function() {
  const preview = document.getElementById('blogEditorCoverPreview');
  const placeholder = document.getElementById('blogEditorCoverPlaceholder');
  preview.style.display = 'none';
  preview.dataset.url = '';
  preview.innerHTML = '';
  placeholder.style.display = 'flex';
  document.getElementById('coverImageInput').value = '';
};

function insertImageToEditor(file) {
  const editorContent = document.getElementById('blogEditorContent');
  const placeholder = document.createElement('div');
  placeholder.className = 'blog-img-uploading';
  placeholder.textContent = 'Görsel yükleniyor...';

  const sel = window.getSelection();
  if (sel.rangeCount && editorContent.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(placeholder);
  } else {
    editorContent.appendChild(placeholder);
  }

  uploadImageToServer(file)
    .then(url => {
      const figure = document.createElement('figure');
      figure.className = 'blog-content-image';
      figure.contentEditable = 'false';
      figure.innerHTML = `<img src="${url}" alt="">` +
        `<div class="blog-image-actions">` +
        `<button class="blog-image-action-btn delete" title="Görseli Sil" onclick="this.closest('figure').nextElementSibling||this.closest('figure').parentNode.appendChild(document.createElement('p'));this.closest('figure').remove()">` +
        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>` +
        `<figcaption contenteditable="true" data-placeholder="Açıklama ekle..."></figcaption>`;
      placeholder.replaceWith(figure);
      // Ensure there's a paragraph after the figure for continued typing
      if (!figure.nextElementSibling) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        figure.parentNode.insertBefore(p, figure.nextSibling);
      }
    })
    .catch(() => {
      placeholder.textContent = 'Görsel yüklenemedi';
      placeholder.classList.add('blog-img-error');
    });
}

// ─── Blog: Audio Insert ──────────────────────────────────────
function insertAudioToEditor(file) {
  const editorContent = document.getElementById('blogEditorContent');
  const placeholder = document.createElement('div');
  placeholder.className = 'blog-audio-uploading';
  placeholder.textContent = 'Ses dosyası yükleniyor...';

  const sel = window.getSelection();
  if (sel.rangeCount && editorContent.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(placeholder);
  } else {
    editorContent.appendChild(placeholder);
  }

  // Convert audio to base64 and upload to server
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1];
    const mimeType = file.type || 'audio/mpeg';

    fetch(ENDPOINTS.blog, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'upload', password: blogState.password,
        imageData: base64, mimeType, fileName: file.name,
      }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const audioWrap = document.createElement('div');
        audioWrap.className = 'blog-audio-embed';
        audioWrap.contentEditable = 'false';
        audioWrap.innerHTML =
          `<div class="blog-audio-player">` +
          `<div class="blog-audio-icon">` +
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` +
          `</div>` +
          `<div class="blog-audio-info">` +
          `<span class="blog-audio-name">${escapeHtml(file.name)}</span>` +
          `<audio controls src="${data.url}" preload="metadata"></audio>` +
          `</div>` +
          `<button class="blog-audio-remove" title="Kaldır" onclick="this.closest('.blog-audio-embed').nextElementSibling||this.closest('.blog-audio-embed').parentNode.appendChild(document.createElement('p'));this.closest('.blog-audio-embed').remove()">` +
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
          `</button>` +
          `</div>`;
        placeholder.replaceWith(audioWrap);
        if (!audioWrap.nextElementSibling) {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          audioWrap.parentNode.insertBefore(p, audioWrap.nextSibling);
        }
      } else {
        placeholder.textContent = 'Ses dosyası yüklenemedi';
        placeholder.classList.add('blog-audio-error');
      }
    })
    .catch(() => {
      placeholder.textContent = 'Ses dosyası yüklenemedi';
      placeholder.classList.add('blog-audio-error');
    });
  };
  reader.readAsDataURL(file);
}

// ─── Blog: Word Count ────────────────────────────────────────
function updateWordCount() {
  const content = document.getElementById('blogEditorContent');
  if (!content) return;
  const text = content.innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.replace(/\s/g, '').length;
  const wordEl = document.getElementById('blogWordCount');
  const charEl = document.getElementById('blogCharCount');
  if (wordEl) wordEl.textContent = words;
  if (charEl) charEl.textContent = chars;
}

// ─── Blog: Floating Toolbar ──────────────────────────────────
let blogSavedRange = null;

function saveCursorRange() {
  const sel = window.getSelection();
  if (sel.rangeCount) blogSavedRange = sel.getRangeAt(0).cloneRange();
}

function restoreCursorRange() {
  if (blogSavedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(blogSavedRange);
  }
}

function initBlogToolbar() {
  const toolbar = document.getElementById('blogToolbar');
  const editorContent = document.getElementById('blogEditorContent');
  const linkPopover = document.getElementById('blogLinkPopover');
  const linkInput = document.getElementById('blogLinkInput');
  const embedPopover = document.getElementById('blogEmbedPopover');
  const embedInput = document.getElementById('blogEmbedInput');
  const insertMenu = document.getElementById('blogInsertMenu');
  const insertToggle = document.getElementById('blogInsertToggle');
  const insertOptions = document.getElementById('blogInsertOptions');

  if (!toolbar || !editorContent) return;

  // ── Floating toolbar button actions ──
  toolbar.querySelectorAll('.blog-toolbar-btn').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const cmd = btn.dataset.cmd;
      const val = btn.dataset.val;

      if (cmd === 'createLink') {
        saveCursorRange();
        toolbar.style.display = 'none';
        const rect = toolbar.getBoundingClientRect();
        linkPopover.style.left = rect.left + 'px';
        linkPopover.style.top = (rect.top + window.scrollY) + 'px';
        linkPopover.style.display = 'flex';
        linkInput.value = '';
        linkInput.focus();
      } else if (cmd === 'formatBlock') {
        const block = getParentBlock();
        document.execCommand('formatBlock', false, (block && block.tagName === val) ? 'P' : val);
      } else {
        document.execCommand(cmd, false, val || null);
      }
    });
  });

  // ── Link popover actions ──
  function applyLink() {
    const url = linkInput.value.trim();
    if (url) {
      restoreCursorRange();
      document.execCommand('createLink', false, url);
      // Make link open in new tab
      const sel = window.getSelection();
      if (sel.rangeCount) {
        let node = sel.anchorNode;
        while (node && node.tagName !== 'A') node = node.parentNode;
        if (node && node.tagName === 'A') {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    linkPopover.style.display = 'none';
  }

  document.getElementById('blogLinkConfirm').addEventListener('click', applyLink);
  document.getElementById('blogLinkCancel').addEventListener('click', () => {
    linkPopover.style.display = 'none';
  });
  linkInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
    if (e.key === 'Escape') linkPopover.style.display = 'none';
  });

  // ── Embed popover actions ──
  function applyEmbed() {
    const url = embedInput.value.trim();
    if (url) {
      restoreCursorRange();
      // Check for YouTube
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
      // Check for Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

      if (ytMatch) {
        insertVideoEmbed('youtube', ytMatch[1]);
      } else if (vimeoMatch) {
        insertVideoEmbed('vimeo', vimeoMatch[1]);
      } else {
        insertLinkCard(url);
      }
    }
    embedPopover.style.display = 'none';
  }

  document.getElementById('blogEmbedConfirm').addEventListener('click', applyEmbed);
  document.getElementById('blogEmbedCancel').addEventListener('click', () => {
    embedPopover.style.display = 'none';
  });
  embedInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyEmbed(); }
    if (e.key === 'Escape') embedPopover.style.display = 'none';
  });

  // ── Selection change → show/hide toolbar ──
  document.addEventListener('selectionchange', () => {
    if (blogState.view !== 'editor') return;
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed || !editorContent.contains(sel.anchorNode)) {
      toolbar.style.display = 'none';
      updateInsertMenu();
      return;
    }

    // Show toolbar above selection
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    toolbar.style.display = 'flex';
    const toolbarRect = toolbar.getBoundingClientRect();
    toolbar.style.left = Math.max(8, rect.left + rect.width / 2 - toolbarRect.width / 2) + 'px';
    toolbar.style.top = (rect.top - toolbarRect.height - 10 + window.scrollY) + 'px';

    // Update active states
    toolbar.querySelectorAll('.blog-toolbar-btn').forEach(btn => {
      const cmd = btn.dataset.cmd;
      if (['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'].includes(cmd)) {
        btn.classList.toggle('active', document.queryCommandState(cmd));
      } else if (cmd === 'formatBlock') {
        const block = getParentBlock();
        btn.classList.toggle('active', block && block.tagName === btn.dataset.val);
      }
    });

    // Hide insert menu when selecting text
    if (insertMenu) insertMenu.style.display = 'none';
  });

  // ── Click outside to close toolbar/popovers ──
  document.addEventListener('mousedown', (e) => {
    if (!toolbar.contains(e.target) && !editorContent.contains(e.target)) toolbar.style.display = 'none';
    if (linkPopover && !linkPopover.contains(e.target)) linkPopover.style.display = 'none';
    if (embedPopover && !embedPopover.contains(e.target)) embedPopover.style.display = 'none';
    if (insertOptions && !insertMenu.contains(e.target)) {
      insertOptions.style.display = 'none';
      insertToggle.classList.remove('open');
    }
  });

  // ── Keyboard shortcuts ──
  editorContent.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
      if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
      if (e.key === 'u') { e.preventDefault(); document.execCommand('underline'); }
      if (e.key === 'k') {
        e.preventDefault();
        saveCursorRange();
        const sel = window.getSelection();
        if (sel.rangeCount) {
          const rect = sel.getRangeAt(0).getBoundingClientRect();
          linkPopover.style.left = Math.max(8, rect.left) + 'px';
          linkPopover.style.top = (rect.top - 50 + window.scrollY) + 'px';
          linkPopover.style.display = 'flex';
          linkInput.value = '';
          linkInput.focus();
        }
      }
    }
  });

  // ── Word count updates ──
  editorContent.addEventListener('input', updateWordCount);
  updateWordCount();

  // ── Side "+" Insert Menu ──
  function updateInsertMenu() {
    if (!insertMenu || blogState.view !== 'editor') {
      if (insertMenu) insertMenu.style.display = 'none';
      return;
    }
    const sel = window.getSelection();
    if (!sel.rangeCount || !sel.isCollapsed || !editorContent.contains(sel.anchorNode)) {
      insertMenu.style.display = 'none';
      return;
    }

    // Check if cursor is on an empty line
    let block = sel.anchorNode;
    if (block.nodeType === 3) block = block.parentNode;
    while (block && block !== editorContent && !['P','DIV','H1','H2','H3','H4','BLOCKQUOTE','LI','PRE'].includes(block.tagName)) {
      block = block.parentNode;
    }

    if (block && block !== editorContent) {
      const rect = block.getBoundingClientRect();
      const wrapRect = editorContent.closest('.blog-editor-wrap').getBoundingClientRect();
      insertMenu.style.display = 'flex';
      insertMenu.style.left = (wrapRect.left - 44) + 'px';
      insertMenu.style.top = (rect.top + window.scrollY + rect.height / 2 - 16) + 'px';
    } else {
      insertMenu.style.display = 'none';
      insertOptions.style.display = 'none';
      insertToggle.classList.remove('open');
    }
  }

  // Update insert menu on caret move
  editorContent.addEventListener('keyup', updateInsertMenu);
  editorContent.addEventListener('click', updateInsertMenu);

  // Toggle insert options
  insertToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = insertOptions.style.display === 'flex';
    insertOptions.style.display = isOpen ? 'none' : 'flex';
    insertToggle.classList.toggle('open', !isOpen);
  });

  // Insert option handlers
  document.querySelectorAll('.blog-insert-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = btn.dataset.insert;
      insertOptions.style.display = 'none';
      insertToggle.classList.remove('open');
      insertMenu.style.display = 'none';

      editorContent.focus();

      if (type === 'image') {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = () => { if (input.files[0]) insertImageToEditor(input.files[0]); };
        input.click();
      } else if (type === 'audio') {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'audio/*';
        input.onchange = () => { if (input.files[0]) insertAudioToEditor(input.files[0]); };
        input.click();
      } else if (type === 'video' || type === 'link') {
        saveCursorRange();
        const rect = editorContent.getBoundingClientRect();
        embedPopover.style.left = (rect.left + rect.width / 2 - 210) + 'px';
        embedPopover.style.top = (insertMenu.getBoundingClientRect().top + window.scrollY) + 'px';
        embedPopover.style.display = 'block';
        embedInput.value = '';
        embedInput.placeholder = type === 'video'
          ? 'YouTube veya Vimeo URL yapıştırın...'
          : 'Bağlantı URL yapıştırın...';
        embedInput.focus();
        // Tag embed type for handler
        embedPopover.dataset.insertType = type;
      } else if (type === 'divider') {
        document.execCommand('insertHTML', false, '<hr><p><br></p>');
      } else if (type === 'code') {
        document.execCommand('formatBlock', false, 'PRE');
      }
    });
  });
}

function getParentBlock() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  let node = sel.anchorNode;
  while (node && node !== document.getElementById('blogEditorContent')) {
    if (node.nodeType === 1 && /^(H[1-6]|P|BLOCKQUOTE|DIV|LI|UL|OL|PRE)$/.test(node.tagName)) return node;
    node = node.parentNode;
  }
  return null;
}

function insertVideoEmbed(platform, id) {
  let src = '';
  if (platform === 'youtube') src = `https://www.youtube.com/embed/${id}`;
  else if (platform === 'vimeo') src = `https://player.vimeo.com/video/${id}`;

  document.execCommand('insertHTML', false,
    `<div class="blog-youtube-embed"><iframe src="${src}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`);
}

function insertYoutubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (!match) { alert('Geçerli bir YouTube URL\'si girin.'); return; }
  insertVideoEmbed('youtube', match[1]);
}

function insertLinkCard(url) {
  try {
    const hostname = new URL(url).hostname;
    const html = `<div class="blog-link-card" contenteditable="false">` +
      `<div class="blog-link-card-body">` +
      `<div class="blog-link-card-title">${escapeHtml(url)}</div>` +
      `<div class="blog-link-card-url">` +
      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` +
      `<span>${escapeHtml(hostname)}</span></div></div></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
  } catch {
    document.execCommand('createLink', false, url);
  }
}

// ─── Blog: HTML Sanitization ──────────────────────────────────
function sanitizeBlogHtml(html) {
  const allowed = ['P','BR','B','STRONG','I','EM','U','S','STRIKE','DEL','A','H1','H2','H3','H4','BLOCKQUOTE','UL','OL','LI','IMG','FIGURE','FIGCAPTION','DIV','SPAN','IFRAME','PRE','CODE','HR','SVG','PATH','LINE','POLYLINE','CIRCLE','RECT','TEXT','BUTTON','AUDIO'];
  const allowedAttrs = ['href','src','alt','class','target','rel','frameborder','allowfullscreen','data-placeholder','contenteditable','title','onclick','viewBox','width','height','fill','stroke','stroke-width','stroke-linecap','d','x1','y1','x2','y2','points','cx','cy','r','x','y','font-size','font-weight','font-family','controls','preload'];

  const div = document.createElement('div');
  div.innerHTML = html;

  function cleanNode(node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 1) {
        if (!allowed.includes(child.tagName)) {
          while (child.firstChild) node.insertBefore(child.firstChild, child);
          node.removeChild(child);
        } else {
          for (const attr of Array.from(child.attributes)) {
            if (!allowedAttrs.includes(attr.name)) child.removeAttribute(attr.name);
          }
          if (child.hasAttribute('href') && child.getAttribute('href').toLowerCase().trim().startsWith('javascript')) child.removeAttribute('href');
          if (child.hasAttribute('src') && child.getAttribute('src').toLowerCase().trim().startsWith('javascript')) child.removeAttribute('src');
          cleanNode(child);
        }
      }
    }
  }

  cleanNode(div);
  return div.innerHTML;
}

// ─── Blog: Utility ────────────────────────────────────────────
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
