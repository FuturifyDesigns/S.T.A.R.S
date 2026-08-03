/* S.T.A.R.S — intro, glass fall, Lusion-style scroll */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const VISIT_KEY = "stars_visited_session";
  const isFirstVisit = !sessionStorage.getItem(VISIT_KEY);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const intro = document.getElementById("intro");
  const video = document.getElementById("intro-video");
  const site = document.getElementById("site");
  const glassCanvas = document.getElementById("glass-fall");
  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

  let glassController = null;

  /* ---------- Mobile nav ---------- */
  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* Home logo is a normal link to index.html — no hash scroll hijack */

  /* ---------- Falling glass shards ---------- */
  function createGlassFall(canvas) {
    const ctx = canvas.getContext("2d");
    const shards = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let spawnAcc = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeShard = (fromTop = true) => {
      const size = gsap.utils.random(36, 88);
      const sides = Math.floor(gsap.utils.random(3, 5.9));
      const points = [];
      for (let i = 0; i < sides; i++) {
        const ang = (Math.PI * 2 * i) / sides + gsap.utils.random(-0.25, 0.25);
        const r = size * gsap.utils.random(0.45, 1);
        points.push([Math.cos(ang) * r, Math.sin(ang) * r]);
      }
      return {
        x: gsap.utils.random(w * 0.1, w * 0.9),
        y: fromTop ? gsap.utils.random(-160, -40) : gsap.utils.random(-100, h * 0.2),
        vx: gsap.utils.random(-0.3, 0.3),
        vy: gsap.utils.random(1.3, 2.8),
        rot: gsap.utils.random(0, Math.PI * 2),
        vr: gsap.utils.random(-0.03, 0.03),
        points,
        alpha: gsap.utils.random(0.42, 0.72),
        stroke: gsap.utils.random(0.75, 1),
      };
    };

    const drawShard = (s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);

      // soft depth shadow so shards read against light backgrounds
      ctx.shadowColor = "rgba(60, 80, 110, 0.28)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;

      ctx.beginPath();
      s.points.forEach(([px, py], i) => {
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();

      const grad = ctx.createLinearGradient(-40, -40, 50, 50);
      grad.addColorStop(0, `rgba(255,255,255,${Math.min(1, s.alpha + 0.35)})`);
      grad.addColorStop(0.35, `rgba(210,225,245,${s.alpha})`);
      grad.addColorStop(0.7, `rgba(160,180,210,${s.alpha * 0.75})`);
      grad.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.55})`);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.strokeStyle = `rgba(255,255,255,${s.stroke})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // bright edge highlight
      ctx.beginPath();
      ctx.moveTo(s.points[0][0] * 0.15, s.points[0][1] * 0.15);
      ctx.lineTo(s.points[1][0] * 0.7, s.points[1][1] * 0.7);
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, s.stroke)})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // secondary glint
      if (s.points[2]) {
        ctx.beginPath();
        ctx.moveTo(s.points[1][0] * 0.3, s.points[1][1] * 0.3);
        ctx.lineTo(s.points[2][0] * 0.45, s.points[2][1] * 0.45);
        ctx.strokeStyle = `rgba(200,220,245,${s.stroke * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    };

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      spawnAcc += dt;

      const footer = document.querySelector(".footer");
      const endY = footer ? footer.getBoundingClientRect().top + window.scrollY : document.body.scrollHeight;
      const progress = Math.min(1, (window.scrollY + window.innerHeight) / Math.max(endY, 1));
      const nearEnd = progress > 0.92;
      const maxShards = 5;
      const spawnEvery = nearEnd ? 9999 : 22;

      if (!nearEnd && shards.length < maxShards && spawnAcc > spawnEvery) {
        spawnAcc = 0;
        shards.push(makeShard(true));
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i];
        s.vy += 0.03 * dt;
        s.x += s.vx * dt * 1.1;
        s.y += s.vy * dt;
        s.rot += s.vr * dt;
        if (s.y > h + 80) {
          shards.splice(i, 1);
          continue;
        }
        drawShard(s);
      }

      if (nearEnd && shards.length === 0) {
        stop();
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      resize();
      for (let i = 0; i < 4; i++) shards.push(makeShard(true));
      canvas.classList.add("is-active");
      last = performance.now();
      raf = requestAnimationFrame(tick);
      window.addEventListener("resize", resize);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gsap.to(canvas, {
        autoAlpha: 0,
        duration: 1.2,
        ease: "power2.out",
        onComplete: () => {
          canvas.classList.remove("is-active");
          ctx.clearRect(0, 0, w, h);
        },
      });
    };

    return { start, stop };
  }

  /* ---------- Scroll reveals (always) ---------- */
  function initScrollAnimations() {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 781px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduceMotion: rm } = context.conditions;

        if (rm) {
          gsap.set(".reveal", { clearProps: "all", autoAlpha: 1, y: 0, x: 0 });
          return;
        }

        const xAmt = isDesktop ? 100 : 28;
        const rotAmt = isDesktop ? 12 : 0;

        gsap.utils.toArray(".reveal").forEach((el, i) => {
          const delay = parseFloat(el.dataset.delay || "0");
          const fromLeft = i % 2 === 0;
          const xFrom = fromLeft ? -xAmt : xAmt;

          gsap.fromTo(
            el,
            {
              autoAlpha: 0,
              x: xFrom,
              y: isDesktop ? 18 : 24,
              rotateY: fromLeft ? rotAmt : -rotAmt,
              transformPerspective: 1000,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              rotateY: 0,
              duration: isDesktop ? 1.2 : 0.85,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        // Section blocks: stronger Lusion left/right sweeps
        gsap.utils.toArray(".section").forEach((section, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          const head = section.querySelector(".section__head");
          if (!head || head.classList.contains("reveal")) return;

          gsap.fromTo(
            head,
            { autoAlpha: 0, x: (isDesktop ? 80 : 24) * dir },
            {
              autoAlpha: 1,
              x: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });

        if (isDesktop) {
          gsap.fromTo(
            ".hero__glow",
            { scale: 0.85, opacity: 0.5 },
            {
              scale: 1.08,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          gsap.to(".product-glass", {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }
    );

    ScrollTrigger.refresh();
  }

  /* ---------- Brand reveal after video ---------- */
  function playBrandReveal() {
    const stamps = gsap.utils.toArray(".intro__title > span");
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        finishIntro();
      },
    });

    gsap.set(".intro__brand", { autoAlpha: 1 });
    gsap.set(stamps, { autoAlpha: 0, scale: 1.7, y: -18 });
    gsap.set(".intro__eyebrow", { autoAlpha: 0 });
    gsap.set(".intro__expand span", { autoAlpha: 0 });
    gsap.set(".intro__tagline", { autoAlpha: 0 });

    // Light screen first so text is readable, then stamp S . T . A . R . S
    tl.to(".intro__fade", { opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
      .to(".intro__video", { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0)
      .to(".intro__eyebrow", { autoAlpha: 1, duration: 0.3 }, 0.18);

    stamps.forEach((el, i) => {
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 1.75, y: -22 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.22,
          ease: "back.out(3.2)",
        },
        0.38 + i * 0.13
      );
    });

    tl.to(
      ".intro__expand span",
      {
        autoAlpha: 1,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
      },
      "+=0.12"
    )
      .to(
        ".intro__tagline",
        {
          autoAlpha: 1,
          duration: 0.55,
          ease: "power2.out",
        },
        "-=0.1"
      )
      .to({}, { duration: 0.55 });

    return tl;
  }

  function finishIntro() {
    sessionStorage.setItem(VISIT_KEY, "1");

    // Glass starts only after S.T.A.R.S stamp + tagline finish
    if (!reduceMotion && glassController) glassController.start();

    const outro = gsap.timeline({
      onComplete: () => {
        intro.classList.remove("is-active");
        intro.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-intro-active");
        site.classList.add("is-ready");
        initScrollAnimations();
        initCardTilt();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      },
    });

    outro
      .to(intro, {
        autoAlpha: 0,
        duration: 0.45,
        ease: "power2.inOut",
      })
      .fromTo(
        site,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        "-=0.28"
      );
  }

  function skipToSite({ markVisited = true, instant = false } = {}) {
    if (markVisited) sessionStorage.setItem(VISIT_KEY, "1");
    intro?.classList.remove("is-active");
    intro?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-intro-active");
    site.classList.add("is-ready");
    if (instant) site.classList.add("is-instant");
    gsap.set(site, { autoAlpha: 1 });
    initScrollAnimations();
    initCardTilt();
  }

  function runFirstVisitIntro() {
    document.body.classList.add("is-intro-active");
    intro.classList.add("is-active");
    intro.setAttribute("aria-hidden", "false");
    glassController = createGlassFall(glassCanvas);

    const startBrand = () => {
      try {
        video.pause();
      } catch (_) {
        /* ignore */
      }
      playBrandReveal();
    };

    const failSafe = setTimeout(startBrand, 20000);

    video.addEventListener(
      "ended",
      () => {
        clearTimeout(failSafe);
        startBrand();
      },
      { once: true }
    );

    video.addEventListener(
      "error",
      () => {
        clearTimeout(failSafe);
        startBrand();
      },
      { once: true }
    );

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        // Autoplay blocked — fade straight into brand then site
        clearTimeout(failSafe);
        startBrand();
      });
    }
  }

  /* ---------- 3D card tilt ---------- */
  function initCardTilt() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll(".card, .price-card, .step");
    cards.forEach((card) => {
      if (card.dataset.tiltInit) return;
      card.dataset.tiltInit = "1";
      card.classList.add("tilt-card");

      if (!card.querySelector(".tilt-card__shine")) {
        const shine = document.createElement("span");
        shine.className = "tilt-card__shine";
        shine.setAttribute("aria-hidden", "true");
        card.appendChild(shine);
      }

      const maxTilt = 11;
      const lift = 12;

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotY = (x - 0.5) * maxTilt * 2;
        const rotX = (0.5 - y) * maxTilt * 2;

        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);

        gsap.to(card, {
          rotateX: rotX,
          rotateY: rotY,
          y: -lift,
          transformPerspective: 900,
          transformOrigin: "center center",
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onEnter = () => {
        card.classList.add("is-tilting");
      };

      const onLeave = () => {
        card.classList.remove("is-tilting");
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
    });
  }

  /* ---------- Form ---------- */
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    form.hidden = true;
    if (formNote) formNote.hidden = false;
  });

  /* ---------- Boot ---------- */
  const isHome = document.body.dataset.page === "home";
  const canPlayIntro = isHome && intro && video;

  if (canPlayIntro && isFirstVisit && !reduceMotion) {
    runFirstVisitIntro();
  } else {
    skipToSite({
      markVisited: isHome || isFirstVisit,
      instant: reduceMotion,
    });
  }
})();
