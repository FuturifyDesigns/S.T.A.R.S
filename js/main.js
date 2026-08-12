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
  function createFormDemo(scene) {
    const root = scene?.querySelector("[data-form-demo]");
    if (!root) return null;

    const body = root.querySelector(".browser-demo__body");
    const fields = [...root.querySelectorAll("[data-type]")];
    const btn = root.querySelector(".guide-form__btn");
    const done = root.querySelector(".browser-demo__done");
    let cancelled = true;
    let timer = 0;
    let running = false;

    const wait = (ms) =>
      new Promise((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const reset = () => {
      fields.forEach((el) => {
        el.textContent = "";
        el.closest(".guide-form__input")?.classList.remove("is-focused");
      });
      btn?.classList.remove("is-submitting");
      done?.classList.remove("is-visible");
      if (body) body.scrollTop = 0;
    };

    const scrollTo = (wrap) => {
      if (!body || !wrap) return;
      const top = wrap.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 18;
      body.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    const run = async () => {
      running = true;
      cancelled = false;
      while (!cancelled) {
        reset();
        await wait(600);
        if (cancelled) break;

        for (const el of fields) {
          if (cancelled) break;
          const wrap = el.closest(".guide-form__input");
          const full = el.getAttribute("data-type") || "";
          wrap?.classList.add("is-focused");
          scrollTo(wrap);

          for (let c = 1; c <= full.length; c++) {
            if (cancelled) break;
            el.textContent = full.slice(0, c);
            await wait(45);
          }

          if (cancelled) break;
          wrap?.classList.remove("is-focused");
          await wait(380);
        }

        if (cancelled) break;
        btn?.classList.add("is-submitting");
        await wait(1200);
        if (cancelled) break;
        btn?.classList.remove("is-submitting");
        done?.classList.add("is-visible");
        await wait(2800);
      }
      running = false;
    };

    return {
      start() {
        if (running) return;
        run();
      },
      stop() {
        cancelled = true;
        window.clearTimeout(timer);
        running = false;
        reset();
      },
    };
  }

  function sceneIntro(scene, immediateRender = true) {
    if (scene.querySelector("[data-form-demo]")) return gsap.timeline();

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

      const formDemo = createFormDemo(scenes[0]);
      const demo = { allowed: false };

      const syncProcessVideos = (index, { playAll = false, pauseAll = false } = {}) => {
        root.querySelectorAll(".process__video").forEach((video, i) => {
          video.muted = true;
          video.defaultMuted = true;
          video.volume = 0;
          video.loop = true;
          video.playsInline = true;
          if (pauseAll) {
            video.pause();
            return;
          }
          const shouldPlay = playAll || i === index;
          if (shouldPlay) {
            if (video.paused) {
              video.currentTime = 0;
              video.play()?.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      };

      const setActive = (index) => {
        texts.forEach((el, i) => el.classList.toggle("is-active", i === index));
        scenes.forEach((el, i) => el.classList.toggle("is-active", i === index));
        dots.forEach((el, i) => {
          el.classList.toggle("is-active", i === index);
          el.setAttribute("aria-selected", String(i === index));
        });
        if (kickerNum) kickerNum.textContent = String(index + 1).padStart(2, "0");
        if (index === 0 && demo.allowed) formDemo?.start();
        else if (index !== 0) formDemo?.stop();
        const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isDesktopNow = window.matchMedia("(min-width: 781px)").matches;
        if (prefersReduce) {
          syncProcessVideos(index, { pauseAll: true });
        } else if (!isDesktopNow) {
          syncProcessVideos(index, { playAll: true });
        } else if (demo.allowed) {
          syncProcessVideos(index);
        } else {
          syncProcessVideos(index, { pauseAll: true });
        }
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
            demo.allowed = !rm;
            setActive(0);
            if (rm) {
              formDemo?.stop();
              syncProcessVideos(0, { pauseAll: true });
            }
            return () => formDemo?.stop();
          }

          gsap.set(texts, { autoAlpha: 0, y: 22 });
          gsap.set(scenes, { autoAlpha: 0, scale: 0.97 });
          gsap.set(texts[0], { autoAlpha: 1, y: 0 });
          gsap.set(scenes[0], { autoAlpha: 1, scale: 1 });
          gsap.set(bar, { scaleX: 1 / count });
          setActive(0);

          if (mode === "scroll") {
            let lastStep = 0;

            const showExclusive = (index) => {
              texts.forEach((el, i) => {
                gsap.set(el, {
                  autoAlpha: i === index ? 1 : 0,
                  y: 0,
                  overwrite: true,
                });
              });
              scenes.forEach((el, i) => {
                gsap.set(el, {
                  autoAlpha: i === index ? 1 : 0,
                  scale: 1,
                  overwrite: true,
                });
              });
            };

            showExclusive(0);

            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root,
                pin,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * 3.1)}`,
                scrub: 0.55,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onToggle: (self) => {
                  demo.allowed = self.isActive;
                  if (self.isActive) {
                    const i = Math.min(count - 1, Math.floor(self.progress * 0.999 * count));
                    showExclusive(i);
                    setActive(i);
                    lastStep = i;
                  } else {
                    formDemo?.stop();
                    syncProcessVideos(0, { pauseAll: true });
                  }
                },
                onUpdate: (self) => {
                  const i = Math.min(count - 1, Math.floor(self.progress * 0.999 * count));
                  if (i !== lastStep) {
                    showExclusive(i);
                    setActive(i);
                    lastStep = i;
                  }
                  if (bar) gsap.set(bar, { scaleX: Math.max(1 / count, self.progress) });
                },
              },
            });

            // Scrub length only — step visibility is handled exclusively in onUpdate
            tl.to({}, { duration: count });

            const scrollHandlers = dots.map((dot, i) => {
              const onClick = () => {
                const st = tl.scrollTrigger;
                if (!st) return;
                const progress = (i + 0.5) / count;
                const top = st.start + (st.end - st.start) * progress;
                window.scrollTo({ top, behavior: "smooth" });
              };
              dot.addEventListener("click", onClick);
              return [dot, onClick];
            });

            return () => {
              formDemo?.stop();
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
            loop = gsap.delayedCall(current === 0 ? 12 : 4.2, () => {
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
              demo.allowed = true;
              if (!loop) {
                formDemo?.start();
                armLoop();
              } else {
                loop.play();
                if (current === 0) formDemo?.start();
              }
              setActive(current);
            },
            onEnterBack: () => {
              demo.allowed = true;
              loop?.play();
              if (current === 0) formDemo?.start();
              setActive(current);
            },
            onLeave: () => {
              demo.allowed = false;
              loop?.pause();
              formDemo?.stop();
              syncProcessVideos(0, { pauseAll: true });
            },
            onLeaveBack: () => {
              demo.allowed = false;
              loop?.pause();
              formDemo?.stop();
              syncProcessVideos(0, { pauseAll: true });
            },
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
            formDemo?.stop();
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

  /* ---------- Form validation ---------- */
  const formFields = form
    ? {
        name: {
          input: form.querySelector("#contact-name"),
          error: form.querySelector("#contact-name-error"),
          validate(value) {
            const v = value.trim();
            if (!v) return "Please enter your name.";
            if (v.length < 2) return "Name must be at least 2 characters.";
            if (/\d/.test(v)) return "Name should not contain numbers.";
            if (!/^[a-zA-Z\s'.-]+$/.test(v)) return "Use letters only.";
            return "";
          },
        },
        phone: {
          input: form.querySelector("#contact-phone"),
          error: form.querySelector("#contact-phone-error"),
          validate(value) {
            const digits = value.replace(/\D/g, "");
            if (!digits) return "Please enter your phone number.";
            const local = digits.startsWith("267") ? digits.slice(3) : digits;
            if (local.length !== 8) return "Enter a valid 8-digit Botswana mobile number.";
            if (!/^7\d{7}$/.test(local)) return "Mobile numbers should start with 7 (e.g. 71 234 567).";
            return "";
          },
        },
        message: {
          input: form.querySelector("#contact-message"),
          error: form.querySelector("#contact-message-error"),
          validate(value) {
            const v = value.trim();
            if (!v) return "Tell us where you need internet.";
            if (v.length < 10) return "Please add a bit more detail (at least 10 characters).";
            return "";
          },
        },
      }
    : null;

  function setFieldState(field, message) {
    if (!field?.input || !field.error) return;
    const invalid = Boolean(message);
    field.input.setAttribute("aria-invalid", String(invalid));
    field.input.closest(".field")?.classList.toggle("is-invalid", invalid);
    field.error.textContent = message;
  }

  function validateField(field) {
    if (!field?.input) return true;
    const message = field.validate(field.input.value);
    setFieldState(field, message);
    return !message;
  }

  function validateForm() {
    if (!formFields) return false;
    let firstInvalid = null;
    let valid = true;
    Object.values(formFields).forEach((field) => {
      if (!validateField(field)) {
        valid = false;
        if (!firstInvalid) firstInvalid = field.input;
      }
    });
    firstInvalid?.focus();
    return valid;
  }

  if (formFields) {
    Object.values(formFields).forEach((field) => {
      field.input?.addEventListener("input", () => {
        if (form.dataset.touched === "1") validateField(field);
      });
      field.input?.addEventListener("blur", () => {
        if (form.dataset.touched === "1") validateField(field);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.dataset.touched = "1";
      if (!validateForm()) return;
      form.hidden = true;
      if (formNote) formNote.hidden = false;
    });
  }

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
