/* main.js - Vanta.js NET, Lenis Smooth Scroll, GSAP + ScrollTrigger */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

  // ==========================================
  // 1. LENIS SMOOTH SCROLL & GSAP SETUP
  // ==========================================
  let lenis = null;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Drive Lenis from GSAP's ticker (no independent RAF loop)
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Connect Lenis to ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, {
              offset: -70,
              duration: 1.2,
            });
            // Update hash without jumping
            history.pushState(null, null, targetId);
          }
        }
      });
    });

    // Also support terminal commands and button hash jumps with Lenis
    window.addEventListener('hashchange', () => {
      if (location.hash) {
        const el = document.querySelector(location.hash);
        if (el) {
          lenis.scrollTo(el, { offset: -70 });
        }
      }
    });
  }

  // ==========================================
  // 2. VANTA.JS NET BACKGROUND
  // ==========================================
  let vantaEffect = null;
  const vantaContainer = document.getElementById('vanta-bg');

  if (vantaContainer && typeof VANTA !== 'undefined' && VANTA.NET && !prefersReducedMotion) {
    try {
      // Color matching site theme:
      // --bg: #050a07 (0x050a07)
      // --g: #39ff88 (0x39ff88)
      // --glow: #8dffba
      vantaEffect = VANTA.NET({
        el: vantaContainer,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x22aa5b,
        backgroundColor: 0x050a07,
        points: isMobile ? 6.0 : 8.0,
        maxDistance: isMobile ? 15.0 : 18.0,
        spacing: isMobile ? 18.0 : 16.0,
        showDots: true,
      });

      // Cap pixel ratio on low-power/mobile devices to keep performance smooth (no jank)
      if (vantaEffect.renderer) {
        const maxPr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
        vantaEffect.renderer.setPixelRatio(maxPr);
      }
    } catch (err) {
      console.warn('Vanta initialization skipped or failed:', err);
    }
  }

  window.addEventListener('beforeunload', () => {
    if (vantaEffect && typeof vantaEffect.destroy === 'function') {
      vantaEffect.destroy();
    }
  });

  // ==========================================
  // 3. GSAP + SCROLLTRIGGER ANIMATIONS
  // ==========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    // Hero Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

    heroTl
      .from('.hero .prompt', {
        opacity: 0,
        y: 20,
        duration: 0.6,
      })
      .from(
        '.hero h1',
        {
          opacity: 0,
          y: 40,
          duration: 0.9,
        },
        '-=0.3'
      )
      .from(
        ['.hero .role', '.hero .tagline'],
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.15,
        },
        '-=0.5'
      )
      .from(
        ['.hero .actions .btn', '.hero .note'],
        {
          opacity: 0,
          y: 25,
          duration: 0.7,
          stagger: 0.1,
        },
        '-=0.5'
      )
      .from(
        '.hero .term',
        {
          opacity: 0,
          y: 40,
          scale: 0.96,
          duration: 0.9,
        },
        '-=0.8'
      );

    // Subtle parallax on the hero text
    gsap.to('.hero .wrap > div:first-child', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Scroll-triggered reveal animations for each section
    const sections = ['#about', '#skills', '#projects', '#experience', '#contact'];
    sections.forEach((secSelector) => {
      const sec = document.querySelector(secSelector);
      if (!sec) return;

      const headerElements = sec.querySelectorAll('.sec-tag, h2, .rule');
      if (headerElements.length > 0) {
        gsap.from(headerElements, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });

    // Reveal for About section content
    const aboutGrid = document.querySelector('.about-grid');
    if (aboutGrid) {
      gsap.from(aboutGrid.children, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutGrid,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Staggered reveal for Skill panels
    const skillPanels = document.querySelectorAll('#skillGrid .skill-panel');
    if (skillPanels.length > 0) {
      gsap.from(skillPanels, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#skillGrid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Staggered reveal for Project cards
    const projectCards = document.querySelectorAll('#projGrid .proj-card');
    if (projectCards.length > 0) {
      gsap.from(projectCards, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#projGrid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Reveal for Experience timeline items
    const tlItems = document.querySelectorAll('#tl .tl-item');
    if (tlItems.length > 0) {
      gsap.from(tlItems, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#tl',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Reveal for Contact section elements
    const contactGrid = document.querySelector('.contact-grid');
    if (contactGrid) {
      gsap.from(contactGrid.children, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: contactGrid,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Refresh ScrollTrigger after dynamic items are generated
    ScrollTrigger.refresh();
  }
});
