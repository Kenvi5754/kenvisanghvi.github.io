/**
 * Kenvi Sanghvi — Revamped Portfolio
 * GSAP + ScrollTrigger + Lenis smooth scroll
 * Text splitting, parallax, magnetic buttons, custom cursor, counters
 */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  // ─── Lenis Smooth Scroll ───────────────────────
  const lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ─── Loader ────────────────────────────────────
  var loader = document.getElementById('loader');
  window.addEventListener('load', function () {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      delay: 0.8,
      onComplete: function () {
        loader.classList.add('is-done');
        var h = window.location.hash;
        if (h && h.length > 1) {
          var deep = document.querySelector(h);
          if (deep) {
            lenis.scrollTo(deep, { offset: -72 });
          }
        }
        animateHero();
      }
    });
  });

  // ─── Current year ──────────────────────────────
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── Custom Cursor ─────────────────────────────
  var cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    var dot = cursor.querySelector('.cursor-dot');
    var ring = cursor.querySelector('.cursor-ring');
    var mouseX = 0, mouseY = 0;
    var dotX = 0, dotY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    gsap.ticker.add(function () {
      dotX += (mouseX - dotX) * 0.25;
      dotY += (mouseY - dotY) * 0.25;
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      dot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px) translate(-50%, -50%)';
      ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
    });

    document.querySelectorAll('a, button, [data-magnetic]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hovering'); });
    });
  }

  // ─── Magnetic Elements ─────────────────────────
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' });
      });
    });
  }

  // ─── Text Splitting ────────────────────────────
  function splitText(el) {
    var text = el.textContent;
    el.innerHTML = '';
    var words = text.split(/\s+/);
    words.forEach(function (word, wi) {
      var wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      word.split('').forEach(function (char) {
        var charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });
      el.appendChild(wordSpan);
      if (wi < words.length - 1) {
        var space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        el.appendChild(space);
      }
    });
    return el.querySelectorAll('.char');
  }

  // ─── Hero Animations ──────────────────────────
  function animateHero() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Split hero title
    var heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      var chars = splitText(heroTitle);
      tl.to(chars, {
        y: 0, opacity: 1, duration: 0.8,
        stagger: 0.02
      }, 0.2);
    }

    // Fade-up elements in hero
    document.querySelectorAll('.hero [data-animate="fade-up"]').forEach(function (el) {
      var delay = parseFloat(el.getAttribute('data-delay')) || 0;
      tl.from(el, {
        y: 40, opacity: 0, duration: 0.9
      }, delay);
    });

    // Hero counter animation (on load)
    document.querySelectorAll('.hero [data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2,
        delay: 1.8,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].val);
        }
      });
    });
  }

  // ─── Scroll Animations ─────────────────────────
  function initScrollAnimations() {
    // Generic fade-up
    gsap.utils.toArray('[data-animate="fade-up"]').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 50, opacity: 0, duration: 0.9,
        delay: parseFloat(el.getAttribute('data-delay')) || 0,
        ease: 'power3.out'
      });
    });

    // About section counters (scroll-triggered)
    document.querySelectorAll('.about [data-counter]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(obj.val);
            }
          });
        }
      });
    });

    // Split-text titles outside hero
    gsap.utils.toArray('[data-animate="split-text"]').forEach(function (el) {
      if (el.closest('.hero')) return;
      var chars = splitText(el);
      gsap.to(chars, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        y: 0, opacity: 1, duration: 0.7,
        stagger: 0.015,
        ease: 'power3.out'
      });
    });

    // Work cards staggered
    var workCards = gsap.utils.toArray('[data-animate="work-card"]');
    if (workCards.length) {
      gsap.from(workCards, {
        scrollTrigger: {
          trigger: '#work-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 80, opacity: 0, duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }

    // Timeline items
    gsap.utils.toArray('[data-animate="timeline"]').forEach(function (el, i) {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        x: -40, opacity: 0, duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out'
      });
    });

    // Parallax on about image
    var aboutImg = document.querySelector('[data-animate="parallax-img"]');
    if (aboutImg) {
      gsap.to(aboutImg, {
        scrollTrigger: {
          trigger: aboutImg,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        },
        y: -60,
        ease: 'none'
      });
    }

    // Section tinted bg scale
    gsap.utils.toArray('.section--tinted').forEach(function (sec) {
      gsap.from(sec, {
        scrollTrigger: {
          trigger: sec,
          start: 'top 95%',
          toggleActions: 'play none none none'
        },
        opacity: 0.5,
        duration: 1,
        ease: 'power2.out'
      });
    });
  }

  // Init scroll animations immediately
  initScrollAnimations();

  // ─── Header hide/show on scroll ────────────────
  var header = document.getElementById('header');
  var lastScrollY = 0;
  lenis.on('scroll', function (e) {
    var scrollY = e.animatedScroll || 0;
    if (scrollY > 100 && scrollY > lastScrollY) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastScrollY = scrollY;
  });

  // ─── Mobile Nav Toggle ─────────────────────────
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      this.classList.toggle('is-active', !expanded);
      nav.classList.toggle('is-open', !expanded);
      if (!expanded) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        lenis.start();
      });
    });
  }

  // ─── Portfolio Filter ──────────────────────────
  var filterBtns = document.querySelectorAll('.filter-btn');
  var workGrid = document.getElementById('work-grid');
  if (workGrid && filterBtns.length) {
    var cards = workGrid.querySelectorAll('.work-card');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        cards.forEach(function (card) {
          var cat = card.getAttribute('data-category');
          var show = filter === '*' || cat === filter;
          if (show) {
            card.classList.remove('hidden');
            gsap.from(card, { opacity: 0, y: 30, duration: 0.5, ease: 'power3.out' });
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  // ─── Smooth scroll for anchor links ────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var id = anchor.getAttribute('href');
    if (id === '#') return;
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -72 });
      }
    });
  });

  // ─── 3D Tilt Engine ────────────────────────────
  // Applies perspective tilt + optional glare to any [data-tilt] element
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var maxTilt = parseFloat(el.getAttribute('data-tilt-max')) || 10;
      var hasGlare = el.hasAttribute('data-tilt-glare');

      el.style.transformStyle = 'preserve-3d';
      if (!el.parentElement.style.perspective) {
        el.parentElement.style.perspective = '1000px';
      }

      // Inject glare overlay
      if (hasGlare) {
        var glare = document.createElement('div');
        glare.className = 'tilt-glare';
        el.appendChild(glare);
      }

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var midX = rect.width / 2;
        var midY = rect.height / 2;
        var rotY = ((x - midX) / midX) * maxTilt;
        var rotX = ((midY - y) / midY) * maxTilt;

        gsap.to(el, {
          rotateX: rotX,
          rotateY: rotY,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        if (hasGlare) {
          var percX = (x / rect.width * 100).toFixed(1);
          var percY = (y / rect.height * 100).toFixed(1);
          el.style.setProperty('--glare-x', percX + '%');
          el.style.setProperty('--glare-y', percY + '%');
        }
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'elastic.out(1,0.5)',
          overwrite: 'auto'
        });
      });
    });
  }

  // ─── Hero mouse-tracking parallax ─────────────
  var heroSection = document.querySelector('.hero');
  var heroIllustration = document.querySelector('.hero-illustration-wrap');
  var floatIcons = document.querySelectorAll('.float-icon');
  if (heroSection && heroIllustration && window.matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      var xRatio = (e.clientX - rect.left) / rect.width - 0.5;
      var yRatio = (e.clientY - rect.top) / rect.height - 0.5;

      // Subtle shift on the whole illustration
      gsap.to(heroIllustration, {
        x: xRatio * 15,
        y: yRatio * 10,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Float icons move at different depths
      floatIcons.forEach(function (icon, i) {
        var depth = 20 + i * 12;
        gsap.to(icon, {
          x: xRatio * depth,
          y: yRatio * depth,
          duration: 0.6 + i * 0.1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }

  // ─── Runaway "No" button ───────────────────────
  var noBtn = document.getElementById('like-no');
  var yesBtn = document.getElementById('like-yes');
  var likeResponse = document.getElementById('like-response');
  if (noBtn) {
    var escapeCount = 0;
    var messages = [
      "Nice try!",
      "Not happening.",
      "You sure about that?",
      "Nope, can't click me!",
      "I'm too fast for you!",
      "Just click Yes already!",
      "Still trying? Respect.",
      "I can do this all day."
    ];

    function runAway() {
      escapeCount++;
      var parent = noBtn.closest('.like-buttons');
      var parentRect = parent.getBoundingClientRect();
      var btnRect = noBtn.getBoundingClientRect();

      var maxX = parentRect.width - btnRect.width;
      var maxY = 120;
      var randX = (Math.random() - 0.5) * maxX;
      var randY = (Math.random() * maxY) - maxY / 2;

      gsap.to(noBtn, {
        x: randX,
        y: randY,
        duration: 0.3,
        ease: 'power3.out'
      });

      if (likeResponse && escapeCount <= messages.length) {
        likeResponse.textContent = messages[Math.min(escapeCount - 1, messages.length - 1)];
      }
    }

    noBtn.addEventListener('mouseenter', runAway);
    noBtn.addEventListener('touchstart', function (e) { e.preventDefault(); runAway(); });
    noBtn.addEventListener('focus', runAway);

    if (yesBtn && likeResponse) {
      yesBtn.addEventListener('click', function () {
        likeResponse.textContent = "Knew it! Thank you so much! 🧡";
        gsap.fromTo(likeResponse, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
        gsap.to(yesBtn, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
        gsap.to(noBtn, { opacity: 0.3, duration: 0.4 });

        var feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
          feedbackBox.style.display = 'block';
          gsap.fromTo(feedbackBox, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power3.out' });
        }
      });
    }
  }

  // ─── Feedback submit (Formspree via fetch) ─────
  var feedbackForm = document.getElementById('feedback-box');
  var feedbackInput = document.getElementById('feedback-input');
  var feedbackThanks = document.getElementById('feedback-thanks');
  var feedbackSubmit = document.getElementById('feedback-submit');
  if (feedbackForm && feedbackInput && feedbackThanks) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = feedbackInput.value.trim();
      if (!val) {
        gsap.fromTo(feedbackInput, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' });
        feedbackInput.focus();
        return;
      }

      feedbackSubmit.disabled = true;
      feedbackSubmit.style.opacity = '0.5';

      fetch(feedbackForm.action, {
        method: 'POST',
        body: new FormData(feedbackForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          feedbackThanks.textContent = "Thanks for being honest — I'll take that to heart!";
          feedbackInput.disabled = true;
        } else {
          feedbackThanks.textContent = "Something went wrong — try emailing me at sanghvikenvi@gmail.com";
          feedbackSubmit.disabled = false;
          feedbackSubmit.style.opacity = '1';
        }
        gsap.fromTo(feedbackThanks, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
      }).catch(function () {
        feedbackThanks.textContent = "Network error — try emailing me at sanghvikenvi@gmail.com";
        feedbackSubmit.disabled = false;
        feedbackSubmit.style.opacity = '1';
        gsap.fromTo(feedbackThanks, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
      });
    });
  }

  // ─── About section: floating pills alternate tools ↔ skills every 5s ─
  var skillPills = document.querySelectorAll('.about-visual .skill-float');
  var pillToolLabels = [
    'Canva',
    'Adobe Illustrator',
    'Adobe Photoshop',
    'Adobe InDesign',
    'Premiere Pro',
    'Mobile Video Editors'
  ];
  var pillSkillLabels = [
    'UX/UI Design',
    'Graphic Design',
    'Branding',
    'Web Design',
    'Photo Editing',
    'Social Media'
  ];
  if (
    skillPills.length === pillToolLabels.length &&
    skillPills.length === pillSkillLabels.length &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    var pillsShowTools = true;
    function applyPillLabels(labels) {
      skillPills.forEach(function (pill, i) {
        var label = labels[i];
        gsap.to(pill, {
          opacity: 0.4,
          duration: 0.22,
          ease: 'power1.inOut',
          onComplete: function () {
            pill.textContent = label;
            gsap.to(pill, { opacity: 1, duration: 0.3, ease: 'power2.out' });
          }
        });
      });
    }
    setInterval(function () {
      pillsShowTools = !pillsShowTools;
      applyPillLabels(pillsShowTools ? pillToolLabels : pillSkillLabels);
    }, 5000);
  }

  // ─── Flip-word hint: fade out after first hover ──
  var hoverHint = document.querySelector('.hover-hint');
  if (hoverHint) {
    var flipWords = document.querySelectorAll('.flip-word');
    var hintHidden = false;
    flipWords.forEach(function (word) {
      word.addEventListener('mouseenter', function () {
        if (!hintHidden) {
          hintHidden = true;
          gsap.to(hoverHint, { opacity: 0, duration: 0.4, onComplete: function () {
            hoverHint.style.display = 'none';
          }});
        }
      });
    });
  }

})();
