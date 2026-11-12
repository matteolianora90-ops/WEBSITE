/* ===== Quizian website scripts ===== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Navbar: scroll style, mobile menu, active link ---------- */
  const nav = $("#nav");
  const burger = $("#burger");/* ===== Quizian website scripts ===== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Navbar: scroll style, mobile menu, active link ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const links = $("#navLinks");
  const navLinks = $$("a", links);

  window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 30));

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });

  navLinks.forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");

      navLinks.forEach(link => link.classList.remove("active"));
      a.classList.add("active");
    });
  });

  const targetSections = ["#home", "#about", "#products", "#how", "#contact", "#team"].map(sel => $(sel)).filter(Boolean);
  const spy = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute("id");
          navLinks.forEach(a => {
            if (a.getAttribute("href") === "#" + id) {
              a.classList.add("active");
            } else {
              a.classList.remove("active");
            }
          });
        }
      });
    },
    { rootMargin: "-30% 0px -50% 0px" }
  );
  targetSections.forEach(s => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          const t = e.target;
          setTimeout(() => (t.style.transitionDelay = ""), 1000);
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

  /* =====================================================
     QUICK PLAY DEMO
     ===================================================== */
  var totalQuestions = 4;
  var coinsPerCorrectAnswer = 10;
  var currentQuestion = 0;
  var coins = 0;
  var score = 0;
  var alreadyAnswered = [false, false, false, false];
  var questionTypes = ["Multiple Choice", "Fill in the Blanks", "Identification", "Scramble Words"];
  var correctAnswerText = ["B. Chlorophyll", "100", "Nucleus", "PLANT"];
  var explanations = [
    "Chlorophyll is the green pigment in leaves that captures sunlight so the plant can make its food.",
    "At sea level, water reaches its boiling point at 100 degrees Celsius.",
    "The nucleus holds the protons and neutrons, which make up almost all of an atom's mass.",
    "T-N-A-L-P rearranged spells PLANT."
  ];

  var questionNumberText = document.getElementById("questionNumber");
  var questionTypeText = document.getElementById("questionType");
  var progressFill = document.getElementById("progressFill");
  var coinsDisplay = document.getElementById("coinsDisplay");
  var resultsBox = document.getElementById("results");

  var questionBoxes = document.querySelectorAll(".question");
  var optionButtons = document.querySelectorAll(".demo__opt");
  var answerForms = document.querySelectorAll(".demo__form");
  var nextButtons = document.querySelectorAll(".demo__next");

  function showQuestion() {
    for (var i = 0; i < questionBoxes.length; i++) {
      questionBoxes[i].hidden = true;
    }
    questionBoxes[currentQuestion].hidden = false;
    questionNumberText.textContent = "Question " + (currentQuestion + 1) + " of " + totalQuestions;
    questionTypeText.textContent = questionTypes[currentQuestion];
    updateProgressBar();
  }

  function updateProgressBar() {
    var answeredCount = 0;
    for (var i = 0; i < alreadyAnswered.length; i++) {
      if (alreadyAnswered[i] === true) {
        answeredCount = answeredCount + 1;
      }
    }
    var percent = (answeredCount / totalQuestions) * 100;
    progressFill.style.width = percent + "%";
  }

  function finishQuestion(questionIndex, isCorrect) {
    var questionNumber = questionIndex + 1;
    var feedback = document.getElementById("feedback" + questionNumber);
    var nextButton = document.getElementById("next" + questionNumber);

    alreadyAnswered[questionIndex] = true;

    if (isCorrect === true) {
      score = score + 1;
      coins = coins + coinsPerCorrectAnswer;
      coinsDisplay.textContent = coins;

      coinsDisplay.classList.add("pop");
      setTimeout(function () {
        coinsDisplay.classList.remove("pop");
      }, 500);

      feedback.className = "demo__msg ok";
      feedback.textContent = "Correct! +" + coinsPerCorrectAnswer + " coins. " + explanations[questionIndex];
      confetti(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      feedback.className = "demo__msg no";
      feedback.textContent = "Not quite. The correct answer is " + correctAnswerText[questionIndex] + ". " + explanations[questionIndex];
    }

    feedback.hidden = false;
    nextButton.hidden = false;
    updateProgressBar();
  }

  function checkMultipleChoice(clickedButton) {
    if (alreadyAnswered[0] === true) return;

    var chosenLetter = clickedButton.getAttribute("data-letter");
    var isCorrect = false;

    if (chosenLetter === "B") {
      isCorrect = true;
      clickedButton.classList.add("correct");
    } else {
      clickedButton.classList.add("wrong");
    }

    for (var i = 0; i < optionButtons.length; i++) {
      optionButtons[i].disabled = true;
      if (optionButtons[i].getAttribute("data-letter") === "B") {
        optionButtons[i].classList.add("correct");
      }
    }

    finishQuestion(0, isCorrect);
  }

  function checkTypedAnswer(questionIndex) {
    var questionNumber = questionIndex + 1;
    var input = document.getElementById("answer" + questionNumber);
    var submitButton = document.getElementById("submit" + questionNumber);
    var feedback = document.getElementById("feedback" + questionNumber);

    if (alreadyAnswered[questionIndex] === true) return;

    var userAnswer = input.value.trim().toLowerCase();

    if (userAnswer === "") {
      feedback.className = "demo__msg warn";
      feedback.textContent = "Please type an answer first.";
      feedback.hidden = false;
      return;
    }

    var isCorrect = false;
    if (questionIndex === 1) {
      if (userAnswer === "100" || userAnswer === "one hundred") isCorrect = true;
    } else if (questionIndex === 2) {
      if (userAnswer === "nucleus" || userAnswer === "the nucleus") isCorrect = true;
    } else if (questionIndex === 3) {
      if (userAnswer === "plant") isCorrect = true;
    }

    if (isCorrect === true) {
      input.classList.add("correct");
    } else {
      input.classList.add("wrong");
    }
    input.disabled = true;
    submitButton.disabled = true;

    finishQuestion(questionIndex, isCorrect);
  }

  function goToNextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
      currentQuestion = currentQuestion + 1;
      showQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    for (var i = 0; i < questionBoxes.length; i++) {
      questionBoxes[i].hidden = true;
    }
    resultsBox.hidden = false;

    questionNumberText.textContent = "Completed";
    questionTypeText.textContent = "Results";

    document.getElementById("finalScore").textContent = score + " / " + totalQuestions;
    document.getElementById("finalCoins").textContent = coins;

    var message = "";
    if (score === totalQuestions) {
      message = "A perfect score. You are ready for a group challenge!";
    } else if (score >= 2) {
      message = "Nice work! Try again to beat your score.";
    } else {
      message = "Good try! Give it another go to earn more coins.";
    }
    document.getElementById("resultMessage").textContent = message;

    updateProgressBar();
    confetti(window.innerWidth / 2, window.innerHeight / 2);
  }

  function restartDemo() {
    currentQuestion = 0;
    coins = 0;
    score = 0;
    coinsDisplay.textContent = coins;
    resultsBox.hidden = true;

    for (var i = 0; i < totalQuestions; i++) {
      alreadyAnswered[i] = false;
      document.getElementById("feedback" + (i + 1)).hidden = true;
      document.getElementById("next" + (i + 1)).hidden = true;
    }

    for (var j = 0; j < optionButtons.length; j++) {
      optionButtons[j].disabled = false;
      optionButtons[j].classList.remove("correct");
      optionButtons[j].classList.remove("wrong");
    }

    for (var k = 2; k <= 4; k++) {
      var input = document.getElementById("answer" + k);
      input.value = "";
      input.disabled = false;
      input.classList.remove("correct");
      input.classList.remove("wrong");
      document.getElementById("submit" + k).disabled = false;
    }

    showQuestion();
  }

  for (var a = 0; a < optionButtons.length; a++) {
    optionButtons[a].addEventListener("click", function () {
      checkMultipleChoice(this);
    });
  }

  for (var b = 0; b < answerForms.length; b++) {
    answerForms[b].addEventListener("submit", function (event) {
      event.preventDefault();
      var questionNumber = Number(this.getAttribute("data-question"));
      checkTypedAnswer(questionNumber - 1);
    });
  }

  for (var c = 0; c < nextButtons.length; c++) {
    nextButtons[c].addEventListener("click", goToNextQuestion);
  }

  document.getElementById("restartButton").addEventListener("click", restartDemo);
  showQuestion();

  /* ---------- Fully Functional Contact Form Handler ---------- */
  const form = $("#contactForm");
  const ok = $("#formOk");
  const err = $("#formErr");
  const submitBtn = $("#submitBtn");

  const rules = {
    name: v => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address."),
    message_subject: v => (v.trim().length >= 3 ? "" : "Please enter a subject."),
    message: v => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
  };

  function validateField(name) {
    const input = form.elements[name];
    if (!input) return true;
    const msg = rules[name](input.value);
    input.closest(".field").classList.toggle("invalid", !!msg);
    const errEl = $(`.error[data-for="${name}"]`, form);
    if (errEl) errEl.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(n => {
    if (form.elements[n]) {
      form.elements[n].addEventListener("input", () => validateField(n));
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    ok.hidden = true;
    err.hidden = true;

    const valid = Object.keys(rules).map(validateField).every(Boolean);
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending message...";

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 200) {
        ok.hidden = false;
        form.reset();
        confetti(window.innerWidth / 2, window.innerHeight * 0.6);
        setTimeout(() => (ok.hidden = true), 6000);
      } else {
        err.textContent = result.message || "❌ Oops! Something went wrong. Please try again.";
        err.hidden = false;
      }
    } catch (error) {
      err.textContent = "❌ Network error. Please check your connection and try again.";
      err.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });

  /* ================= VIBE LAYER ================= */
  const bar = $("#progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  });

  const glow = $("#cursorGlow");
  window.addEventListener("pointermove", e => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

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

  $$(".cta__btns .btn, .hero__cta .btn--primary").forEach(b =>
    b.addEventListener("click", e => confetti(e.clientX, e.clientY))
  );

  $("#year").textContent = new Date().getFullYear();
})();
  const links = $("#navLinks");
  const navLinks = $$("a", links);

  window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 30));

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });

  navLinks.forEach(a => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");

      navLinks.forEach(link => link.classList.remove("active"));
      a.classList.add("active");
    });
  });

  const targetSections = ["#home", "#about", "#products", "#how", "#contact"].map(sel => $(sel)).filter(Boolean);
  const spy = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute("id");
          navLinks.forEach(a => {
            if (a.getAttribute("href") === "#" + id) {
              a.classList.add("active");
            } else {
              a.classList.remove("active");
            }
          });
        }
      });
    },
    { rootMargin: "-30% 0px -50% 0px" }
  );
  targetSections.forEach(s => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          const t = e.target;
          setTimeout(() => (t.style.transitionDelay = ""), 1000);
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

  /* =====================================================
     QUICK PLAY DEMO
     ===================================================== */
  var totalQuestions = 4;
  var coinsPerCorrectAnswer = 10;
  var currentQuestion = 0;
  var coins = 0;
  var score = 0;
  var alreadyAnswered = [false, false, false, false];
  var questionTypes = ["Multiple Choice", "Fill in the Blanks", "Identification", "Scramble Words"];
  var correctAnswerText = ["B. Chlorophyll", "100", "Nucleus", "PLANT"];
  var explanations = [
    "Chlorophyll is the green pigment in leaves that captures sunlight so the plant can make its food.",
    "At sea level, water reaches its boiling point at 100 degrees Celsius.",
    "The nucleus holds the protons and neutrons, which make up almost all of an atom's mass.",
    "T-N-A-L-P rearranged spells PLANT."
  ];

  var questionNumberText = document.getElementById("questionNumber");
  var questionTypeText = document.getElementById("questionType");
  var progressFill = document.getElementById("progressFill");
  var coinsDisplay = document.getElementById("coinsDisplay");
  var resultsBox = document.getElementById("results");

  var questionBoxes = document.querySelectorAll(".question");
  var optionButtons = document.querySelectorAll(".demo__opt");
  var answerForms = document.querySelectorAll(".demo__form");
  var nextButtons = document.querySelectorAll(".demo__next");

  function showQuestion() {
    for (var i = 0; i < questionBoxes.length; i++) {
      questionBoxes[i].hidden = true;
    }
    questionBoxes[currentQuestion].hidden = false;
    questionNumberText.textContent = "Question " + (currentQuestion + 1) + " of " + totalQuestions;
    questionTypeText.textContent = questionTypes[currentQuestion];
    updateProgressBar();
  }

  function updateProgressBar() {
    var answeredCount = 0;
    for (var i = 0; i < alreadyAnswered.length; i++) {
      if (alreadyAnswered[i] === true) {
        answeredCount = answeredCount + 1;
      }
    }
    var percent = (answeredCount / totalQuestions) * 100;
    progressFill.style.width = percent + "%";
  }

  function finishQuestion(questionIndex, isCorrect) {
    var questionNumber = questionIndex + 1;
    var feedback = document.getElementById("feedback" + questionNumber);
    var nextButton = document.getElementById("next" + questionNumber);

    alreadyAnswered[questionIndex] = true;

    if (isCorrect === true) {
      score = score + 1;
      coins = coins + coinsPerCorrectAnswer;
      coinsDisplay.textContent = coins;

      coinsDisplay.classList.add("pop");
      setTimeout(function () {
        coinsDisplay.classList.remove("pop");
      }, 500);

      feedback.className = "demo__msg ok";
      feedback.textContent = "Correct! +" + coinsPerCorrectAnswer + " coins. " + explanations[questionIndex];
      confetti(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      feedback.className = "demo__msg no";
      feedback.textContent = "Not quite. The correct answer is " + correctAnswerText[questionIndex] + ". " + explanations[questionIndex];
    }

    feedback.hidden = false;
    nextButton.hidden = false;
    updateProgressBar();
  }

  function checkMultipleChoice(clickedButton) {
    if (alreadyAnswered[0] === true) return;

    var chosenLetter = clickedButton.getAttribute("data-letter");
    var isCorrect = false;

    if (chosenLetter === "B") {
      isCorrect = true;
      clickedButton.classList.add("correct");
    } else {
      clickedButton.classList.add("wrong");
    }

    for (var i = 0; i < optionButtons.length; i++) {
      optionButtons[i].disabled = true;
      if (optionButtons[i].getAttribute("data-letter") === "B") {
        optionButtons[i].classList.add("correct");
      }
    }

    finishQuestion(0, isCorrect);
  }

  function checkTypedAnswer(questionIndex) {
    var questionNumber = questionIndex + 1;
    var input = document.getElementById("answer" + questionNumber);
    var submitButton = document.getElementById("submit" + questionNumber);
    var feedback = document.getElementById("feedback" + questionNumber);

    if (alreadyAnswered[questionIndex] === true) return;

    var userAnswer = input.value.trim().toLowerCase();

    if (userAnswer === "") {
      feedback.className = "demo__msg warn";
      feedback.textContent = "Please type an answer first.";
      feedback.hidden = false;
      return;
    }

    var isCorrect = false;
    if (questionIndex === 1) {
      if (userAnswer === "100" || userAnswer === "one hundred") isCorrect = true;
    } else if (questionIndex === 2) {
      if (userAnswer === "nucleus" || userAnswer === "the nucleus") isCorrect = true;
    } else if (questionIndex === 3) {
      if (userAnswer === "plant") isCorrect = true;
    }

    if (isCorrect === true) {
      input.classList.add("correct");
    } else {
      input.classList.add("wrong");
    }
    input.disabled = true;
    submitButton.disabled = true;

    finishQuestion(questionIndex, isCorrect);
  }

  function goToNextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
      currentQuestion = currentQuestion + 1;
      showQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    for (var i = 0; i < questionBoxes.length; i++) {
      questionBoxes[i].hidden = true;
    }
    resultsBox.hidden = false;

    questionNumberText.textContent = "Completed";
    questionTypeText.textContent = "Results";

    document.getElementById("finalScore").textContent = score + " / " + totalQuestions;
    document.getElementById("finalCoins").textContent = coins;

    var message = "";
    if (score === totalQuestions) {
      message = "A perfect score. You are ready for a group challenge!";
    } else if (score >= 2) {
      message = "Nice work! Try again to beat your score.";
    } else {
      message = "Good try! Give it another go to earn more coins.";
    }
    document.getElementById("resultMessage").textContent = message;

    updateProgressBar();
    confetti(window.innerWidth / 2, window.innerHeight / 2);
  }

  function restartDemo() {
    currentQuestion = 0;
    coins = 0;
    score = 0;
    coinsDisplay.textContent = coins;
    resultsBox.hidden = true;

    for (var i = 0; i < totalQuestions; i++) {
      alreadyAnswered[i] = false;
      document.getElementById("feedback" + (i + 1)).hidden = true;
      document.getElementById("next" + (i + 1)).hidden = true;
    }

    for (var j = 0; j < optionButtons.length; j++) {
      optionButtons[j].disabled = false;
      optionButtons[j].classList.remove("correct");
      optionButtons[j].classList.remove("wrong");
    }

    for (var k = 2; k <= 4; k++) {
      var input = document.getElementById("answer" + k);
      input.value = "";
      input.disabled = false;
      input.classList.remove("correct");
      input.classList.remove("wrong");
      document.getElementById("submit" + k).disabled = false;
    }

    showQuestion();
  }

  for (var a = 0; a < optionButtons.length; a++) {
    optionButtons[a].addEventListener("click", function () {
      checkMultipleChoice(this);
    });
  }

  for (var b = 0; b < answerForms.length; b++) {
    answerForms[b].addEventListener("submit", function (event) {
      event.preventDefault();
      var questionNumber = Number(this.getAttribute("data-question"));
      checkTypedAnswer(questionNumber - 1);
    });
  }

  for (var c = 0; c < nextButtons.length; c++) {
    nextButtons[c].addEventListener("click", goToNextQuestion);
  }

  document.getElementById("restartButton").addEventListener("click", restartDemo);
  showQuestion();

  /* ---------- Fully Functional Contact Form Handler ---------- */
  const form = $("#contactForm");
  const ok = $("#formOk");
  const err = $("#formErr");
  const submitBtn = $("#submitBtn");

  const rules = {
    name: v => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address."),
    message_subject: v => (v.trim().length >= 3 ? "" : "Please enter a subject."),
    message: v => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
  };

  function validateField(name) {
    const input = form.elements[name];
    if (!input) return true;
    const msg = rules[name](input.value);
    input.closest(".field").classList.toggle("invalid", !!msg);
    const errEl = $(`.error[data-for="${name}"]`, form);
    if (errEl) errEl.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(n => {
    if (form.elements[n]) {
      form.elements[n].addEventListener("input", () => validateField(n));
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    // Hide notifications initially
    ok.hidden = true;
    err.hidden = true;

    // Validate all fields
    const valid = Object.keys(rules).map(validateField).every(Boolean);
    if (!valid) return;

    // Prevent duplicate submissions by disabling button & changing text
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending message...";

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 200) {
        ok.hidden = false;
        form.reset();
        confetti(window.innerWidth / 2, window.innerHeight * 0.6);
        setTimeout(() => (ok.hidden = true), 6000);
      } else {
        err.textContent = result.message || "❌ Oops! Something went wrong. Please try again.";
        err.hidden = false;
      }
    } catch (error) {
      err.textContent = "❌ Network error. Please check your connection and try again.";
      err.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });

  /* ================= VIBE LAYER ================= */
  const bar = $("#progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  });

  const glow = $("#cursorGlow");
  window.addEventListener("pointermove", e => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

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

  $$(".cta__btns .btn, .hero__cta .btn--primary").forEach(b =>
    b.addEventListener("click", e => confetti(e.clientX, e.clientY))
  );

  $("#year").textContent = new Date().getFullYear();
})();
