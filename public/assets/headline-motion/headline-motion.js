(() => {
  const gsap = window.gsap;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (!gsap || reduceMotion) {
    return;
  }

  const headlineSelector = [
    ".hpherotext",
    ".heading.inverse",
    ".project-title",
    ".projectheading",
  ].join(",");

  const headings = Array.from(document.querySelectorAll(headlineSelector))
    .filter((heading) => !heading.closest(".nav") && heading.textContent.trim().length);

  if (!headings.length) {
    return;
  }

  const tokenise = (root) => {
    const tokens = [];

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const pieces = node.textContent.match(/\S+|\s+/gu) || [];
        pieces.forEach((piece) => {
          tokens.push(/\s/u.test(piece[0])
            ? { type: "space", value: piece }
            : { type: "word", value: piece });
        });
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      if (node.tagName === "BR") {
        tokens.push({ type: "br" });
        return;
      }

      Array.from(node.childNodes).forEach(walk);
    };

    Array.from(root.childNodes).forEach(walk);
    return tokens;
  };

  const appendChars = (parent, text, className) => {
    Array.from(text).forEach((char) => {
      const span = document.createElement("span");
      span.className = className;
      span.textContent = char;
      parent.append(span);
    });
  };

  const makeLayer = (tokens, layerClass, charClass) => {
    const layer = document.createElement("span");
    layer.className = layerClass;
    layer.setAttribute("aria-hidden", "true");

    tokens.forEach((token) => {
      if (token.type === "br") {
        layer.append(document.createElement("br"));
        return;
      }

      if (token.type === "space") {
        const space = document.createElement("span");
        space.className = "hm-space";
        space.textContent = token.value.replace(/\s/gu, "\u00a0");
        layer.append(space);
        return;
      }

      const word = document.createElement("span");
      word.className = "hm-word";
      appendChars(word, token.value, charClass);
      layer.append(word);
    });

    return layer;
  };

  const prepareHeadline = (heading) => {
    const label = heading.textContent.replace(/\s+/gu, " ").trim();
    const tokens = tokenise(heading);
    const fillLayer = makeLayer(tokens, "hm-fill-layer", "hm-fill-char");
    const strokeLayer = makeLayer(tokens, "hm-stroke-layer", "hm-stroke-char");

    heading.replaceChildren(fillLayer, strokeLayer);
    heading.setAttribute("aria-label", label);
    heading.classList.add("hm-headline");

    const fillChars = heading.querySelectorAll(".hm-fill-char");
    const strokeChars = heading.querySelectorAll(".hm-stroke-char");
    const isHero = heading.classList.contains("hpherotext");

    gsap.set(fillChars, {
      autoAlpha: 0,
      filter: isHero ? "blur(18px)" : "blur(12px)",
      scale: isHero ? 0.94 : 0.97,
      y: isHero ? 36 : 18,
    });

    gsap.set(strokeChars, {
      autoAlpha: 0,
      clipPath: "inset(0 101% 0 0)",
      filter: "blur(2px)",
      y: isHero ? 18 : 10,
    });

    return heading;
  };

  const animateHeadline = (heading) => {
    if (heading.dataset.hmAnimated) {
      return;
    }

    heading.dataset.hmAnimated = "true";

    const fillChars = heading.querySelectorAll(".hm-fill-char");
    const strokeChars = heading.querySelectorAll(".hm-stroke-char");
    const isHero = heading.classList.contains("hpherotext");
    const strokeAmount = Math.min(0.5, Math.max(0.18, strokeChars.length * 0.018));
    const fillAmount = Math.min(isHero ? 0.9 : 0.58, Math.max(0.24, fillChars.length * 0.018));

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(strokeChars, {
        autoAlpha: 0.72,
        clipPath: "inset(0 0% 0 0)",
        duration: isHero ? 0.78 : 0.58,
        filter: "blur(0px)",
        stagger: { amount: strokeAmount, from: "start" },
        y: 0,
      }, 0)
      .to(fillChars, {
        autoAlpha: 1,
        duration: isHero ? 0.96 : 0.72,
        filter: "blur(0px)",
        scale: 1,
        stagger: { amount: fillAmount, from: isHero ? "center" : "start" },
        y: 0,
      }, 0.08)
      .to(strokeChars, {
        autoAlpha: 0,
        duration: 0.44,
        ease: "sine.out",
        stagger: { amount: Math.min(0.24, strokeAmount), from: "start" },
      }, isHero ? 0.58 : 0.42);
  };

  const preparedHeadings = headings.map(prepareHeadline);

  if (!("IntersectionObserver" in window)) {
    preparedHeadings.forEach(animateHeadline);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateHeadline(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.18,
  });

  preparedHeadings.forEach((heading) => observer.observe(heading));
})();
