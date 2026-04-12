/* ============================================================
   ODTÜ Uluslararası Gençlik Topluluğu — Main Script
   ============================================================ */

'use strict';

// ─── Google Apps Script Endpoints ────────────────────────────
const ENDPOINTS = {
  // Kendi Google Apps Script endpoint URL'nizi buraya yapıştırın
  contact: 'https://script.google.com/macros/s/AKfycbxtk9Nalnsa3FKhZw5z-zmt_eYYmwKs_dw1i0m_6WNBKaVwoUk8k9qQQCaQ2zLAFSrB/exec',
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
