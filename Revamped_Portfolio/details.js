/**
 * Portfolio Details — Horizontal Scroll Gallery
 * GSAP ScrollTrigger pin + scrub + Lenis smooth scroll
 */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Lenis smooth scroll (tuned for ScrollTrigger + horizontal gallery) ── */
  var lenis = new Lenis({
    duration: 1.05,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: !reduceMotion,
    wheelMultiplier: reduceMotion ? 1 : 1.15,
    touchMultiplier: reduceMotion ? 1 : 1.15,
    syncTouch: !reduceMotion,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* Keep ScrollTrigger and Lenis reading the same scroll position (fixes pin + scrub glitches). */
  ScrollTrigger.scrollerProxy(root, {
    scrollTop: function (value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect: function () {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  ScrollTrigger.addEventListener('refresh', function () {
    lenis.resize();
  });

  /* ── Header hide on scroll ── */
  var header = document.querySelector('.detail-header');
  var lastY = 0;
  if (header) {
    lenis.on('scroll', function (e) {
      var y = e.animatedScroll || 0;
      if (y > 150 && y > lastY) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      lastY = y;
    });
  }

  /* ── Hero entrance ── */
  var heroEls = document.querySelectorAll('.detail-hero-content > *');
  if (heroEls.length) {
    gsap.from(heroEls, {
      y: 40, opacity: 0, duration: 0.8,
      stagger: 0.12, ease: 'power3.out', delay: 0.15
    });
  }
  var heroVisual = document.querySelector('.detail-hero-visual');
  if (heroVisual && window.matchMedia('(min-width: 980px)').matches) {
    gsap.from(heroVisual, {
      opacity: 0, x: 48, duration: 1, ease: 'power3.out', delay: 0.4
    });
  }

  /* ── Horizontal scroll gallery ── */
  var track = document.querySelector('.gallery-track');
  var wrap = document.querySelector('.gallery-wrap');
  var panels = gsap.utils.toArray('.gallery-panel');
  var counter = document.querySelector('.img-counter');
  var progressBar = document.querySelector('.gallery-progress-bar');
  var progressWrap = document.querySelector('.gallery-progress');

  if (track && wrap && panels.length) {
    var total = panels.length;

    function getScrollAmount() {
      var extra = track.scrollWidth - window.innerWidth;
      return extra > 0 ? -extra : 0;
    }

    function refreshGalleryScroll() {
      ScrollTrigger.refresh();
    }

    var imgs = track.querySelectorAll('img');
    var mediaPending = 0;
    imgs.forEach(function (img) {
      if (img.complete) return;
      mediaPending += 1;
      function onMediaDone() {
        img.removeEventListener('load', onMediaDone);
        img.removeEventListener('error', onMediaDone);
        mediaPending -= 1;
        if (mediaPending === 0) requestAnimationFrame(refreshGalleryScroll);
      }
      img.addEventListener('load', onMediaDone);
      img.addEventListener('error', onMediaDone);
    });
    if (mediaPending === 0) requestAnimationFrame(refreshGalleryScroll);

    var galleryTween = gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        scroller: root,
        trigger: wrap,
        start: 'top top',
        end: function () { return '+=' + Math.max(1, Math.abs(getScrollAmount())); },
        pin: true,
        pinSpacing: true,
        pinType: 'fixed',
        anticipatePin: 1,
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;

          if (progressBar) {
            progressBar.style.width = (p * 100) + '%';
          }

          if (counter) {
            var idx = Math.min(total, Math.round(p * total) + 1);
            counter.textContent = idx + ' / ' + total;
          }
        },
        onEnter: function () {
          if (progressWrap) progressWrap.classList.add('is-active');
          if (counter) counter.classList.add('is-active');
        },
        onLeave: function () {
          if (progressWrap) progressWrap.classList.remove('is-active');
          if (counter) counter.classList.remove('is-active');
        },
        onEnterBack: function () {
          if (progressWrap) progressWrap.classList.add('is-active');
          if (counter) counter.classList.add('is-active');
        },
        onLeaveBack: function () {
          if (progressWrap) progressWrap.classList.remove('is-active');
          if (counter) counter.classList.remove('is-active');
        }
      }
    });

    /* Per-panel entrance: scale + fade as they scroll into view */
    panels.forEach(function (panel) {
      gsap.from(panel, {
        scale: 0.88,
        opacity: 0.3,
        rotateY: -4,
        scrollTrigger: {
          scroller: root,
          trigger: panel,
          containerAnimation: galleryTween,
          start: 'left 95%',
          end: 'left 60%',
          scrub: true
        }
      });
    });

    /* Recalculate on resize */
    window.addEventListener('resize', function () {
      ScrollTrigger.refresh();
    });
  }

  /* ── Scroll-to-top button ── */
  var scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) {
    lenis.on('scroll', function (e) {
      var y = e.animatedScroll || 0;
      if (y > 400) scrollBtn.classList.add('is-visible');
      else scrollBtn.classList.remove('is-visible');
    });
    scrollBtn.addEventListener('click', function () {
      lenis.scrollTo(0);
    });
  }

  /* ── Anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target); }
    });
  });
})();
