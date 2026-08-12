/* S.T.A.R.S — intro, Lusion-style scroll */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const VISIT_KEY = "stars_visited_session";
  const isFirstVisit = !sessionStorage.getItem(VISIT_KEY);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const intro = document.getElementById("intro");
  const site = document.getElementById("site");
  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

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

        // Mobile / reduced motion: show content immediately (no lag / hidden cards)
        if (rm || !isDesktop) {
          gsap.set(".reveal", { clearProps: "all", autoAlpha: 1, x: 0, y: 0, rotateY: 0 });
          return;
        }

        gsap.utils.toArray(".reveal").forEach((el, i) => {
          const delay = parseFloat(el.dataset.delay || "0");
          const fromLeft = i % 2 === 0;
          const xFrom = fromLeft ? -100 : 100;

          gsap.fromTo(
            el,
            {
              autoAlpha: 0,
              x: xFrom,
              y: 18,
              rotateY: fromLeft ? 12 : -12,
              transformPerspective: 1000,
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              rotateY: 0,
              duration: 1.2,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            }
          );
        });

        gsap.utils.toArray(".section").forEach((section, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          const head = section.querySelector(".section__head");
          if (!head || head.classList.contains("reveal")) return;

          gsap.fromTo(
            head,
            { autoAlpha: 0, x: 80 * dir },
            {
              autoAlpha: 1,
              x: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                once: true,
              },
            }
          );
        });

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
    );

    ScrollTrigger.refresh();
  }

  /* ---------- Welcome to S.T.A.R.S brand reveal ---------- */
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

    tl.to(".intro__eyebrow", { autoAlpha: 1, duration: 0.3 }, 0.12);

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

    const outro = gsap.timeline({
      onComplete: () => {
        intro.classList.remove("is-active");
        intro.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-intro-active");
        site.classList.add("is-ready");
        gsap.set(".reveal", { clearProps: "all", autoAlpha: 1, x: 0, y: 0 });
        initScrollAnimations();
        initProcessGuide();
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
    gsap.set(".reveal", { clearProps: "all", autoAlpha: 1, x: 0, y: 0 });
    initScrollAnimations();
    initProcessGuide();
    initCardTilt();
  }

  function runFirstVisitIntro() {
    document.body.classList.add("is-intro-active");
    intro.classList.add("is-active");
    intro.setAttribute("aria-hidden", "false");
    playBrandReveal();
  }

  /* ---------- Process guide ---------- */
  function sceneIntro(scene, immediateRender = true) {
    const tl = gsap.timeline();
    const pops = scene.querySelectorAll("[data-pop]");
    const draws = scene.querySelectorAll("[data-draw]");
    const aim = scene.querySelector("[data-aim]");

    if (pops.length) {
      tl.from(
        pops,
        {
          autoAlpha: 0,
          scale: 0.86,
          y: 12,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.out",
          immediateRender,
        },
        0
      );
    }
    if (draws.length) {
      tl.from(
        draws,
        {
          autoAlpha: 0,
          y: 8,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.out",
          immediateRender,
        },
        0.08
      );
    }
    if (aim) {
      tl.fromTo(
        aim,
        { rotation: 16 },
        {
          rotation: -6,
          duration: 0.7,
          ease: "power2.inOut",
          transformOrigin: "50% 85%",
          immediateRender,
        },
        0.1
      );
    }
    return tl;
  }

  function initProcessGuide() {
    const roots = document.querySelectorAll("[data-process]");
    if (!roots.length) return;

    roots.forEach((root) => {
      if (root.dataset.ready) return;
      root.dataset.ready = "1";

      const mode = root.dataset.process;
      const pin = root.querySelector(".process__pin");
      const texts = gsap.utils.toArray(root.querySelectorAll(".process__text"));
      const scenes = gsap.utils.toArray(root.querySelectorAll(".process__scene"));
      const dots = gsap.utils.toArray(root.querySelectorAll(".process__dot"));
      const kickerNum = root.querySelector(".process__kicker-num");
      const bar = root.querySelector(".process__bar-fill");
      const count = texts.length;
      if (!count) return;

      const setActive = (index) => {
        texts.forEach((el, i) => el.classList.toggle("is-active", i === index));
        scenes.forEach((el, i) => el.classList.toggle("is-active", i === index));
        dots.forEach((el, i) => {
          el.classList.toggle("is-active", i === index);
          el.setAttribute("aria-selected", String(i === index));
        });
        if (kickerNum) kickerNum.textContent = String(index + 1).padStart(2, "0");
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 781px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion: rm } = context.conditions;

          if (rm || !isDesktop) {
            gsap.set([texts, scenes], { clearProps: "all" });
            setActive(0);
            return;
          }

          gsap.set(texts, { autoAlpha: 0, y: 22 });
          gsap.set(scenes, { autoAlpha: 0, scale: 0.97 });
          gsap.set(texts[0], { autoAlpha: 1, y: 0 });
          gsap.set(scenes[0], { autoAlpha: 1, scale: 1 });
          gsap.set(bar, { scaleX: 1 / count });
          setActive(0);

          if (mode === "scroll") {
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root,
                pin,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * 3.1)}`,
                scrub: 0.7,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  const i = Math.min(count - 1, Math.floor(self.progress * count));
                  setActive(i);
                  if (bar) gsap.set(bar, { scaleX: Math.max(1 / count, self.progress) });
                },
              },
            });

            for (let i = 1; i < count; i++) {
              tl.to(texts[i - 1], { autoAlpha: 0, y: -18, duration: 0.3 }, i)
                .to(scenes[i - 1], { autoAlpha: 0, scale: 0.97, duration: 0.3 }, i)
                .fromTo(
                  texts[i],
                  { autoAlpha: 0, y: 22 },
                  { autoAlpha: 1, y: 0, duration: 0.35, immediateRender: false },
                  i + 0.08
                )
                .fromTo(
                  scenes[i],
                  { autoAlpha: 0, scale: 0.97 },
                  { autoAlpha: 1, scale: 1, duration: 0.35, immediateRender: false },
                  i + 0.08
                )
                .add(sceneIntro(scenes[i], false), i + 0.12);
            }

            tl.to({}, { duration: 0.45 });

            const scrollHandlers = dots.map((dot, i) => {
              const onClick = () => {
                const st = tl.scrollTrigger;
                if (!st) return;
                const progress = (i + 0.45) / count;
                const top = st.start + (st.end - st.start) * progress;
                window.scrollTo({ top, behavior: "smooth" });
              };
              dot.addEventListener("click", onClick);
              return [dot, onClick];
            });

            return () => {
              scrollHandlers.forEach(([dot, onClick]) => dot.removeEventListener("click", onClick));
              tl.scrollTrigger?.kill();
              tl.kill();
            };
          }

          let current = 0;
          let hold = null;
          let loop = null;

          const showStep = (index) => {
            if (index === current) {
              setActive(index);
              return;
            }
            const prev = current;
            current = index;
            setActive(index);
            gsap
              .timeline({ defaults: { ease: "power2.out" } })
              .to(texts[prev], { autoAlpha: 0, y: -16, duration: 0.32 }, 0)
              .to(scenes[prev], { autoAlpha: 0, scale: 0.97, duration: 0.32 }, 0)
              .fromTo(
                texts[index],
                { autoAlpha: 0, y: 18 },
                { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" },
                0.1
              )
              .fromTo(
                scenes[index],
                { autoAlpha: 0, scale: 0.97 },
                { autoAlpha: 1, scale: 1, duration: 0.42, ease: "power3.out" },
                0.1
              )
              .add(sceneIntro(scenes[index]), 0.12);
            if (bar) {
              gsap.to(bar, {
                scaleX: (index + 1) / count,
                duration: 0.45,
                ease: "power2.out",
              });
            }
          };

          const armLoop = () => {
            loop?.kill();
            loop = gsap.delayedCall(3.4, () => {
              showStep((current + 1) % count);
              armLoop();
            });
          };

          showStep(0);

          const visibility = ScrollTrigger.create({
            trigger: root,
            start: "top 85%",
            end: "bottom 15%",
            onEnter: () => {
              if (!loop) {
                sceneIntro(scenes[0]);
                armLoop();
              } else {
                loop.play();
              }
            },
            onEnterBack: () => loop?.play(),
            onLeave: () => loop?.pause(),
            onLeaveBack: () => loop?.pause(),
          });

          const playHandlers = dots.map((dot, i) => {
            const onClick = () => {
              loop?.kill();
              hold?.kill();
              showStep(i);
              hold = gsap.delayedCall(6, armLoop);
            };
            dot.addEventListener("click", onClick);
            return [dot, onClick];
          });

          return () => {
            playHandlers.forEach(([dot, onClick]) => dot.removeEventListener("click", onClick));
            loop?.kill();
            hold?.kill();
            visibility.kill();
          };
        }
      );
    });
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
  const canPlayIntro = isHome && intro;

  if (canPlayIntro && isFirstVisit && !reduceMotion) {
    runFirstVisitIntro();
  } else {
    skipToSite({
      markVisited: isHome || isFirstVisit,
      instant: reduceMotion,
    });
  }
})();
