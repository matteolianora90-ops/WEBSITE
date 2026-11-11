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

  /* =====================================================
     QUICK PLAY DEMO
     How it works:
     1. The 4 questions are already written in index.html.
     2. showQuestion() shows one question and hides the others.
     3. When the player answers, we check it with if / else,
        give 10 coins if it is correct, and show feedback.
     4. The Next button moves to the next question.
     5. After question 4, showResults() shows the final score.
     ===================================================== */

  // ----- Settings and variables -----
  var totalQuestions = 4;
  var coinsPerCorrectAnswer = 10;

  var currentQuestion = 0;   // 0 = first question, 1 = second, 2 = third, 3 = fourth
  var coins = 0;             // total coins earned
  var score = 0;             // number of correct answers

  // One true/false for each question. It stops a question from being answered twice.
  var alreadyAnswered = [false, false, false, false];

  // The name of each question type (shown above the progress bar)
  var questionTypes = ["Multiple Choice", "Fill in the Blanks", "Identification", "Scramble Words"];

  // The correct answer for each question (shown when the player is wrong)
  var correctAnswerText = ["B. Chlorophyll", "100", "Nucleus", "PLANT"];

  // A short explanation for each question
  var explanations = [
    "Chlorophyll is the green pigment in leaves that captures sunlight so the plant can make its food.",
    "At sea level, water reaches its boiling point at 100 degrees Celsius.",
    "The nucleus holds the protons and neutrons, which make up almost all of an atom's mass.",
    "T-N-A-L-P rearranged spells PLANT."
  ];

  // ----- Find the HTML elements we need -----
  var questionNumberText = document.getElementById("questionNumber");
  var questionTypeText = document.getElementById("questionType");
  var progressFill = document.getElementById("progressFill");
  var coinsDisplay = document.getElementById("coinsDisplay");
  var resultsBox = document.getElementById("results");

  var questionBoxes = document.querySelectorAll(".question");      // the 4 question boxes
  var optionButtons = document.querySelectorAll(".demo__opt");     // the A, B, C, D buttons
  var answerForms = document.querySelectorAll(".demo__form");      // the forms for questions 2, 3, 4
  var nextButtons = document.querySelectorAll(".demo__next");      // the 4 Next buttons

  // ----- Show only the current question -----
  function showQuestion() {
    // Hide all four question boxes
    for (var i = 0; i < questionBoxes.length; i++) {
      questionBoxes[i].hidden = true;
    }

    // Show only the current one
    questionBoxes[currentQuestion].hidden = false;

    // Update the text above the progress bar
    questionNumberText.textContent = "Question " + (currentQuestion + 1) + " of " + totalQuestions;
    questionTypeText.textContent = questionTypes[currentQuestion];

    updateProgressBar();
  }

  // ----- Fill the progress bar based on how many questions were answered -----
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

  // ----- Runs after EVERY answer (correct or wrong) -----
  function finishQuestion(questionIndex, isCorrect) {
    var questionNumber = questionIndex + 1;  // arrays start at 0, but the HTML ids start at 1
    var feedback = document.getElementById("feedback" + questionNumber);
    var nextButton = document.getElementById("next" + questionNumber);

    alreadyAnswered[questionIndex] = true;

    if (isCorrect === true) {
      // Correct: add the score and coins
      score = score + 1;
      coins = coins + coinsPerCorrectAnswer;
      coinsDisplay.textContent = coins;

      // Make the coin number "pop" for half a second
      coinsDisplay.classList.add("pop");
      setTimeout(function () {
        coinsDisplay.classList.remove("pop");
      }, 500);

      // Green success message
      feedback.className = "demo__msg ok";
      feedback.textContent = "Correct! +" + coinsPerCorrectAnswer + " coins. " + explanations[questionIndex];

      // Small confetti celebration (the confetti() function is further down in this file)
      confetti(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      // Wrong: show the correct answer and the explanation. No coins.
      feedback.className = "demo__msg no";
      feedback.textContent = "Not quite. The correct answer is " + correctAnswerText[questionIndex] + ". " + explanations[questionIndex];
    }

    feedback.hidden = false;      // show the feedback message
    nextButton.hidden = false;    // show the Next button
    updateProgressBar();
  }

  // ----- Question 1: Multiple Choice -----
  function checkMultipleChoice(clickedButton) {
    // Do nothing if this question was already answered
    if (alreadyAnswered[0] === true) {
      return;
    }

    var chosenLetter = clickedButton.getAttribute("data-letter");
    var isCorrect = false;

    // The correct answer is B
    if (chosenLetter === "B") {
      isCorrect = true;
      clickedButton.classList.add("correct");
    } else {
      clickedButton.classList.add("wrong");
    }

    // Lock all four buttons and highlight the correct one in green
    for (var i = 0; i < optionButtons.length; i++) {
      optionButtons[i].disabled = true;
      if (optionButtons[i].getAttribute("data-letter") === "B") {
        optionButtons[i].classList.add("correct");
      }
    }

    finishQuestion(0, isCorrect);
  }

  // ----- Questions 2, 3 and 4: typed answers -----
  function checkTypedAnswer(questionIndex) {
    var questionNumber = questionIndex + 1;
    var input = document.getElementById("answer" + questionNumber);
    var submitButton = document.getElementById("submit" + questionNumber);
    var feedback = document.getElementById("feedback" + questionNumber);

    // Do nothing if this question was already answered
    if (alreadyAnswered[questionIndex] === true) {
      return;
    }

    // Get what the player typed: remove extra spaces and make it lowercase
    var userAnswer = input.value.trim().toLowerCase();

    // If the box is empty, ask the player to type something
    if (userAnswer === "") {
      feedback.className = "demo__msg warn";
      feedback.textContent = "Please type an answer first.";
      feedback.hidden = false;
      return;
    }

    // Check the answer
    var isCorrect = false;

    if (questionIndex === 1) {
      // Question 2 (Fill in the Blanks): answer is 100
      if (userAnswer === "100" || userAnswer === "one hundred") {
        isCorrect = true;
      }
    } else if (questionIndex === 2) {
      // Question 3 (Identification): answer is nucleus
      if (userAnswer === "nucleus" || userAnswer === "the nucleus") {
        isCorrect = true;
      }
    } else if (questionIndex === 3) {
      // Question 4 (Scramble Words): answer is plant
      if (userAnswer === "plant") {
        isCorrect = true;
      }
    }

    // Color the input box and lock it
    if (isCorrect === true) {
      input.classList.add("correct");
    } else {
      input.classList.add("wrong");
    }
    input.disabled = true;
    submitButton.disabled = true;

    finishQuestion(questionIndex, isCorrect);
  }

  // ----- Go to the next question (or the results after question 4) -----
  function goToNextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
      currentQuestion = currentQuestion + 1;
      showQuestion();
    } else {
      showResults();
    }
  }

  // ----- Completion screen -----
  function showResults() {
    // Hide all questions and show the results box
    for (var i = 0; i < questionBoxes.length; i++) {
      questionBoxes[i].hidden = true;
    }
    resultsBox.hidden = false;

    questionNumberText.textContent = "Completed";
    questionTypeText.textContent = "Results";

    document.getElementById("finalScore").textContent = score + " / " + totalQuestions;
    document.getElementById("finalCoins").textContent = coins;

    // A different message depending on the score
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

  // ----- Restart: put everything back to the starting values -----
  function restartDemo() {
    currentQuestion = 0;
    coins = 0;
    score = 0;
    coinsDisplay.textContent = coins;
    resultsBox.hidden = true;

    // Reset the "answered" list and hide all feedback messages and Next buttons
    for (var i = 0; i < totalQuestions; i++) {
      alreadyAnswered[i] = false;
      document.getElementById("feedback" + (i + 1)).hidden = true;
      document.getElementById("next" + (i + 1)).hidden = true;
    }

    // Reset the A, B, C, D buttons
    for (var j = 0; j < optionButtons.length; j++) {
      optionButtons[j].disabled = false;
      optionButtons[j].classList.remove("correct");
      optionButtons[j].classList.remove("wrong");
    }

    // Reset the typed answer boxes and Submit buttons (questions 2, 3, 4)
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

  // ----- Connect the buttons to the functions above (event listeners) -----

  // A, B, C, D buttons (question 1)
  for (var a = 0; a < optionButtons.length; a++) {
    optionButtons[a].addEventListener("click", function () {
      checkMultipleChoice(this);   // "this" is the button that was clicked
    });
  }

  // Submit Answer (questions 2, 3, 4)
  for (var b = 0; b < answerForms.length; b++) {
    answerForms[b].addEventListener("submit", function (event) {
      event.preventDefault();      // stop the page from reloading
      var questionNumber = Number(this.getAttribute("data-question"));
      checkTypedAnswer(questionNumber - 1);
    });
  }

  // Next question buttons
  for (var c = 0; c < nextButtons.length; c++) {
    nextButtons[c].addEventListener("click", goToNextQuestion);
  }

  // Restart button
  document.getElementById("restartButton").addEventListener("click", restartDemo);

  // Start the demo on question 1
  showQuestion();

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
