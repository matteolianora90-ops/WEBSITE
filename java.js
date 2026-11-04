/* ===== Quizian website scripts ===== */
(function () {
  "use strict";

  /* tells the CSS that JavaScript is running, so scroll-reveal text is allowed to start hidden */
  document.documentElement.classList.add("js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Navbar: scroll style, mobile menu, active link ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const links = $("#navLinks");

  window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 30));

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(a =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  const sections = $$("main section[id]");
  const spy = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          $$("a", links).forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach(s => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          const t = e.target;
          setTimeout(() => (t.style.transitionDelay = ""), 1000); /* stop the stagger delay slowing hover/tilt later */
          revealObs.unobserve(e.target);
        }
      }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + "s";
    revealObs.observe(el);
  });

  /* ---------- Count-up stats ---------- */
  const countObs = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = +el.dataset.count;
        let n = 0;
        const step = Math.max(1, Math.ceil(end / 40));
        const t = setInterval(() => {
          n = Math.min(end, n + step);
          el.textContent = n + (el.dataset.suffix || "");
          if (n >= end) clearInterval(t);
        }, 30);
        countObs.unobserve(el);
      }),
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach(el => countObs.observe(el));

  /* ---------- Quick Play demo ---------- */
  const questions = [
    { q: "Which part of a plant absorbs sunlight for photosynthesis?", o: ["Roots", "Chlorophyll", "Stem", "Petals"], a: 1 },
    { q: "What does HTML stand for?", o: ["HyperText Markup Language", "High Tech Modern Language", "HyperTransfer Mail Link", "Home Tool Markup Language"], a: 0 },
    { q: "Which planet is known as the Red Planet?", o: ["Venus", "Jupiter", "Mars", "Mercury"], a: 2 },
    { q: "Unscramble: T-O-A-M", o: ["MOAT", "ATOM", "TOMA", "MATO"], a: 1 }
  ];
  let qi = 0, coins = 0;
  const elQ = $("#demoQ"), elO = $("#demoOpts"), elM = $("#demoMsg"), elN = $("#demoNext"), elC = $("#demoCoins");

  function loadQ() {
    const item = questions[qi];
    elQ.textContent = item.q;
    elO.innerHTML = "";
    elM.textContent = "";
    elN.hidden = true;
    item.o.forEach((text, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      b.addEventListener("click", () => answer(i));
      elO.appendChild(b);
    });
  }

  function answer(i) {
    const item = questions[qi];
    const btns = $$("button", elO);
    btns.forEach(b => (b.disabled = true));
    btns[item.a].classList.add("correct");
    if (i === item.a) {
      coins += 10;
      elC.textContent = coins;
      elM.textContent = "✅ Correct! +10 coins";
    } else {
      btns[i].classList.add("wrong");
      elM.textContent = "❌ Not quite. Keep going!";
    }
    elN.textContent = qi === questions.length - 1 ? "Play again ↻" : "Next question →";
    elN.hidden = false;
  }

  elN.addEventListener("click", () => {
    qi = (qi + 1) % questions.length;
    if (qi === 0) { coins = 0; elC.textContent = 0; }
    loadQ();
  });
  loadQ();

  /* ---------- Contact form (front-end only) ---------- */
  const form = $("#contactForm");
  const ok = $("#formOk");

  const rules = {
    name: v => (v.trim().length >= 2 ? "" : "Please enter your name."),
    email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email."),
    type: v => (v ? "" : "Please choose one."),
    message: v => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
  };

  function validateField(name) {
    const input = form.elements[name];
    const msg = rules[name](input.value);
    input.closest(".field").classList.toggle("invalid", !!msg);
    $(`.error[data-for="${name}"]`, form).textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(n => form.elements[n].addEventListener("input", () => validateField(n)));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const valid = Object.keys(rules).map(validateField).every(Boolean);
    if (!valid) return;
    ok.hidden = false;
    form.reset();
    setTimeout(() => (ok.hidden = true), 6000);
  });

  /* ================= VIBE LAYER ================= */

  /* scroll progress bar */
  const bar = $("#progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  });

  /* cursor glow */
  const glow = $("#cursorGlow");
  window.addEventListener("pointermove", e => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  /* 3D tilt on cards */
  $$(".card, .feature, .member, .step").forEach(el => {
    el.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", x * 10 + "deg");
      el.style.setProperty("--rx", -y * 10 + "deg");
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  /* confetti */
  const cv = $("#confetti");
  const ctx = cv.getContext("2d");
  let bits = [], raf = null;
  const colors = ["#ff8133", "#ffd9bf", "#34c759", "#ffffff", "#ffb27a"];

  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  resize();
  addEventListener("resize", resize);

  function confetti(x = innerWidth / 2, y = innerHeight / 2) {
    for (let i = 0; i < 90; i++) {
      bits.push({
        x, y,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -13 - 3,
        s: Math.random() * 8 + 4,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        c: colors[(Math.random() * colors.length) | 0],
        life: 110
      });
    }
    if (!raf) loop();
  }

  function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    bits.forEach(b => {
      b.vy += 0.38; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life--;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.globalAlpha = Math.max(0, b.life / 110);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
      ctx.restore();
    });
    bits = bits.filter(b => b.life > 0);
    raf = bits.length ? requestAnimationFrame(loop) : null;
    if (!raf) ctx.clearRect(0, 0, cv.width, cv.height);
  }

  /* fire confetti + coin pop on correct demo answers */
  $("#demoOpts").addEventListener("click", e => {
    if ($("#demoMsg").textContent.includes("Correct")) {
      const r = e.target.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top);
      const c = $("#demoCoins");
      c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop");
    }
  });

  /* confetti burst on the CTA buttons too */
  $$(".cta__btns .btn, .hero__cta .btn--primary").forEach(b =>
    b.addEventListener("click", e => confetti(e.clientX, e.clientY))
  );

  /* confetti when the form is submitted successfully */
  form.addEventListener("submit", () => {
    if (!ok.hidden) confetti(innerWidth / 2, innerHeight * 0.6);
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();