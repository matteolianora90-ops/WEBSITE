/* ===== Quizian Website Scripts ===== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- 1. Navbar: Scroll State, Mobile Drawer & Scroll-Spy ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const links = $("#navLinks");
  const navLinks = links ? $$("a", links) : [];

  function setMenuOpen(isOpen) {
    if (!links || !burger) return;
    links.classList.toggle("open", isOpen);
    burger.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  }

  if (burger && links) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenuOpen(!links.classList.contains("open"));
    });

    document.addEventListener("click", (e) => {
      if (links.classList.contains("open") && !nav.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        setMenuOpen(false);
        burger.focus();
      }
    });
  }

  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      setMenuOpen(false);
      navLinks.forEach((link) => link.classList.remove("active"));
      a.classList.add("active");
    });
  });

  const spySectionIds = navLinks
    .map((a) => a.getAttribute("href"))
    .filter((href) => href && href.startsWith("#"));
  const targetSections = spySectionIds.map((sel) => $(sel)).filter(Boolean);

  function updateActiveNavOnScroll() {
    if (!targetSections.length) return;
    const scrollPos = window.scrollY + 140;
    let currentId = targetSections[0].id;

    for (const sec of targetSections) {
      if (scrollPos >= sec.offsetTop) {
        currentId = sec.id;
      }
    }

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) {
      currentId = targetSections[targetSections.length - 1].id;
    }

    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
    });
  }

  /* ---------- 2. Scroll Reveal & Count-Up Stats ---------- */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          const t = e.target;
          setTimeout(() => (t.style.transitionDelay = ""), 900);
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + "s";
    revealObs.observe(el);
  });

  const countObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = Number(el.dataset.count) || 0;
        const suffix = el.dataset.suffix || "";
        let n = 0;
        const step = Math.max(1, Math.ceil(end / 35));
        const timer = setInterval(() => {
          n = Math.min(end, n + step);
          el.textContent = n + suffix;
          if (n >= end) clearInterval(timer);
        }, 30);
        countObs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------- 3. 3D Rotating Screenshot Carousel ---------- */
  const track = $("#carouselTrack");
  const items = track ? $$(".carousel-3d-item", track) : [];
  const dots = $$(".carousel-dot");
  const prevBtn = $("#carouselPrev");
  const nextBtn = $("#carouselNext");
  const scene = $("#carouselScene");

  if (track && scene && items.length > 0) {
    let currentAngle = 0;
    let targetAngle = 0;
    let isDragging = false;
    let dragMoved = false;
    let startX = 0;
    let lastX = 0;
    let autoRotateTimer = null;
    let isHovered = false;
    let isSceneVisible = true;
    const totalItems = items.length;
    const angleStep = 360 / totalItems;

    function getRadius() {
      const cardWidth = items[0].offsetWidth || (window.innerWidth < 640 ? 310 : 540);
      const apothem = cardWidth / (2 * Math.tan(Math.PI / totalItems));
      return Math.round(apothem + (window.innerWidth < 640 ? 28 : 55));
    }

    function updateCarouselLayout() {
      const radius = getRadius();
      items.forEach((item, index) => {
        const itemAngle = index * angleStep;
        item.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
      });
    }

    function getActiveIndex(angle) {
      let normalized = -angle % 360;
      if (normalized < 0) normalized += 360;
      return Math.round(normalized / angleStep) % totalItems;
    }

    function updateTrackTransform() {
      track.style.transform = `translateZ(${-getRadius()}px) rotateY(${currentAngle}deg)`;
      const activeIdx = getActiveIndex(targetAngle);

      items.forEach((item, idx) => {
        item.classList.toggle("is-active", idx === activeIdx);
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIdx);
        dot.setAttribute("aria-selected", String(idx === activeIdx));
      });
    }

    function animateCarousel() {
      currentAngle += (targetAngle - currentAngle) * 0.1;
      updateTrackTransform();
      requestAnimationFrame(animateCarousel);
    }

    function goToSlide(index) {
      const currentIdx = getActiveIndex(targetAngle);
      let diff = index - currentIdx;
      if (diff > totalItems / 2) diff -= totalItems;
      if (diff < -totalItems / 2) diff += totalItems;
      targetAngle -= diff * angleStep;
      startAutoRotate();
    }

    function startAutoRotate() {
      if (autoRotateTimer) clearInterval(autoRotateTimer);
      autoRotateTimer = setInterval(() => {
        if (!isHovered && !isDragging && isSceneVisible && !document.hidden) {
          targetAngle -= angleStep;
        }
      }, 4200);
    }

    const carouselVisObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isSceneVisible = e.isIntersecting;
        });
      },
      { threshold: 0.15 }
    );
    carouselVisObs.observe(scene);

    // Pointer capture is only taken once the user actually drags.
    // Capturing on pointerdown would redirect the "click" to the scene,
    // so the slide cards could never be clicked.
    let activePointerId = null;

    scene.addEventListener("pointerdown", (e) => {
      isDragging = true;
      dragMoved = false;
      activePointerId = e.pointerId;
      startX = e.clientX;
      lastX = startX;
    });

    scene.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastX;
      if (!dragMoved && Math.abs(e.clientX - startX) > 6) {
        dragMoved = true;
        try {
          scene.setPointerCapture(activePointerId);
        } catch (error) {
          /* pointer capture is optional */
        }
      }
      lastX = e.clientX;
      targetAngle += deltaX * 0.35;
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      targetAngle = -Math.round(-targetAngle / angleStep) * angleStep;
      startAutoRotate();
    }

    // Listen on window so the drag always ends, even if the pointer is released outside the scene
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    items.forEach((item, idx) => {
      item.addEventListener("click", () => {
        if (!dragMoved) {
          goToSlide(idx);
        }
      });
    });

    scene.addEventListener("mouseenter", () => {
      isHovered = true;
    });

    scene.addEventListener("mouseleave", () => {
      isHovered = false;
    });

    scene.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        targetAngle += angleStep;
        startAutoRotate();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        targetAngle -= angleStep;
        startAutoRotate();
      }
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        targetAngle += angleStep;
        startAutoRotate();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        targetAngle -= angleStep;
        startAutoRotate();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = Number(dot.dataset.index);
        goToSlide(idx);
      });
    });

    window.addEventListener("resize", updateCarouselLayout);

    updateCarouselLayout();
    requestAnimationFrame(animateCarousel);
    startAutoRotate();
  }

  /* ---------- 4. Promotional Video Player (Native Controls + Viewport & Tab Visibility) ---------- */
  const video = $("#promoVideo");
  const bigPlayBtn = $("#bigPlayBtn");
  const videoContainer = $("#videoContainer");
  const videoError = $("#videoError");

  if (video) {
    let userPaused = false;
    let isVideoVisible = false;
    let isSystemPausing = false;
    let hasStartedOnce = false;

    // Start muted to satisfy browser autoplay rules
    video.muted = true;
    video.defaultMuted = true;

    function isFullscreen() {
      return Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        video.webkitDisplayingFullscreen
      );
    }

    // The big play button only shows before the first play and after the video ends,
    // so it never covers the native controls while the video is in use.
    function syncPlayState() {
      if (bigPlayBtn) {
        bigPlayBtn.classList.toggle("is-hidden", hasStartedOnce && !video.ended);
      }
    }

    function showVideoError() {
      if (videoError) videoError.hidden = false;
      if (bigPlayBtn) bigPlayBtn.hidden = true;
    }

    function pauseForVisibilityChange() {
      if (!video.paused) {
        isSystemPausing = true;
        video.pause();
      }
    }

    function playWhenVisible() {
      if (userPaused || document.hidden || !isVideoVisible || video.ended) return;
      if (!video.paused) return;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked: the big play button stays so the visitor can start it manually
          syncPlayState();
        });
      }
    }

    // Visitor clicked the big play button (a user gesture, so sound is allowed)
    function playFromButton() {
      userPaused = false;
      video.muted = false;
      video.play().catch(() => {
        // Some browsers refuse unmuted playback: try again muted
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    // Play when at least 45% of the video is on screen, pause when it leaves
    const observeTarget = videoContainer || video;
    const videoVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVideoVisible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
          // Fullscreen (especially on iOS) can hide the page behind it: never pause for that
          if (isFullscreen()) return;
          if (isVideoVisible) {
            playWhenVisible();
          } else {
            pauseForVisibilityChange();
          }
        });
      },
      { threshold: [0, 0.25, 0.45, 0.75] }
    );
    videoVisibilityObserver.observe(observeTarget);

    // Pause when the tab is hidden; resume only if visible and not paused by the visitor
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pauseForVisibilityChange();
      } else if (isVideoVisible && !userPaused) {
        playWhenVisible();
      }
    });

    // When leaving fullscreen, apply the real visibility state again
    document.addEventListener("fullscreenchange", () => {
      if (!isFullscreen() && !isVideoVisible) pauseForVisibilityChange();
    });

    if (bigPlayBtn) {
      bigPlayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playFromButton();
      });
    }

    // Keep state in sync with the native HTML5 video controls
    video.addEventListener("playing", () => {
      hasStartedOnce = true;
      isSystemPausing = false;
      userPaused = false;
      syncPlayState();
    });

    video.addEventListener("pause", () => {
      if (isSystemPausing) {
        // Automatic pause (scrolled away or tab switched)
        isSystemPausing = false;
      } else if (!video.ended) {
        // The visitor paused it on purpose
        userPaused = true;
      }
      syncPlayState();
    });

    video.addEventListener("ended", syncPlayState);

    // If the video was scrolled into view before it was ready, start it once it can play
    video.addEventListener("canplay", playWhenVisible);

    // Missing file, wrong name/case, or unsupported format: tell the visitor instead of failing silently
    const sourceEl = video.querySelector("source");
    if (sourceEl) sourceEl.addEventListener("error", showVideoError);
    video.addEventListener("error", showVideoError);

    syncPlayState();
  }

  /* ---------- 5. Quick Play Demo (Including Clickable Scrambled Words) ---------- */
  const totalQuestions = 4;
  const coinsPerCorrectAnswer = 10;
  let currentQuestion = 0;
  let coins = 0;
  let score = 0;
  const alreadyAnswered = [false, false, false, false];
  const questionTypes = ["Multiple Choice", "Fill in the Blanks", "Identification", "Scrambled Words"];
  const correctAnswerText = ["B. Chlorophyll", "100", "Nucleus", "PLANT"];
  const explanations = [
    "Chlorophyll is the green pigment in leaves that captures sunlight so the plant can make its food.",
    "At sea level, water reaches its boiling point at 100 degrees Celsius.",
    "The nucleus holds the protons and neutrons, which make up almost all of an atom's mass.",
    "T-N-A-L-P rearranged spells PLANT."
  ];

  const questionNumberText = $("#questionNumber");
  const questionTypeText = $("#questionType");
  const progressFill = $("#progressFill");
  const coinsDisplay = $("#coinsDisplay");
  const resultsBox = $("#results");
  const questionBoxes = $$(".question");
  const optionButtons = $$(".demo__opt");
  const answerForms = $$(".demo__form");
  const nextButtons = $$(".demo__next");

  /* -- Scrambled Words Clickable Tile Engine -- */
  const scrambleTargetWord = "PLANT";
  const scrambleLetters = ["T", "N", "A", "L", "P"];
  let scrambleSlotsState = Array(scrambleTargetWord.length).fill(null);

  const scrambleAnswerSlotsEl = $("#scrambleAnswerSlots");
  const scrambleLetterBankEl = $("#scrambleLetterBank");
  const submit4Btn = $("#submit4");
  const clearScrambleBtn = $("#clearScrambleBtn");

  function renderScrambleGame() {
    if (!scrambleAnswerSlotsEl || !scrambleLetterBankEl) return;

    const locked = alreadyAnswered[3];

    scrambleAnswerSlotsEl.innerHTML = "";
    scrambleSlotsState.forEach((entry, slotIndex) => {
      const slotBtn = document.createElement("button");
      slotBtn.type = "button";
      slotBtn.className = entry ? "scramble-slot is-filled" : "scramble-slot";
      slotBtn.textContent = entry ? entry.letter : "";
      slotBtn.disabled = locked || !entry;
      slotBtn.setAttribute(
        "aria-label",
        entry
          ? `Selected letter ${entry.letter} at position ${slotIndex + 1}. Tap to remove.`
          : `Empty letter slot ${slotIndex + 1}`
      );

      if (entry && !locked) {
        slotBtn.addEventListener("click", () => {
          scrambleSlotsState[slotIndex] = null;
          const fb4 = $("#feedback4");
          if (fb4 && fb4.classList.contains("warn")) {
            fb4.hidden = true;
          }
          renderScrambleGame();
        });
      }

      scrambleAnswerSlotsEl.appendChild(slotBtn);
    });

    const usedTileIndices = new Set(
      scrambleSlotsState.filter(Boolean).map((entry) => entry.tileIndex)
    );

    scrambleLetterBankEl.innerHTML = "";
    scrambleLetters.forEach((letter, tileIndex) => {
      const isSelected = usedTileIndices.has(tileIndex);
      const tileBtn = document.createElement("button");
      tileBtn.type = "button";
      tileBtn.className = isSelected ? "scramble-tile is-selected" : "scramble-tile";
      tileBtn.textContent = letter;
      tileBtn.disabled = locked || isSelected;
      tileBtn.setAttribute("aria-pressed", String(isSelected));
      tileBtn.setAttribute(
        "aria-label",
        isSelected ? `Letter ${letter} already selected` : `Select letter ${letter}`
      );

      if (!isSelected && !locked) {
        tileBtn.addEventListener("click", () => {
          const nextEmptyIndex = scrambleSlotsState.indexOf(null);
          if (nextEmptyIndex === -1) return;
          scrambleSlotsState[nextEmptyIndex] = { tileIndex, letter };
          const fb4 = $("#feedback4");
          if (fb4 && fb4.classList.contains("warn")) {
            fb4.hidden = true;
          }
          renderScrambleGame();
        });
      }

      scrambleLetterBankEl.appendChild(tileBtn);
    });

    if (clearScrambleBtn) {
      const hasAnySelection = scrambleSlotsState.some(Boolean);
      clearScrambleBtn.disabled = locked || !hasAnySelection;
    }
  }

  function resetScrambleState() {
    scrambleSlotsState = Array(scrambleTargetWord.length).fill(null);
    if (scrambleAnswerSlotsEl) {
      scrambleAnswerSlotsEl.classList.remove("is-correct", "is-wrong");
    }
    if (submit4Btn) submit4Btn.disabled = false;
    renderScrambleGame();
  }

  function checkScrambledAnswer() {
    if (alreadyAnswered[3]) return;
    const feedback = $("#feedback4");
    if (!feedback) return;

    if (scrambleSlotsState.some((slot) => slot === null)) {
      feedback.className = "demo__msg warn";
      feedback.textContent = "Please tap all 5 letters to complete the word before submitting.";
      feedback.hidden = false;
      return;
    }

    const assembledWord = scrambleSlotsState.map((entry) => entry.letter).join("");
    const isCorrect = assembledWord === scrambleTargetWord;

    if (scrambleAnswerSlotsEl) {
      scrambleAnswerSlotsEl.classList.add(isCorrect ? "is-correct" : "is-wrong");
    }
    if (submit4Btn) submit4Btn.disabled = true;

    finishQuestion(3, isCorrect);
    renderScrambleGame();
  }

  if (submit4Btn) {
    submit4Btn.addEventListener("click", checkScrambledAnswer);
  }

  if (clearScrambleBtn) {
    clearScrambleBtn.addEventListener("click", () => {
      if (alreadyAnswered[3]) return;
      scrambleSlotsState = Array(scrambleTargetWord.length).fill(null);
      const fb4 = $("#feedback4");
      if (fb4) fb4.hidden = true;
      renderScrambleGame();
    });
  }

  function updateProgressBar() {
    if (!progressFill) return;
    const answeredCount = alreadyAnswered.filter(Boolean).length;
    progressFill.style.width = `${(answeredCount / totalQuestions) * 100}%`;
  }

  function showQuestion() {
    if (!questionBoxes.length) return;
    questionBoxes.forEach((box) => (box.hidden = true));
    questionBoxes[currentQuestion].hidden = false;
    if (questionNumberText) {
      questionNumberText.textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
    }
    if (questionTypeText) {
      questionTypeText.textContent = questionTypes[currentQuestion];
    }
    if (currentQuestion === 3 && !alreadyAnswered[3]) {
      resetScrambleState();
    }
    updateProgressBar();
  }

  function finishQuestion(questionIndex, isCorrect) {
    const qNum = questionIndex + 1;
    const feedback = $(`#feedback${qNum}`);
    const nextButton = $(`#next${qNum}`);

    alreadyAnswered[questionIndex] = true;

    if (isCorrect) {
      score += 1;
      coins += coinsPerCorrectAnswer;
      if (coinsDisplay) {
        coinsDisplay.textContent = coins;
        coinsDisplay.classList.add("pop");
        setTimeout(() => coinsDisplay.classList.remove("pop"), 500);
      }
      if (feedback) {
        feedback.className = "demo__msg ok";
        feedback.textContent = `Correct! +${coinsPerCorrectAnswer} coins. ${explanations[questionIndex]}`;
      }
      confetti(window.innerWidth / 2, window.innerHeight / 2);
    } else if (feedback) {
      feedback.className = "demo__msg no";
      feedback.textContent = `Not quite. The correct answer is ${correctAnswerText[questionIndex]}. ${explanations[questionIndex]}`;
    }

    if (feedback) feedback.hidden = false;
    if (nextButton) nextButton.hidden = false;
    updateProgressBar();
  }

  function checkMultipleChoice(clickedButton) {
    if (alreadyAnswered[0]) return;
    const chosenLetter = clickedButton.getAttribute("data-letter");
    const isCorrect = chosenLetter === "B";

    clickedButton.classList.add(isCorrect ? "correct" : "wrong");

    optionButtons.forEach((btn) => {
      btn.disabled = true;
      if (btn.getAttribute("data-letter") === "B") {
        btn.classList.add("correct");
      }
    });

    finishQuestion(0, isCorrect);
  }

  function checkTypedAnswer(questionIndex) {
    if (alreadyAnswered[questionIndex]) return;
    const qNum = questionIndex + 1;
    const input = $(`#answer${qNum}`);
    const submitButton = $(`#submit${qNum}`);
    const feedback = $(`#feedback${qNum}`);
    if (!input || !submitButton || !feedback) return;

    const userAnswer = input.value.trim().toLowerCase();

    if (userAnswer === "") {
      feedback.className = "demo__msg warn";
      feedback.textContent = "Please type an answer first.";
      feedback.hidden = false;
      input.focus();
      return;
    }

    let isCorrect = false;
    if (questionIndex === 1 && (userAnswer === "100" || userAnswer === "one hundred")) {
      isCorrect = true;
    } else if (questionIndex === 2 && (userAnswer === "nucleus" || userAnswer === "the nucleus")) {
      isCorrect = true;
    }

    input.classList.add(isCorrect ? "correct" : "wrong");
    input.disabled = true;
    submitButton.disabled = true;

    finishQuestion(questionIndex, isCorrect);
  }

  function goToNextQuestion() {
    if (currentQuestion < totalQuestions - 1) {
      currentQuestion += 1;
      showQuestion();
    } else {
      showResults();
    }
  }

  function showResults() {
    questionBoxes.forEach((box) => (box.hidden = true));
    if (resultsBox) resultsBox.hidden = false;
    if (questionNumberText) questionNumberText.textContent = "Completed";
    if (questionTypeText) questionTypeText.textContent = "Results";

    const finalScoreEl = $("#finalScore");
    const finalCoinsEl = $("#finalCoins");
    const resultMsgEl = $("#resultMessage");

    if (finalScoreEl) finalScoreEl.textContent = `${score} / ${totalQuestions}`;
    if (finalCoinsEl) finalCoinsEl.textContent = coins;

    if (resultMsgEl) {
      if (score === totalQuestions) {
        resultMsgEl.textContent = "A perfect score! You are ready for a group challenge.";
      } else if (score >= 2) {
        resultMsgEl.textContent = "Nice work! Try again to beat your score.";
      } else {
        resultMsgEl.textContent = "Good try! Give it another go to earn more coins.";
      }
    }

    updateProgressBar();
    confetti(window.innerWidth / 2, window.innerHeight / 2);
  }

  function restartDemo() {
    currentQuestion = 0;
    coins = 0;
    score = 0;
    if (coinsDisplay) coinsDisplay.textContent = "0";
    if (resultsBox) resultsBox.hidden = true;

    for (let i = 0; i < totalQuestions; i++) {
      alreadyAnswered[i] = false;
      const fb = $(`#feedback${i + 1}`);
      const nxt = $(`#next${i + 1}`);
      if (fb) fb.hidden = true;
      if (nxt) nxt.hidden = true;
    }

    optionButtons.forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("correct", "wrong");
    });

    for (let k = 2; k <= 3; k++) {
      const input = $(`#answer${k}`);
      const sub = $(`#submit${k}`);
      if (input) {
        input.value = "";
        input.disabled = false;
        input.classList.remove("correct", "wrong");
      }
      if (sub) sub.disabled = false;
    }

    resetScrambleState();
    showQuestion();
  }

  optionButtons.forEach((btn) => {
    btn.addEventListener("click", () => checkMultipleChoice(btn));
  });

  answerForms.forEach((f) => {
    f.addEventListener("submit", (event) => {
      event.preventDefault();
      const qNum = Number(f.getAttribute("data-question"));
      checkTypedAnswer(qNum - 1);
    });
  });

  nextButtons.forEach((btn) => btn.addEventListener("click", goToNextQuestion));

  const restartBtn = $("#restartButton");
  if (restartBtn) restartBtn.addEventListener("click", restartDemo);

  resetScrambleState();
  showQuestion();

  /* ---------- 6. Contact Form Validation & Submission ---------- */
  const form = $("#contactForm");
  const ok = $("#formOk");
  const err = $("#formErr");
  const submitBtn = $("#submitBtn");

  if (form) {
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."),
      message_subject: (v) => (v.trim().length >= 3 ? "" : "Please enter a subject."),
      message: (v) => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
    };

    function validateField(name) {
      const input = form.elements[name];
      if (!input) return true;
      const msg = rules[name](input.value);
      const fieldWrapper = input.closest(".field");
      if (fieldWrapper) fieldWrapper.classList.toggle("invalid", Boolean(msg));
      const errEl = $(`.error[data-for="${name}"]`, form);
      if (errEl) errEl.textContent = msg;
      return !msg;
    }

    Object.keys(rules).forEach((n) => {
      if (form.elements[n]) {
        form.elements[n].addEventListener("input", () => validateField(n));
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (ok) ok.hidden = true;
      if (err) err.hidden = true;

      const valid = Object.keys(rules).map(validateField).every(Boolean);
      if (!valid) return;

      const apiKeyInput = form.querySelector('input[name="apikey"]');
      if (apiKeyInput && apiKeyInput.value === "YOUR_ACCESS_KEY_HERE") {
        const subj = encodeURIComponent(`[Quizian] ${form.elements.message_subject.value.trim()}`);
        const body = encodeURIComponent(
          `Name: ${form.elements.name.value.trim()}\nEmail: ${form.elements.email.value.trim()}\n\n${form.elements.message.value.trim()}`
        );
        window.location.href = `mailto:matteollanora@gmail.com?subject=${subj}&body=${body}`;
        if (ok) {
          ok.textContent = "✅ Opening your email client to send your message to matteollanora@gmail.com!";
          ok.hidden = false;
        }
        form.reset();
        confetti(window.innerWidth / 2, window.innerHeight * 0.6);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending message...";
      }

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });

        const result = await response.json();

        if (response.ok) {
          if (ok) {
            ok.textContent = "✅ Thank you! Your message has been sent successfully.";
            ok.hidden = false;
          }
          form.reset();
          confetti(window.innerWidth / 2, window.innerHeight * 0.6);
          setTimeout(() => {
            if (ok) ok.hidden = true;
          }, 6000);
        } else if (err) {
          err.textContent = result.message || "❌ Oops! Something went wrong. Please try again.";
          err.hidden = false;
        }
      } catch (error) {
        if (err) {
          err.textContent = "❌ Network error. Please check your connection and try again.";
          err.hidden = false;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        }
      }
    });
  }

  /* ---------- 7. Unified Scroll Handler, Cursor Glow, Tilt & Confetti ---------- */
  const bar = $("#progress");
  let scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
      if (bar) {
        const h = document.documentElement;
        const maxScroll = h.scrollHeight - h.clientHeight;
        bar.style.width = maxScroll > 0 ? `${(h.scrollTop / maxScroll) * 100}%` : "0%";
      }
      updateActiveNavOnScroll();
      scrollTicking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateActiveNavOnScroll();

  const glow = $("#cursorGlow");
  if (glow) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        glow.style.opacity = "1";
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      },
      { passive: true }
    );
  }

  $$(".card, .feature, .member, .step").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${x * 8}deg`);
      el.style.setProperty("--rx", `${-y * 8}deg`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  const cv = $("#confetti");
  const ctx = cv ? cv.getContext("2d") : null;
  let bits = [];
  let raf = null;
  const colors = ["#ff8133", "#ffd9bf", "#34c759", "#ffffff", "#ffb27a"];

  function resizeCanvas() {
    if (!cv) return;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }

  if (cv && ctx) {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    if (!cv || !ctx) return;
    for (let i = 0; i < 80; i++) {
      bits.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -13 - 3,
        s: Math.random() * 8 + 4,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        c: colors[(Math.random() * colors.length) | 0],
        life: 105
      });
    }
    if (!raf) loopConfetti();
  }

  function loopConfetti() {
    if (!cv || !ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    bits.forEach((b) => {
      b.vy += 0.38;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      b.life -= 1;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.globalAlpha = Math.max(0, b.life / 105);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
      ctx.restore();
    });
    bits = bits.filter((b) => b.life > 0);
    raf = bits.length ? requestAnimationFrame(loopConfetti) : null;
    if (!raf) ctx.clearRect(0, 0, cv.width, cv.height);
  }

  $$(".cta__btns .btn, .hero__cta .btn--primary").forEach((b) =>
    b.addEventListener("click", (e) => confetti(e.clientX, e.clientY))
  );

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
