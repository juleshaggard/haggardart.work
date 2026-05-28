(function () {
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!body) return;

  body.classList.add("mystic-enhanced");

  const glyphs = "AETHER0123456789XVIM*+-/\\";

  function init() {
    const headings = splitHeadings();
    addProgress();

    if (!gsap) {
      headings.forEach((heading) => heading.classList.add("is-awake"));
      return;
    }

    gsap.defaults({ ease: "power3.out", duration: 0.7, overwrite: "auto" });

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    revealHeadings(headings);
    initRevealPass();
    initRitualDetails();

    if (!reduceMotion && finePointer) {
      initMagneticPull();
    }
  }

  function splitHeadings() {
    return Array.from(document.querySelectorAll("h1, h2, h3"))
      .filter((heading) => !heading.dataset.mysticHeading)
      .map((heading) => {
        const label = heading.textContent.replace(/\s+/g, " ").trim();
        const index = { value: 0 };

        heading.dataset.mysticHeading = "true";
        heading.classList.add("mystic-heading");

        if (label) {
          heading.setAttribute("aria-label", label);
        }

        Array.from(heading.childNodes).forEach((node) => splitNode(node, index));
        return heading;
      });
  }

  function splitNode(node, index) {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      const parts = node.nodeValue.split(/(\s+)/);

      parts.forEach((part) => {
        if (!part) return;

        if (/^\s+$/.test(part)) {
          const space = document.createElement("span");
          space.className = "mystic-space";
          space.setAttribute("aria-hidden", "true");
          space.textContent = "\u00a0";
          fragment.appendChild(space);
          return;
        }

        const word = document.createElement("span");
        word.className = "mystic-word";

        Array.from(part).forEach((letter) => {
          const char = document.createElement("span");
          char.className = "mystic-char";
          char.dataset.char = letter;
          char.style.setProperty("--mystic-i", index.value);
          char.setAttribute("aria-hidden", "true");
          char.textContent = letter;
          word.appendChild(char);
          index.value += 1;
        });

        fragment.appendChild(word);
      });

      node.replaceWith(fragment);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE || node.tagName === "BR") return;
    Array.from(node.childNodes).forEach((child) => splitNode(child, index));
  }

  function revealHeadings(headings) {
    headings.forEach((heading, headingIndex) => {
      const chars = Array.from(heading.querySelectorAll(".mystic-char"));
      if (!chars.length) {
        heading.classList.add("is-awake");
        return;
      }

      heading.addEventListener("mouseenter", () => pulseHeading(chars), { passive: true });

      if (reduceMotion || !ScrollTrigger) {
        heading.classList.add("is-awake");
        return;
      }

      const isHero = heading.classList.contains("hpherotext");
      const fromY = isHero ? 0.92 : 0.54;

      gsap.set(chars, {
        autoAlpha: 0,
        y: `${fromY}em`,
        z: -24,
        rotationX: -68,
        rotationZ: (i) => (i % 2 ? -1.2 : 1.2),
      });

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
        onStart: () => wakeGlyphs(chars, headingIndex),
        onComplete: () => heading.classList.add("is-awake"),
      });

      timeline.to(chars, {
        autoAlpha: 1,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationZ: 0,
        duration: isHero ? 1.26 : 0.98,
        stagger: {
          each: isHero ? 0.034 : 0.021,
          from: "random",
        },
      });

      ScrollTrigger.create({
        trigger: heading,
        start: isHero ? "top 96%" : "top 88%",
        once: true,
        onEnter: () => timeline.play(0),
      });
    });
  }

  function wakeGlyphs(chars, offset) {
    if (reduceMotion || !gsap) return;

    chars.forEach((char, i) => {
      const original = char.dataset.char || char.textContent;
      if (!/[A-Za-z0-9]/.test(original)) return;

      const swaps = 2 + ((i + offset) % 4);
      const baseDelay = i * 0.014;

      for (let step = 0; step < swaps; step += 1) {
        gsap.delayedCall(baseDelay + step * 0.045, () => {
          char.textContent = glyphs[(i * 7 + step * 11 + offset) % glyphs.length];
        });
      }

      gsap.delayedCall(baseDelay + swaps * 0.045, () => {
        char.textContent = original;
      });
    });
  }

  function pulseHeading(chars) {
    if (reduceMotion || !gsap) return;

    wakeGlyphs(chars, 3);
    gsap.to(chars, {
      y: (i) => `${i % 2 ? -0.06 : 0.06}em`,
      rotationZ: (i) => (i % 2 ? -1.4 : 1.4),
      duration: 0.42,
      ease: "sine.inOut",
      stagger: { amount: 0.18, from: "center" },
      repeat: 1,
      yoyo: true,
    });
  }

  function initRevealPass() {
    if (reduceMotion || !ScrollTrigger) return;

    const targets = gsap.utils.toArray(
      ".project > .w-inline-block:first-child, .projectlink, .projectimgdata, .project-img-with-caption, .about"
    );

    gsap.set(targets, { autoAlpha: 0, y: 30 });

    ScrollTrigger.batch(targets, {
      start: "top 88%",
      once: true,
      interval: 0.08,
      batchMax: 6,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.92,
          ease: "power3.out",
          stagger: 0.075,
          clearProps: "opacity,visibility,transform",
        });
      },
    });
  }

  function initRitualDetails() {
    if (reduceMotion || !gsap) return;

    gsap.to(".topleft, .topright, .bottomleft, .bottomright", {
      rotation: "+=180",
      duration: 18,
      ease: "none",
      repeat: -1,
      stagger: { each: 0.35, from: "center" },
    });

    gsap.to(".hero-footername", {
      y: -8,
      rotation: -0.45,
      duration: 5.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.18,
    });
  }

  function initMagneticPull() {
    const targets = Array.from(document.querySelectorAll(".button, .projectlink, .nav a"));

    targets.forEach((target) => {
      const xTo = gsap.quickTo(target, "x", { duration: 0.42, ease: "power3.out" });
      const yTo = gsap.quickTo(target, "y", { duration: 0.42, ease: "power3.out" });

      target.addEventListener(
        "pointermove",
        (event) => {
          const bounds = target.getBoundingClientRect();
          const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
          const y = (event.clientY - bounds.top - bounds.height / 2) * 0.16;
          xTo(x);
          yTo(y);
        },
        { passive: true }
      );

      target.addEventListener(
        "pointerleave",
        () => {
          xTo(0);
          yTo(0);
          gsap.to(target, { scale: 1, duration: 0.24, ease: "power2.out" });
        },
        { passive: true }
      );

      target.addEventListener(
        "pointerdown",
        () => {
          gsap.to(target, { scale: 0.985, duration: 0.14, ease: "power2.out" });
        },
        { passive: true }
      );

      target.addEventListener(
        "pointerup",
        () => {
          gsap.to(target, { scale: 1, duration: 0.24, ease: "power2.out" });
        },
        { passive: true }
      );
    });
  }

  function addProgress() {
    if (document.querySelector(".mystic-progress")) return;

    const progress = document.createElement("div");
    progress.className = "mystic-progress";
    body.appendChild(progress);

    if (!gsap || !ScrollTrigger || reduceMotion) return;

    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
      },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
