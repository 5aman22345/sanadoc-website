/* ============================================
   MAIN.JS — Sanadoc
   ============================================ */

'use strict';

/* -----------------------------------------------
   1. STICKY NAVBAR
   Adds .scrolled class when scrolled > 50px
----------------------------------------------- */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is already scrolled
})();


/* -----------------------------------------------
   2. HAMBURGER MENU (Mobile)
----------------------------------------------- */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');

    // Animate hamburger bars to X
    const bars = hamburger.querySelectorAll('.hamburger__bar');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity = '';
      bars[2].style.transform = '';
    }
  });

  // Close nav when a link is clicked
  nav.querySelectorAll('.navbar__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Menü öffnen');
      const bars = hamburger.querySelectorAll('.hamburger__bar');
      bars[0].style.transform = '';
      bars[1].style.opacity = '';
      bars[2].style.transform = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      const bars = hamburger.querySelectorAll('.hamburger__bar');
      bars[0].style.transform = '';
      bars[1].style.opacity = '';
      bars[2].style.transform = '';
    }
  });
})();


/* -----------------------------------------------
   3. FAQ ACCORDION
   One item open at a time, + rotates to ×
----------------------------------------------- */
(function initFaqAccordion() {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  const items = faqList.querySelectorAll('.faq__item');

  items.forEach(function (item) {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!question || !answer) return;

    question.addEventListener('click', function () {
      const isCurrentlyOpen = item.classList.contains('active');

      // Close all
      items.forEach(function (otherItem) {
        otherItem.classList.remove('active');
        const otherQ = otherItem.querySelector('.faq__question');
        if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isCurrentlyOpen) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* -----------------------------------------------
   4. SCROLL ANIMATIONS (IntersectionObserver)
   Elements with .fade-in-up get .visible when
   they enter the viewport
----------------------------------------------- */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in-up');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* -----------------------------------------------
   5. SMOOTH SCROLL for anchor links
----------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = document.getElementById('navbar')
        ? document.getElementById('navbar').offsetHeight
        : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* -----------------------------------------------
   6. MEETING FORM — sendet an info@sanadoc.ai
   via Web3Forms (web3forms.com → Access Key holen)
----------------------------------------------- */
(function initMeetingForm() {
  var WEB3FORMS_KEY = '60c5f45c-403e-4bd9-9e6b-e387c624364c'; // web3forms.com → Key für info@sanadoc.ai eintragen

  var form = document.getElementById('meeting-form');
  var submitBtn = document.getElementById('meeting-submit');
  if (!form || !submitBtn) return;

  var inputs = form.querySelectorAll('.meeting__input');

  function checkFields() {
    var allFilled = Array.from(inputs).every(function (input) {
      return input.value.trim().length > 0;
    });
    submitBtn.disabled = !allFilled;
  }

  inputs.forEach(function (input) {
    input.addEventListener('input', checkFields);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = (form.querySelector('#meeting-name')   || {}).value || '';
    var praxis = (form.querySelector('#meeting-praxis') || {}).value || '';
    var email = (form.querySelector('#meeting-email')  || {}).value || '';
    if (!name.trim() || !email.trim()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet…';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'Neue Meeting-Anfrage – Sanadoc',
        name: name.trim(),
        praxis: praxis.trim(),
        email: email.trim()
      })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.success) {
        submitBtn.textContent = '✓ Anfrage gesendet!';
        form.reset();
        checkFields();
      } else {
        submitBtn.textContent = 'Fehler – bitte erneut versuchen';
        submitBtn.disabled = false;
      }
    })
    .catch(function () {
      submitBtn.textContent = 'Fehler – bitte erneut versuchen';
      submitBtn.disabled = false;
    });
  });

  checkFields();
})();


/* -----------------------------------------------
   7. CONTACT FORM — sendet an info@sanadoc.ai
   via Web3Forms
----------------------------------------------- */
(function initContactForm() {
  var WEB3FORMS_KEY = '60c5f45c-403e-4bd9-9e6b-e387c624364c'; // gleicher Key wie oben

  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('.contact__submit');
    var inputs = form.querySelectorAll('input, textarea');
    var data = { access_key: WEB3FORMS_KEY, subject: 'Neue Kontaktanfrage – Sanadoc' };
    inputs.forEach(function (el) {
      if (el.name) data[el.name] = el.value;
    });
    // Felder ohne name-Attribut manuell mappen
    var allInputs = form.querySelectorAll('input, textarea');
    var labels = ['name','email','telefon','datum','nachricht'];
    allInputs.forEach(function (el, i) { if (!el.name && labels[i]) data[labels[i]] = el.value; });

    if (btn) { btn.textContent = 'Wird gesendet…'; btn.disabled = true; }

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) { return res.json(); })
    .then(function (result) {
      if (btn) {
        if (result.success) {
          btn.textContent = '✓ Nachricht gesendet!';
          form.reset();
          setTimeout(function () { btn.textContent = 'Absenden'; btn.disabled = false; }, 3000);
        } else {
          btn.textContent = 'Fehler – bitte erneut versuchen';
          btn.disabled = false;
        }
      }
    })
    .catch(function () {
      if (btn) { btn.textContent = 'Fehler – bitte erneut versuchen'; btn.disabled = false; }
    });
  });
})();


/* -----------------------------------------------
   8. PRICING TOGGLE — monatlich / jährlich
----------------------------------------------- */
(function initPricingToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const priceAmounts = document.querySelectorAll('.price-amount');
  const discountBadges = document.querySelectorAll('.pricing-badge--discount');

  if (!toggleBtns.length) return;

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const freq = btn.dataset.freq;
      priceAmounts.forEach(function (el) {
        el.textContent = el.dataset[freq];
      });
      discountBadges.forEach(function (badge) {
        badge.classList.toggle('hidden', freq === 'monthly');
      });
    });
  });
})();


/* -----------------------------------------------
   9. NEWSLETTER FORM — basic submit feedback
----------------------------------------------- */
(function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const input = form.querySelector('.footer__newsletter-input');
    if (!input || !input.value.trim()) return;
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Angemeldet';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = orig;
        btn.disabled = false;
        form.reset();
      }, 3000);
    }
  });
})();

// ============================================
// INTERAKTIVER RECHNER
// ============================================
document.addEventListener('DOMContentLoaded', function () {

  var calcCurrent = { minuten: 750, umsatz: 750, stunden: 13, tage: 2 };

  function calcFormat(id, value) {
    if (id === 'result-umsatz') return value.toLocaleString('de-DE') + ' \u20ac';
    return value.toLocaleString('de-DE');
  }

  function calcAnimate(el, from, to) {
    if (!el) return;
    if (from === to) { el.textContent = calcFormat(el.id, to); return; }
    var start = performance.now();
    var diff = to - from;
    function step(ts) {
      var elapsed = ts - start;
      var progress = Math.min(elapsed / 600, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = calcFormat(el.id, Math.round(from + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function calcUpdate() {
    var dokuMin      = parseInt(document.getElementById('slider-doku').value);
    var terminMin    = parseInt(document.getElementById('slider-termin').value);
    var termineWoche = parseInt(document.getElementById('slider-termine').value);
    var verdienst    = parseInt(document.getElementById('slider-verdienst').value);
    var stundenTag   = parseInt(document.getElementById('slider-stunden').value);

    document.getElementById('val-doku').textContent      = dokuMin + ' min';
    document.getElementById('val-termin').textContent    = terminMin + ' min';
    document.getElementById('val-termine').textContent   = termineWoche;
    document.getElementById('val-verdienst').textContent = verdienst + ' \u20ac';
    document.getElementById('val-stunden').textContent   = stundenTag + ' h';

    console.log('Rechner: Slider bewegt', { dokuMin: dokuMin, termineWoche: termineWoche });

    var termineMonat   = termineWoche * 4;
    var minutenGespart = Math.round(dokuMin * termineMonat * 0.70);
    var stundenGespart = Math.round(minutenGespart / 60);
    var tageGespart    = Math.round(stundenGespart / stundenTag * 10) / 10;
    var umsatzGespart  = Math.round(stundenGespart * (verdienst / terminMin * 60));

    calcAnimate(document.getElementById('result-minuten'), calcCurrent.minuten, minutenGespart);
    calcAnimate(document.getElementById('result-umsatz'),  calcCurrent.umsatz,  umsatzGespart);
    calcAnimate(document.getElementById('result-stunden'), calcCurrent.stunden, stundenGespart);
    calcAnimate(document.getElementById('result-tage'),    calcCurrent.tage,    Math.round(tageGespart));

    calcCurrent.minuten = minutenGespart;
    calcCurrent.umsatz  = umsatzGespart;
    calcCurrent.stunden = stundenGespart;
    calcCurrent.tage    = Math.round(tageGespart);
  }

  var firstSlider = document.getElementById('slider-doku');
  console.log('Rechner geladen:', firstSlider);

  if (!firstSlider) return;

  ['slider-doku', 'slider-termin', 'slider-termine', 'slider-verdienst', 'slider-stunden'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        console.log('Slider bewegt:', id);
        calcUpdate();
      });
    }
  });

  calcUpdate();
});


/* -----------------------------------------------
   10. MAGIC LINE NAVBAR
----------------------------------------------- */
(function initMagicLine() {
  var nav = document.querySelector('header#navbar');
  if (!nav) return;

  var magicLine = document.createElement('div');
  magicLine.style.cssText = 'position:absolute; bottom:0; height:2px; background:#3B82F6; transition:left 0.28s ease, width 0.28s ease, opacity 0.2s ease; opacity:0; pointer-events:none; z-index:999;';
  nav.appendChild(magicLine);

  var links = nav.querySelectorAll('a:not(.btn--primary)');

  links.forEach(function(link) {
    link.addEventListener('mouseenter', function() {
      var navRect = nav.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      magicLine.style.opacity = '1';
      magicLine.style.width = linkRect.width + 'px';
      magicLine.style.left = (linkRect.left - navRect.left) + 'px';
    });
  });

  nav.addEventListener('mouseleave', function() {
    magicLine.style.opacity = '0';
  });
})();
