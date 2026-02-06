(() => {
  const root = document.querySelector('.arcade');
  if (!root) return;

  const config = {
    codeVerifyUrl: root.dataset.codeVerifyUrl || '/.netlify/functions/verify-iftar-code',
    notifySignupUrl: root.dataset.notifySignupUrl || '/.netlify/functions/notify-iftar-signup',
    privacyCopy: root.dataset.privacyCopy || '',
    eventYear: Number.parseInt(root.dataset.eventYear, 10) || new Date().getFullYear(),
    sheetyUrl: root.dataset.sheetyUrl || '',
    cloudinaryName: root.dataset.cloudinaryName || '',
    cloudinaryPreset: root.dataset.cloudinaryPreset || '',
    cloudinaryFolder: root.dataset.cloudinaryFolder || 'iftar2026',
    seatCount: 10,
    simulateNetwork: false,
    networkFailRate: 0.08,
    conflictRate: 0.1
  };

  const isSheetDbApi = (() => {
    try {
      const url = new URL(config.sheetyUrl);
      return url.hostname.includes('sheetdb.io');
    } catch (err) {
      return false;
    }
  })();

  const state = {
    audioEnabled: true,
    audioUnlocked: false,
    started: false,
    demoMode: false,
    codeSubmitting: false,
    quizScore: 0,
    quizIndex: 0,
    playerName: '',
    playerSelfie: null,
    bringingPlusOne: false,
    plusOneName: '',
    plusOneSelfie: null,
    selectedTable: null,
    selectedSeat: null,
    selectedPlusOneSeat: null,
    playerNote: '',
    readOnly: false,
    claims: [],
    lastClaimIds: []
  };

  const els = {
    screens: Array.from(root.querySelectorAll('[data-screen]')),
    audioHint: root.querySelector('[data-audio-hint]'),
    soundToggle: root.querySelector('[data-sound-toggle]'),
    pressStart: root.querySelector('[data-action="press-start"]'),
    codeInput: root.querySelector('[data-code-input]'),
    codeFeedback: root.querySelector('[data-code-feedback]'),
    quizIndex: root.querySelector('[data-quiz-index]'),
    quizQuestion: root.querySelector('[data-quiz-question]'),
    quizOptions: root.querySelector('[data-quiz-options]'),
    quizFeedback: root.querySelector('[data-quiz-feedback]'),
    resultCopy: root.querySelector('[data-result-copy]'),
    nameInput: root.querySelector('[data-name-input]'),
    selfieVideo: root.querySelector('[data-selfie-video]'),
    selfiePreview: root.querySelector('[data-selfie-preview]'),
    selfieCanvas: root.querySelector('[data-selfie-canvas]'),
    cameraError: root.querySelector('[data-camera-error]'),
    retryCameraAccess: root.querySelector('[data-action="retry-camera-access"]'),
    takePhoto: root.querySelector('[data-action="take-photo"]'),
    retakePhoto: root.querySelector('[data-action="retake-photo"]'),
    selfieContinue: root.querySelector('[data-action="to-plus-one-decision"]'),
    plusOneNameInput: root.querySelector('[data-plus-one-name-input]'),
    plusOneSelfieVideo: root.querySelector('[data-plus-one-selfie-video]'),
    plusOneSelfiePreview: root.querySelector('[data-plus-one-selfie-preview]'),
    plusOneSelfieCanvas: root.querySelector('[data-plus-one-selfie-canvas]'),
    plusOneCameraError: root.querySelector('[data-plus-one-camera-error]'),
    retryPlusOneCameraAccess: root.querySelector('[data-action="retry-plus-one-camera-access"]'),
    plusOneTakePhoto: root.querySelector('[data-action="take-plus-one-photo"]'),
    plusOneRetakePhoto: root.querySelector('[data-action="retake-plus-one-photo"]'),
    plusOneContinue: root.querySelector('[data-screen="plus-one-selfie"] [data-action="to-tables"]'),
    selfieMessage: root.querySelector('[data-selfie-message]'),
    privacyInline: root.querySelector('[data-privacy-inline]'),
    privacyFooter: root.querySelector('[data-privacy-footer]'),
    privacyFooterWrap: root.querySelector('.arcade__footer'),
    tableGrid: root.querySelector('[data-table-grid]'),
    tableMessage: root.querySelector('[data-table-message]'),
    seatMap: root.querySelector('[data-seat-map]'),
    seatMessage: root.querySelector('[data-seat-message]'),
    claimSeat: root.querySelector('[data-action="claim-seat"]'),
    noteMessage: root.querySelector('[data-note-message]'),
    noteInput: root.querySelector('[data-note-input]'),
    receipt: root.querySelector('[data-receipt]'),
    demoMessage: root.querySelector('[data-demo-message]'),
    celebration: root.querySelector('[data-celebration]'),
    confetti: root.querySelector('[data-confetti]')
  };

  if (els.privacyInline) {
    els.privacyInline.textContent = config.privacyCopy;
    els.privacyInline.hidden = !config.privacyCopy;
  }
  if (els.privacyFooter) {
    els.privacyFooter.textContent = config.privacyCopy;
    els.privacyFooter.hidden = !config.privacyCopy;
  }
  if (els.privacyFooterWrap) {
    els.privacyFooterWrap.hidden = !config.privacyCopy;
  }

  const audio = setupAudio();
  const soundLastPlayed = new Map();
  let tables = [];
  let currentScreen = 'start';
  let startTransitioning = false;
  let startAltIndex = 0;
  let activeStream = null;
  let activeCameraMode = null;
  const isIPhone = /iPhone/i.test(navigator.userAgent || '');
  const isIOSChrome = /CriOS/i.test(navigator.userAgent || '');

  const quizQuestions = [
    {
      question: 'what do we usually break the fast with at iftar?',
      options: ['water & dates', 'coffee', 'soup', 'whatever is closest'],
      answer: 0
    },
    {
      question: 'when does iftar start?',
      options: ['at sunset', 'at midnight', 'after dinner', 'whenever you feel like it'],
      answer: 0
    },
    {
      question: 'iftar is part of which month?',
      options: ['ramadan', 'december', 'summer holidays', 'exam week'],
      answer: 0
    }
  ];

  const codeFeedbackLines = [
    "nope, that's not it",
    'close... but not really',
    'nice try'
  ];
  let codeFeedbackIndex = 0;

  const seatTooltips = ['near kitchen', 'tea refill zone', 'chaos corner'];
  const eventDates = [
    new Date(config.eventYear, 1, 25),
    new Date(config.eventYear, 1, 27),
    new Date(config.eventYear, 2, 4),
    new Date(config.eventYear, 2, 6),
    new Date(config.eventYear, 2, 13),
    new Date(config.eventYear, 2, 17)
  ];
  const hostSeatsByDate = {
    '17/03': [
      { seatNumber: 1, name: 'Suzan' },
      { seatNumber: 2, name: 'Pherkan' }
    ]
  };

  function setupAudio() {
    const create = (src, options = {}) => {
      const audioEl = new Audio(src);
      audioEl.loop = Boolean(options.loop);
      audioEl.preload = 'auto';
      return audioEl;
    };

    const ambientTrack = create('/assets/audio/arcade-bgm-loop.mp3', { loop: true });
    const sounds = {
      ambient: ambientTrack,
      bgm: ambientTrack,
      press: create('/assets/audio/press-start.wav'),
      pressAlt: [
        create('/assets/audio/press-alt-1.wav'),
        create('/assets/audio/press-alt-2.wav'),
        create('/assets/audio/press-alt-3.wav')
      ],
      coin: create('/assets/audio/coin.wav'),
      buzzer: create('/assets/audio/buzzer.wav'),
      shutter: create('/assets/audio/shutter.wav'),
      fanfare: create('/assets/audio/fanfare.wav')
    };

    sounds.ambient.volume = 0.7;
    sounds.bgm.volume = 0.7;
    sounds.press.volume = 1;
    sounds.pressAlt.forEach((sound) => {
      sound.volume = 1;
    });
    sounds.coin.volume = 1;
    sounds.buzzer.volume = 1;
    sounds.shutter.volume = 1;
    sounds.fanfare.volume = 1;

    return sounds;
  }

  async function playSound(sound, options = {}) {
    if (!state.audioEnabled || !sound) return false;
    const now = Date.now();
    const dedupeMs = typeof options.dedupeMs === 'number' ? options.dedupeMs : 120;
    const lastPlayed = soundLastPlayed.get(sound);
    if (lastPlayed && now - lastPlayed < dedupeMs) return false;
    soundLastPlayed.set(sound, now);
    if (options.reset !== false) {
      try {
        sound.currentTime = 0;
      } catch (err) {
        // ignore
      }
    }
    try {
      await sound.play();
      state.audioUnlocked = true;
      if (els.audioHint) els.audioHint.hidden = true;
      return true;
    } catch (err) {
      return false;
    }
  }

  function pauseSound(sound) {
    if (!sound) return;
    sound.pause();
  }

  function stopAllAudio() {
    pauseSound(audio.ambient);
    pauseSound(audio.bgm);
  }

  async function startAmbient() {
    const ok = await playSound(audio.ambient, { reset: false });
    if (!ok && els.audioHint) {
      els.audioHint.hidden = false;
    }
  }

  function startBgm() {
    if (audio.bgm === audio.ambient) {
      playSound(audio.bgm, { reset: false });
      return;
    }
    pauseSound(audio.ambient);
    playSound(audio.bgm, { reset: false });
  }

  function updateSoundToggle() {
    if (!els.soundToggle) return;
    els.soundToggle.textContent = state.audioEnabled ? 'sound: on' : 'sound: off';
    els.soundToggle.setAttribute('aria-pressed', state.audioEnabled ? 'true' : 'false');
  }

  function showScreen(name) {
    els.screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    const previous = currentScreen;
    currentScreen = name;
    handleScreenTransition(previous, name);
  }

  function handleScreenTransition(previous, next) {
    if ((previous === 'selfie' || previous === 'plus-one-selfie') && next !== previous) {
      stopCamera();
    }

    if (next === 'code') {
      if (els.codeInput) {
        els.codeInput.focus();
      }
    }

    if (next === 'quiz') {
      renderQuiz();
    }

    if (next === 'result') {
      renderResult();
    }

    if (next === 'selfie') {
      startCamera('primary');
      updateSelfieContinue();
      window.setTimeout(() => {
        if (currentScreen !== 'selfie') return;
        if (!activeStream || activeCameraMode !== 'primary') {
          showCameraError('primary', 'please allow camera access first.');
        }
      }, 1500);
    }

    if (next === 'plus-one-selfie') {
      startCamera('plusOne');
      updatePlusOneContinue();
      window.setTimeout(() => {
        if (currentScreen !== 'plus-one-selfie') return;
        if (!activeStream || activeCameraMode !== 'plusOne') {
          showCameraError('plusOne', 'please allow camera access first.');
        }
      }, 1500);
    }

    if (next === 'tables') {
      loadClaims({ silent: true }).then(() => renderTables());
    }

    if (next === 'seats') {
      loadClaims({ silent: true }).then(() => renderSeats());
    }

    if (next === 'confirm') {
      renderConfirmation();
    }
  }

  function animatePress(button) {
    if (!button) return;
    button.classList.add('is-pressed');
    setTimeout(() => button.classList.remove('is-pressed'), 160);
  }

  function handlePressStart() {
    animatePress(els.pressStart);
    unlockAudio();

    if (startTransitioning) {
      const alt = audio.pressAlt[startAltIndex % audio.pressAlt.length];
      startAltIndex += 1;
      playSound(alt);
      return;
    }

    startTransitioning = true;
    state.started = true;
    playSound(audio.press);
    startBgm();

    setTimeout(() => {
      showScreen('code');
      startTransitioning = false;
    }, 600);
  }

  function sanitizeCodeInput() {
    if (!els.codeInput) return;
    const maxDigits = Number.parseInt(els.codeInput.getAttribute('maxlength'), 10) || 6;
    els.codeInput.value = els.codeInput.value.replace(/\D/g, '').slice(0, maxDigits);
  }

  async function handleSubmitCode() {
    if (!els.codeInput) return;
    if (state.codeSubmitting) return;
    sanitizeCodeInput();
    const value = els.codeInput.value.trim();

    const requiredCodeLength = Number.parseInt(els.codeInput.getAttribute('maxlength'), 10) || 6;
    if (value.length < requiredCodeLength) {
      showCodeFeedback(`${requiredCodeLength} digits, please.`);
      playSound(audio.buzzer);
      shakeElement(els.codeInput);
      return;
    }

    state.codeSubmitting = true;
    const submitButton = root.querySelector('[data-action="submit-code"]');
    if (submitButton) submitButton.disabled = true;

    let verified = false;
    try {
      verified = await verifySecretCode(value);
    } catch (err) {
      verified = false;
    } finally {
      state.codeSubmitting = false;
      if (submitButton) submitButton.disabled = false;
    }

    if (verified) {
      state.demoMode = false;
      showCodeFeedback('code accepted.');
      playSound(audio.coin);
      showScreen('intro');
      return;
    }

    showCodeFeedback(codeFeedbackLines[codeFeedbackIndex % codeFeedbackLines.length]);
    codeFeedbackIndex += 1;
    playSound(audio.buzzer);
    shakeElement(els.codeInput);
  }

  async function verifySecretCode(code) {
    if (!config.codeVerifyUrl) return false;
    const response = await fetch(config.codeVerifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return Boolean(payload && payload.ok);
  }

  function showCodeFeedback(text) {
    if (els.codeFeedback) {
      els.codeFeedback.textContent = text;
    }
  }

  function shakeElement(element) {
    if (!element) return;
    element.classList.remove('shake');
    void element.offsetWidth;
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 320);
  }

  function startDemoMode() {
    state.demoMode = true;
    playSound(audio.coin);
    showScreen('intro');
  }

  function renderQuiz() {
    const current = quizQuestions[state.quizIndex];
    if (!current) return;

    if (els.quizIndex) {
      els.quizIndex.textContent = `${state.quizIndex + 1}`;
    }

    if (els.quizQuestion) {
      els.quizQuestion.textContent = current.question;
    }

    if (els.quizFeedback) {
      els.quizFeedback.textContent = '';
    }

    if (els.quizOptions) {
      els.quizOptions.innerHTML = '';
      current.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nes-btn';
        button.dataset.optionIndex = `${index}`;
        button.textContent = option;
        els.quizOptions.appendChild(button);
      });
    }
  }

  function handleQuizAnswer(index) {
    const current = quizQuestions[state.quizIndex];
    if (!current) return;

    const correct = index === current.answer;
    if (correct) {
      state.quizScore += 1;
      playSound(audio.coin);
      if (els.quizFeedback) els.quizFeedback.textContent = 'correct!';
    } else {
      playSound(audio.buzzer);
      const wrongMessages = {
        1: 'wow... ok.',
        2: "uhu, you're ri.. not"
      };
      const fallback = 'bruh, really?';
      if (els.quizFeedback) {
        els.quizFeedback.textContent = wrongMessages[state.quizIndex] || fallback;
      }
    }

    if (els.quizOptions) {
      Array.from(els.quizOptions.querySelectorAll('button')).forEach((button) => {
        const buttonIndex = Number.parseInt(button.dataset.optionIndex, 10);
        if (buttonIndex === index) {
          button.classList.add(correct ? 'is-selected-answer-correct' : 'is-selected-answer-wrong');
        }
        button.disabled = true;
      });
    }

    setTimeout(() => {
      state.quizIndex += 1;
      if (state.quizIndex < quizQuestions.length) {
        renderQuiz();
      } else {
        showScreen('result');
      }
    }, 1000);
  }

  function renderResult() {
    const score = state.quizScore;
    const lines = [];

    if (score === 3) {
      lines.push('3 out of 3.', 'perfect score.', "you're clearly an iftar expert.");
    } else if (score === 2) {
      lines.push('2 out of 3.', "one wrong... but we'll allow it.", "you're still invited.");
    } else if (score === 1) {
      lines.push('1 out of 3.', 'not great...', "but we're nice people.", "you're welcome anyway.");
    } else {
      lines.push('0 out of 3.', 'impressive, in a way.', "you're still welcome -", 'but expect a short physical interview at the table.');
    }

    if (els.resultCopy) {
      els.resultCopy.innerHTML = '';
      lines.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        els.resultCopy.appendChild(p);
      });
    }
  }

  function getCameraElements(mode) {
    if (mode === 'plusOne') {
      return {
        video: els.plusOneSelfieVideo,
        preview: els.plusOneSelfiePreview,
        canvas: els.plusOneSelfieCanvas,
        error: els.plusOneCameraError,
        retryButton: els.retryPlusOneCameraAccess,
        takeButton: els.plusOneTakePhoto,
        retakeButton: els.plusOneRetakePhoto
      };
    }
    return {
      video: els.selfieVideo,
      preview: els.selfiePreview,
      canvas: els.selfieCanvas,
      error: els.cameraError,
      retryButton: els.retryCameraAccess,
      takeButton: els.takePhoto,
      retakeButton: els.retakePhoto
    };
  }

  function setSelfieValue(mode, value) {
    if (mode === 'plusOne') {
      state.plusOneSelfie = value;
      return;
    }
    state.playerSelfie = value;
  }

  async function startCamera(mode = 'primary') {
    const camera = getCameraElements(mode);
    if (!camera.video) return;
    if (activeStream && activeCameraMode === mode) {
      const hasLiveVideoTrack = activeStream.getVideoTracks().some((track) => track.readyState === 'live');
      if (hasLiveVideoTrack) return;
      stopCamera();
    }
    if (activeStream && activeCameraMode !== mode) {
      stopCamera();
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraError(mode);
      return;
    }

    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      activeCameraMode = mode;
      camera.video.srcObject = activeStream;
      await camera.video.play();
      hideCameraError(mode);
    } catch (err) {
      stopCamera();
      const permissionDenied = err && (
        err.name === 'NotAllowedError'
        || err.name === 'PermissionDeniedError'
        || err.name === 'SecurityError'
      );
      let message = permissionDenied
        ? 'please allow camera access to continue.'
        : 'camera access is required to continue.';
      if (permissionDenied && isIPhone && isIOSChrome) {
        message = 'camera blocked. on iphone chrome: settings > chrome > camera > allow, then tap "allow camera access".';
      }
      showCameraError(mode, message);
    }
  }

  function stopCamera() {
    if (!activeStream) return;
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
    activeCameraMode = null;
    if (els.selfieVideo) els.selfieVideo.srcObject = null;
    if (els.plusOneSelfieVideo) els.plusOneSelfieVideo.srcObject = null;
  }

  function showCameraError(mode = 'primary', message = 'camera access is required to continue.') {
    const camera = getCameraElements(mode);
    if (camera.error) {
      camera.error.textContent = message;
      camera.error.hidden = false;
    }
    if (camera.retryButton) {
      camera.retryButton.hidden = false;
    }
  }

  function hideCameraError(mode = 'primary') {
    const camera = getCameraElements(mode);
    if (camera.error) {
      camera.error.hidden = true;
    }
    if (camera.retryButton) {
      camera.retryButton.hidden = true;
    }
  }

  function takePhoto(mode = 'primary') {
    const camera = getCameraElements(mode);
    if (!camera.video || !camera.canvas || !camera.preview) return;
    if (!activeStream || activeCameraMode !== mode || camera.video.videoWidth === 0) {
      showCameraError(mode);
      return;
    }
    const frame = camera.video.closest('.camera-frame');
    const width = camera.video.videoWidth || 320;
    const height = camera.video.videoHeight || 240;
    camera.canvas.width = width;
    camera.canvas.height = height;
    const context = camera.canvas.getContext('2d');
    if (!context) return;
    context.drawImage(camera.video, 0, 0, width, height);
    const dataUrl = camera.canvas.toDataURL('image/jpeg', 0.82);

    setSelfieValue(mode, dataUrl);
    camera.preview.src = dataUrl;
    camera.preview.hidden = false;
    camera.video.hidden = true;
    if (camera.retakeButton) camera.retakeButton.disabled = false;
    if (camera.takeButton) camera.takeButton.disabled = true;
    if (frame) {
      frame.classList.remove('is-flashing');
      void frame.offsetWidth;
      frame.classList.add('is-flashing');
      setTimeout(() => frame.classList.remove('is-flashing'), 520);
    }
    playSound(audio.shutter);
    if (mode === 'primary' && els.selfieMessage) els.selfieMessage.textContent = '';
    updateSelfieContinue();
    updatePlusOneContinue();
  }

  function retakePhoto(mode = 'primary') {
    const camera = getCameraElements(mode);
    setSelfieValue(mode, null);
    if (camera.preview) camera.preview.hidden = true;
    if (camera.video) camera.video.hidden = false;
    if (camera.retakeButton) camera.retakeButton.disabled = true;
    if (camera.takeButton) camera.takeButton.disabled = false;
    if (mode === 'primary' && els.selfieMessage) els.selfieMessage.textContent = '';
    updateSelfieContinue();
    updatePlusOneContinue();
  }

  function updateSelfieContinue() {
    if (!els.selfieContinue) return;
    const ready = state.playerName.trim().length > 0 && Boolean(state.playerSelfie);
    els.selfieContinue.disabled = !ready;
  }

  function handleNameInput() {
    state.playerName = els.nameInput ? els.nameInput.value.trim() : '';
    if (els.selfieMessage) els.selfieMessage.textContent = '';
    updateSelfieContinue();
  }

  function updatePlusOneContinue() {
    if (!els.plusOneContinue) return;
    const ready = state.plusOneName.trim().length > 0 && Boolean(state.plusOneSelfie);
    els.plusOneContinue.disabled = !ready;
  }

  function handlePlusOneNameInput() {
    state.plusOneName = els.plusOneNameInput ? els.plusOneNameInput.value.trim() : '';
    updatePlusOneContinue();
  }

  function requiredSeatCount() {
    return state.bringingPlusOne ? 2 : 1;
  }

  function generateTables(claims = []) {
    const names = ['space invader', 'pac-man', 'tetris', 'galaga', 'donkey kong', 'frogger', 'asteroids'];
    const rng = createSeededRng(config.eventYear);
    const picked = shuffle(names, rng).slice(0, eventDates.length);

    const claimsByTable = new Map();
    claims.forEach((claim) => {
      if (!claim.tableId || !Number.isFinite(claim.seatNumber)) return;
      if (!claimsByTable.has(claim.tableId)) {
        claimsByTable.set(claim.tableId, new Map());
      }
      claimsByTable.get(claim.tableId).set(claim.seatNumber, claim);
    });

    const tables = picked.map((name, index) => {
      const id = slugify(name);
      const date = new Date(eventDates[index]);
      const seatClaims = new Map(claimsByTable.get(id) || []);
      const hostKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      const hostSeats = hostSeatsByDate[hostKey] || [];
      hostSeats.forEach((host) => {
        if (!Number.isFinite(host.seatNumber)) return;
        if (seatClaims.has(host.seatNumber)) return;
        seatClaims.set(host.seatNumber, {
          id: `host-${id}-${host.seatNumber}`,
          tableId: id,
          seatNumber: host.seatNumber,
          name: host.name,
          note: 'Host seat',
          selfieUrl: '',
          createdAt: null
        });
      });
      const occupiedSeats = new Set(seatClaims.keys());
      const seatsLeft = Math.max(0, config.seatCount - occupiedSeats.size);
      return {
        id,
        name,
        date,
        displayDate: formatDate(date),
        seatsLeft,
        occupiedSeats,
        seatClaims
      };
    });

    return tables;
  }

  tables = generateTables();

  function buildTableVisual(table) {
    const visual = document.createElement('div');
    visual.className = 'table-visual';
    const topRow = document.createElement('div');
    topRow.className = 'table-row';
    const bottomRow = document.createElement('div');
    bottomRow.className = 'table-row';
    const seatsPerRow = Math.floor(config.seatCount / 2);

    for (let i = 0; i < config.seatCount; i += 1) {
      const seatNumber = i + 1;
      const seatCell = document.createElement('div');
      seatCell.className = 'table-seat-cell';
      const seat = document.createElement('span');
      seat.className = 'table-seat';
      const occupied = table.occupiedSeats.has(seatNumber);
      seat.classList.add(occupied ? 'is-occupied' : 'is-open');
      seat.setAttribute('aria-label', occupied ? 'occupied seat' : 'open seat');
      seatCell.appendChild(seat);
      if (i < seatsPerRow) {
        topRow.appendChild(seatCell);
      } else {
        bottomRow.appendChild(seatCell);
      }
    }

    visual.appendChild(topRow);
    visual.appendChild(bottomRow);
    return visual;
  }

  function renderTables() {
    if (!els.tableGrid) return;
    els.tableGrid.innerHTML = '';
    if (els.tableMessage) els.tableMessage.textContent = '';

    tables.forEach((table) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'table-card';
      button.dataset.tableId = table.id;
      button.setAttribute('aria-pressed', state.selectedTable && state.selectedTable.id === table.id ? 'true' : 'false');

      if (state.selectedTable && state.selectedTable.id === table.id) {
        button.classList.add('is-selected');
      }

      if (!state.readOnly && table.seatsLeft < requiredSeatCount()) {
        button.classList.add('is-disabled');
        button.disabled = true;
      }

      const title = document.createElement('h3');
      title.textContent = table.name;
      const visual = buildTableVisual(table);
      const metaRow = document.createElement('div');
      metaRow.className = 'table-meta-row';
      const date = document.createElement('span');
      date.className = 'table-meta';
      date.textContent = table.displayDate;
      const seats = document.createElement('span');
      seats.className = 'table-meta';
      seats.textContent = `seats left: ${table.seatsLeft}`;
      metaRow.appendChild(date);
      metaRow.appendChild(seats);

      button.appendChild(title);
      button.appendChild(visual);
      button.appendChild(metaRow);
      els.tableGrid.appendChild(button);
    });
  }

  function initClaimState() {
    try {
      const storedMulti = localStorage.getItem('iftarClaimIds');
      if (storedMulti) {
        const parsed = JSON.parse(storedMulti);
        if (Array.isArray(parsed)) {
          state.lastClaimIds = parsed
            .map((value) => String(value || '').trim())
            .filter((value) => value.length > 0);
          return;
        }
      }
      const storedSingle = localStorage.getItem('iftarClaimId');
      state.lastClaimIds = storedSingle ? [String(storedSingle)] : [];
    } catch (err) {
      state.lastClaimIds = [];
    }
  }

  async function loadClaims(options = {}) {
    if (!config.sheetyUrl) return [];
    try {
      const response = await fetch(config.sheetyUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('sheety');
      const data = await response.json();
      const rows = Array.isArray(data) ? data : (data.sheet1 || data.sheet || []);
      const referenceTables = generateTables();
      const tableIdByName = new Map(
        referenceTables.map((table) => [slugify(String(table.name || '')), table.id])
      );
      const tableIdByDate = new Map(
        referenceTables.map((table) => [String(table.displayDate || '').toLowerCase(), table.id])
      );
      const tableIdByDayMonth = new Map(
        referenceTables.map((table) => {
          const match = String(table.displayDate || '').match(/(\d{2}\/\d{2})/);
          return [match ? match[1] : '', table.id];
        })
      );
      state.claims = rows
        .map((row) => {
          const rawTableId = row.tableId || row.tableID || row.TableId || row.table_id || row.table;
          const rawTableName = row.tableName || row.table || row.TableName || '';
          const rawDate = String(row.date || row.Date || '').trim();
          const normalizedInputId = slugify(String(rawTableId || rawTableName || '').trim());
          const normalizedNameKey = slugify(String(rawTableName || '').trim());
          const dayMonthMatch = rawDate.match(/(\d{2}\/\d{2})/);
          const dayMonthKey = dayMonthMatch ? dayMonthMatch[1] : '';
          const normalizedTableId = normalizedInputId
            || tableIdByName.get(normalizedNameKey)
            || tableIdByDate.get(rawDate.toLowerCase())
            || tableIdByDayMonth.get(dayMonthKey)
            || '';
          const rawSelfieUrl = row.selfieUrl || row.selfieURL || row.selfie_url || row.photoUrl || row.photoURL || row.photo_url || '';
          return {
            id: row.id || row.ID || row.Id || row.claimId || row.claimID || row.claim_id || null,
            tableId: normalizedTableId,
            tableName: String(rawTableName || '').trim(),
            date: row.date,
            seatNumber: Number.parseInt(row.seatNumber || row.seat || row.seat_number, 10),
            name: row.name || row.Name || '',
            note: row.note || row.Note || '',
            selfieUrl: String(rawSelfieUrl || '').trim(),
            createdAt: row.createdAt || row.created_at || row.created,
            claimId: row.claimId || row.claimID || row.claim_id || ''
          };
        })
        .filter((row) => row.tableId && Number.isFinite(row.seatNumber));
      tables = generateTables(state.claims);
      syncSelectedTable();
      if (currentScreen === 'tables') renderTables();
      if (currentScreen === 'seats') renderSeats();
      return state.claims;
    } catch (err) {
      if (!options.silent) {
        const message = 'looks like the arcade machine hiccupped. try again in a moment.';
        if (els.tableMessage && currentScreen === 'tables') els.tableMessage.textContent = message;
        if (els.seatMessage && currentScreen === 'seats') els.seatMessage.textContent = message;
      }
      return state.claims;
    }
  }

  function syncSelectedTable() {
    if (!state.selectedTable) return;
    const updated = tables.find((table) => table.id === state.selectedTable.id);
    if (updated) state.selectedTable = updated;
  }

  function selectTable(tableId) {
    const selected = tables.find((table) => table.id === tableId);
    if (!selected) return;
    if (!state.readOnly && selected.seatsLeft < requiredSeatCount()) {
      if (els.tableMessage) {
        els.tableMessage.textContent = state.bringingPlusOne
          ? 'this table does not have 2 seats left for you and your +1.'
          : 'that table is full.';
      }
      return;
    }
    state.selectedTable = selected;
    state.selectedSeat = null;
    renderTables();
    showScreen('seats');
  }

  function renderSeats() {
    if (!els.seatMap) return;
    if (!state.selectedTable) {
      showScreen('tables');
      return;
    }

    els.seatMap.innerHTML = '';
    if (els.seatMessage) els.seatMessage.textContent = '';
    if (els.claimSeat) {
      els.claimSeat.hidden = state.readOnly;
      els.claimSeat.disabled = true;
    }

    const table = document.createElement('div');
    table.className = 'seat-table';
    els.seatMap.appendChild(table);

    for (let i = 0; i < config.seatCount; i += 1) {
      const seatNumber = i + 1;
      const position = seatPosition(i, config.seatCount);
      const seat = document.createElement('button');
      seat.type = 'button';
      seat.className = 'seat';
      seat.dataset.seatNumber = `${seatNumber}`;
      seat.style.setProperty('--seat-x', `${position.x}px`);
      seat.style.setProperty('--seat-y', `${position.y}px`);
      seat.title = seatTooltips[i % seatTooltips.length];

      const avatar = document.createElement('span');
      avatar.className = 'seat-avatar';
      const seatClaims = state.selectedTable.seatClaims || new Map();
      const claim = seatClaims.get(seatNumber);
      if (claim && claim.name) {
        seat.dataset.name = claim.name;
        seat.title = claim.name;
      }
      avatar.textContent = claim && claim.name ? claim.name.slice(0, 2).toUpperCase() : '';
      seat.appendChild(avatar);

      if (!state.demoMode && state.selectedTable.occupiedSeats.has(seatNumber)) {
        seat.classList.add('is-occupied');
        if (claim && claim.selfieUrl) {
          const photo = document.createElement('img');
          photo.className = 'seat-photo';
          photo.src = claim.selfieUrl;
          photo.alt = claim.name ? `${claim.name} selfie` : 'seat selfie';
          if (claim.name) {
            photo.title = claim.name;
          }
          seat.appendChild(photo);
          seat.classList.add('has-photo');
        }
      } else {
        seat.classList.add('is-open');
      }

      const label = document.createElement('span');
      label.className = 'seat-label';
      label.textContent = `#${seatNumber}`;
      seat.appendChild(label);

      els.seatMap.appendChild(seat);
    }
  }

  function clearPendingSeatPreview() {
    if (!els.seatMap) return;
    els.seatMap.querySelectorAll('.seat-photo[data-preview="true"]').forEach((photo) => {
      const seat = photo.closest('.seat');
      photo.remove();
      if (seat) seat.classList.remove('has-photo');
    });
  }

  function pickSecondSeat(table, selectedSeat) {
    for (let seatNumber = 1; seatNumber <= config.seatCount; seatNumber += 1) {
      if (seatNumber === selectedSeat) continue;
      if (!table.occupiedSeats.has(seatNumber)) return seatNumber;
    }
    return null;
  }

  function selectSeat(seatNumber) {
    if (!state.selectedTable) return;
    if (!els.seatMap) return;
    const seat = els.seatMap.querySelector(`[data-seat-number="${seatNumber}"]`);
    if (!seat || seat.classList.contains('is-occupied')) {
      if (els.seatMessage) {
        const name = seat && seat.dataset.name ? seat.dataset.name : 'someone';
        els.seatMessage.textContent = `this seat is taken by ${name}`;
      }
      playSound(audio.buzzer);
      return;
    }

    if (state.selectedSeat === seatNumber) {
      state.selectedSeat = null;
      state.selectedPlusOneSeat = null;
      clearPendingSeatPreview();
      els.seatMap.querySelectorAll('.seat').forEach((seatEl) => {
        seatEl.classList.remove('is-selected');
      });
      if (els.seatMessage) els.seatMessage.textContent = '';
      if (els.claimSeat) els.claimSeat.disabled = true;
      return;
    }

    state.selectedSeat = seatNumber;
    state.selectedPlusOneSeat = null;
    if (els.seatMessage) els.seatMessage.textContent = '';

    clearPendingSeatPreview();
    let plusOnePreviewSeatEl = null;
    if (state.bringingPlusOne) {
      const plusOneSeatNumber = pickSecondSeat(state.selectedTable, seatNumber);
      if (Number.isFinite(plusOneSeatNumber)) {
        state.selectedPlusOneSeat = plusOneSeatNumber;
        plusOnePreviewSeatEl = els.seatMap.querySelector(`[data-seat-number="${plusOneSeatNumber}"]`);
      }
    }

    els.seatMap.querySelectorAll('.seat').forEach((seatEl) => {
      const isPrimary = seatEl === seat;
      const isPlusOne = plusOnePreviewSeatEl && seatEl === plusOnePreviewSeatEl;
      seatEl.classList.toggle('is-selected', Boolean(isPrimary || isPlusOne));
    });

    if (state.playerSelfie) {
      const photo = document.createElement('img');
      photo.className = 'seat-photo';
      photo.dataset.preview = 'true';
      photo.src = state.playerSelfie;
      photo.alt = 'your selfie';
      seat.appendChild(photo);
      seat.classList.add('has-photo');
    }

    if (plusOnePreviewSeatEl && state.plusOneSelfie) {
      const plusOnePhoto = document.createElement('img');
      plusOnePhoto.className = 'seat-photo';
      plusOnePhoto.dataset.preview = 'true';
      plusOnePhoto.src = state.plusOneSelfie;
      plusOnePhoto.alt = '+1 selfie';
      plusOnePreviewSeatEl.appendChild(plusOnePhoto);
      plusOnePreviewSeatEl.classList.add('has-photo');
    }

    if (els.claimSeat) els.claimSeat.disabled = false;
  }

  function goToNoteScreen() {
    if (state.readOnly) {
      if (els.seatMessage) {
        els.seatMessage.textContent = 'view only mode: you can browse seats but not claim.';
      }
      return;
    }
    if (!state.selectedTable || !state.selectedSeat) {
      if (els.seatMessage) {
        els.seatMessage.textContent = 'pick a seat first.';
      }
      return;
    }
    showScreen('note');
    if (els.noteMessage) els.noteMessage.textContent = '';
    if (els.noteInput) els.noteInput.focus();
  }

  function setClaimMessage(message) {
    if (els.seatMessage) els.seatMessage.textContent = message;
    if (els.noteMessage) els.noteMessage.textContent = message;
  }

  function launchConfetti() {
    if (!els.confetti) return;
    const colors = ['#eded50', '#54a7c2', '#2fbf63', '#d94a4a', '#d678c6', '#ffffff'];
    const pieces = window.matchMedia('(max-width: 720px)').matches ? 64 : 100;
    els.confetti.innerHTML = '';
    for (let i = 0; i < pieces; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'arcade-confetti__piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--delay', `${Math.random() * 0.35}s`);
      piece.style.setProperty('--duration', `${0.95 + Math.random() * 0.9}s`);
      piece.style.setProperty('--drift', `${(Math.random() * 2 - 1) * 120}px`);
      piece.style.setProperty('--rotate', `${Math.random() * 540 - 270}deg`);
      piece.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
      els.confetti.appendChild(piece);
    }
  }

  async function playClaimCelebration() {
    if (!els.celebration || !els.confetti) return;
    document.body.classList.add('is-celebrating');
    root.classList.add('is-celebrating-spin');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1600);
    });
    root.classList.remove('is-celebrating-spin');

    launchConfetti();
    els.celebration.hidden = false;
    await new Promise((resolve) => {
      window.setTimeout(resolve, 2000);
    });
    document.body.classList.remove('is-celebrating');
    els.celebration.hidden = true;
    els.confetti.innerHTML = '';
  }

  async function claimSeat() {
    if (state.readOnly) return;
    if (!state.selectedTable || !state.selectedSeat) return;
    if (state.bringingPlusOne && (!state.plusOneName || !state.plusOneSelfie)) return;
    state.selectedPlusOneSeat = null;

    if (els.claimSeat) els.claimSeat.disabled = true;
    setClaimMessage('locking in your seat...');

    try {
      if (!state.demoMode) {
        await loadClaims({ silent: true });
        syncSelectedTable();
        if (state.selectedTable && state.selectedTable.occupiedSeats.has(state.selectedSeat)) {
          if (els.seatMessage) {
            setClaimMessage('someone just took that seat. pick another one.');
          }
          if (els.claimSeat) els.claimSeat.disabled = true;
          state.selectedSeat = null;
          renderSeats();
          return;
        }
        if (state.bringingPlusOne) {
          const plusOneSeat = pickSecondSeat(state.selectedTable, state.selectedSeat);
          if (!plusOneSeat) {
            setClaimMessage('not enough seats left for your +1. choose another table.');
            if (els.claimSeat) els.claimSeat.disabled = false;
            return;
          }
          state.selectedPlusOneSeat = plusOneSeat;
        }
      }
      if (state.demoMode && state.bringingPlusOne) {
        const plusOneSeat = pickSecondSeat(state.selectedTable, state.selectedSeat);
        if (!plusOneSeat) {
          setClaimMessage('not enough seats left for your +1. choose another table.');
          if (els.claimSeat) els.claimSeat.disabled = false;
          return;
        }
        state.selectedPlusOneSeat = plusOneSeat;
      }

      if (!state.demoMode) {
        const uploadUrl = await uploadSelfie(state.playerSelfie);
        const createdAt = new Date().toISOString();
        const claimId = createClaimId();
        const payload = {
          claimId,
          tableId: state.selectedTable.id,
          tableName: state.selectedTable.name,
          date: state.selectedTable.displayDate,
          seatNumber: state.selectedSeat,
          name: state.playerName,
          note: state.playerNote,
          selfieUrl: uploadUrl,
          createdAt
        };
        const saved = await postClaim(payload);
        const savedRow = saved && (saved.sheet1 || saved.sheet);
        const savedIds = [];
        if (savedRow && savedRow.id) {
          payload.id = savedRow.id;
          savedIds.push(String(savedRow.id));
        } else {
          savedIds.push(payload.claimId || payload.createdAt);
        }
        state.claims.push(payload);

        if (state.bringingPlusOne && Number.isFinite(state.selectedPlusOneSeat)) {
          const plusOneUploadUrl = await uploadSelfie(state.plusOneSelfie);
          const plusOneCreatedAt = new Date().toISOString();
          const plusOneClaimId = createClaimId();
          const plusOnePayload = {
            claimId: plusOneClaimId,
            tableId: state.selectedTable.id,
            tableName: state.selectedTable.name,
            date: state.selectedTable.displayDate,
            seatNumber: state.selectedPlusOneSeat,
            name: state.plusOneName,
            note: state.playerNote,
            selfieUrl: plusOneUploadUrl,
            createdAt: plusOneCreatedAt
          };
          const plusOneSaved = await postClaim(plusOnePayload);
          const plusOneSavedRow = plusOneSaved && (plusOneSaved.sheet1 || plusOneSaved.sheet);
          if (plusOneSavedRow && plusOneSavedRow.id) {
            plusOnePayload.id = plusOneSavedRow.id;
            savedIds.push(String(plusOneSavedRow.id));
          } else {
            savedIds.push(plusOnePayload.claimId || plusOnePayload.createdAt);
          }
          state.claims.push(plusOnePayload);
        }

        state.lastClaimIds = savedIds;
        try {
          if (state.lastClaimIds.length > 0) {
            localStorage.setItem('iftarClaimIds', JSON.stringify(state.lastClaimIds));
            localStorage.setItem('iftarClaimId', String(state.lastClaimIds[0]));
          }
        } catch (err) {
          // ignore
        }
        tables = generateTables(state.claims);
        syncSelectedTable();
        const tableSignups = state.selectedTable
          ? Array.from(state.selectedTable.seatClaims.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([, claim]) => String(claim.name || '').trim())
            .filter(Boolean)
          : [];
        notifySignup({
          tableName: state.selectedTable.name,
          date: state.selectedTable.displayDate,
          primaryName: state.playerName,
          primarySeat: state.selectedSeat,
          plusOneName: state.bringingPlusOne ? state.plusOneName : '',
          plusOneSeat: state.bringingPlusOne ? state.selectedPlusOneSeat : null,
          seatsLeft: state.selectedTable ? state.selectedTable.seatsLeft : null,
          tableSignups
        });
      }

      playSound(audio.fanfare);
      await playClaimCelebration();
      showScreen('confirm');
    } catch (err) {
      setClaimMessage('looks like the arcade machine hiccupped. try again in a moment.');
      if (els.claimSeat) els.claimSeat.disabled = false;
    }
  }

  function reserveSeat() {
    if (state.demoMode || !config.simulateNetwork) {
      return Promise.resolve({ ok: true });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const roll = Math.random();
        if (roll < config.networkFailRate) {
          resolve({ ok: false, reason: 'network' });
        } else if (roll < config.networkFailRate + config.conflictRate) {
          resolve({ ok: false, reason: 'conflict' });
        } else {
          resolve({ ok: true });
        }
      }, 700);
    });
  }

  async function uploadSelfie(selfieData) {
    if (!selfieData) throw new Error('no selfie');
    if (!config.cloudinaryName || !config.cloudinaryPreset) throw new Error('cloudinary');
    const formData = new FormData();
    formData.append('file', selfieData);
    formData.append('upload_preset', config.cloudinaryPreset);
    if (config.cloudinaryFolder) {
      formData.append('folder', config.cloudinaryFolder);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinaryName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('cloudinary');
    const data = await response.json();
    if (!data.secure_url) throw new Error('cloudinary');
    return data.secure_url;
  }

  async function postClaim(payload) {
    if (!config.sheetyUrl) throw new Error('sheety');
    const body = isSheetDbApi
      ? JSON.stringify({ data: [payload] })
      : JSON.stringify({ sheet1: payload });
    const response = await fetch(config.sheetyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    if (!response.ok) throw new Error('sheety');
    return response.json();
  }

  async function notifySignup(details) {
    if (!config.notifySignupUrl) return;
    try {
      await fetch(config.notifySignupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
    } catch (err) {
      // Keep signup flow non-blocking when email notifications fail.
    }
  }

  async function deleteClaim(id) {
    if (!config.sheetyUrl || !id) return;
    const endpoint = isSheetDbApi
      ? `${config.sheetyUrl}/claimId/${encodeURIComponent(String(id))}`
      : `${config.sheetyUrl}/${id}`;
    const response = await fetch(endpoint, { method: 'DELETE' });
    if (!response.ok) throw new Error('sheety');
    return response.json();
  }

  async function handleBackToTables(options = {}) {
    const { removeClaim = false } = options;
    let deleteFailed = false;
    if (removeClaim && !state.demoMode && state.lastClaimIds.length > 0) {
      setClaimMessage('removing your seat...');
      for (const claimId of state.lastClaimIds) {
        try {
          await deleteClaim(claimId);
          state.claims = state.claims.filter((claim) => claim.id !== claimId);
        } catch (err) {
          deleteFailed = true;
        }
      }
      state.lastClaimIds = [];
      try {
        localStorage.removeItem('iftarClaimIds');
        localStorage.removeItem('iftarClaimId');
      } catch (err) {
        // ignore
      }
    }

    state.selectedSeat = null;
    state.selectedPlusOneSeat = null;
    state.selectedTable = null;
    await loadClaims({ silent: true });
    tables = generateTables(state.claims);
    showScreen('tables');
    renderTables();
    if (deleteFailed && els.tableMessage) {
      els.tableMessage.textContent = 'could not remove the previous seat. please try again.';
    }
  }

  async function handleBackFromConfirm() {
    const ok = window.confirm('By going back, your claimed seats are removed and you will have to select a new table again');
    if (!ok) return;
    await handleBackToTables({ removeClaim: true });
  }

  function renderConfirmation() {
    if (!els.receipt || !state.selectedTable) return;
    els.receipt.innerHTML = '';

    if (state.demoMode) {
      const demoLine = document.createElement('div');
      demoLine.textContent = 'still want to reall really participate in an iftar? send pherkan a dm.';
      els.receipt.appendChild(demoLine);
      if (els.demoMessage) {
        els.demoMessage.hidden = true;
      }
      return;
    }

    const primaryName = state.playerName || 'guest';
    const plusOneName = state.plusOneName || 'guest';
    const primarySeat = Number.isFinite(state.selectedSeat) ? String(state.selectedSeat) : '-';
    const plusOneSeat = Number.isFinite(state.selectedPlusOneSeat) ? String(state.selectedPlusOneSeat) : '-';

    const lines = [
      ['name', state.bringingPlusOne ? `${primaryName} + ${plusOneName}` : primaryName],
      ['table', state.selectedTable.name],
      ['date', state.selectedTable.displayDate],
      ['seat', state.bringingPlusOne ? `${primarySeat} + ${plusOneSeat}` : `#${primarySeat}`],
      ['address', 'herengracht 50B, 2511EJ, Den Haag']
    ];
    if (state.playerNote) lines.push(['note', state.playerNote]);

    lines.forEach(([label, value]) => {
      const row = document.createElement('div');
      row.textContent = `${label}: ${value}`;
      els.receipt.appendChild(row);
    });

    if (els.demoMessage) {
      els.demoMessage.hidden = true;
    }
  }

  function addToCalendar() {
    if (!state.selectedTable) return;
    const date = state.selectedTable.date;
    const start = formatDateICS(date);
    const end = formatDateICS(addDays(date, 1));
    const uid = `iftar-${Date.now()}@pherkan.com`;
    const summary = "Iftar at Ferkan & Suzan's";
    const location = 'herengracht 50B, 2511EJ, Den Haag';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pherkan//Iftar Arcade//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatDateICS(new Date())}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${summary}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iftar-arcade.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function resetGame() {
    state.started = false;
    state.demoMode = false;
    state.quizScore = 0;
    state.quizIndex = 0;
    state.playerName = '';
    state.playerSelfie = null;
    state.bringingPlusOne = false;
    state.plusOneName = '';
    state.plusOneSelfie = null;
    state.selectedTable = null;
    state.selectedSeat = null;
    state.selectedPlusOneSeat = null;
    state.playerNote = '';
    state.readOnly = false;

    if (els.codeInput) els.codeInput.value = '';
    if (els.codeFeedback) els.codeFeedback.textContent = '';
    if (els.selfieMessage) els.selfieMessage.textContent = '';
    if (els.nameInput) els.nameInput.value = '';
    if (els.plusOneNameInput) els.plusOneNameInput.value = '';
    if (els.noteInput) els.noteInput.value = '';
    if (els.selfiePreview) els.selfiePreview.hidden = true;
    if (els.selfieVideo) els.selfieVideo.hidden = false;
    if (els.retakePhoto) els.retakePhoto.disabled = true;
    if (els.takePhoto) els.takePhoto.disabled = false;
    if (els.selfieContinue) els.selfieContinue.disabled = true;
    if (els.plusOneSelfiePreview) els.plusOneSelfiePreview.hidden = true;
    if (els.plusOneSelfieVideo) els.plusOneSelfieVideo.hidden = false;
    if (els.plusOneRetakePhoto) els.plusOneRetakePhoto.disabled = true;
    if (els.plusOneTakePhoto) els.plusOneTakePhoto.disabled = false;
    if (els.plusOneContinue) els.plusOneContinue.disabled = true;

    stopCamera();
    stopAllAudio();
    startAmbient();
    updateSoundToggle();
    showScreen('start');
  }

  function toggleSound() {
    state.audioEnabled = !state.audioEnabled;
    if (!state.audioEnabled) {
      stopAllAudio();
      if (els.audioHint) els.audioHint.hidden = true;
    } else {
      unlockAudio();
      if (state.started) {
        startBgm();
      } else {
        startAmbient();
      }
    }
    updateSoundToggle();
  }

  function formatDate(date) {
    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName} ${day}/${month}`;
  }

  function formatDateICS(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function createClaimId() {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `claim-${Date.now()}-${randomPart}`;
  }

  function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function shuffle(array, rng = Math.random) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function createSeededRng(seed) {
    let t = seed % 2147483647;
    if (t <= 0) t += 2147483646;
    return () => {
      t = (t * 16807) % 2147483647;
      return (t - 1) / 2147483646;
    };
  }

  function seatPosition(index, total) {
    const seatsPerRow = Math.floor(total / 2);
    const spacing = 60;
    const startX = -((seatsPerRow - 1) * spacing) / 2;
    const row = index < seatsPerRow ? 0 : 1;
    const col = index % seatsPerRow;
    const x = Math.round(startX + col * spacing);
    const y = row === 0 ? -90 : 90;
    return { x, y };
  }

  function handlePrimaryAction() {
    const active = root.querySelector(`[data-screen="${currentScreen}"]`);
    if (!active) return;
    const primary = active.querySelector('[data-primary]:not([disabled])');
    if (primary) primary.click();
  }

  function unlockAudio() {
    if (state.audioUnlocked || !state.audioEnabled) return;
    playSound(state.started ? audio.bgm : audio.ambient, { reset: false });
  }

  function getEventTarget(event) {
    if (!event || !event.target) return null;
    if (event.target.nodeType === 1) return event.target;
    return event.target.parentElement;
  }

  function closestMatch(target, selector) {
    if (!target) return null;
    if (target.closest) return target.closest(selector);
    let el = target;
    while (el && el !== root) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentElement;
    }
    if (el && el.matches && el.matches(selector)) return el;
    return null;
  }

  root.addEventListener('click', (event) => {
    const actionEl = closestMatch(getEventTarget(event), '[data-action]');
    if (!actionEl) return;
    const { action } = actionEl.dataset;

    switch (action) {
      case 'press-start':
        handlePressStart();
        break;
      case 'back-to-start':
        showScreen('start');
        break;
      case 'submit-code':
        handleSubmitCode();
        break;
      case 'demo-mode':
        startDemoMode();
        break;
      case 'to-quiz':
        state.readOnly = false;
        showScreen('quiz');
        break;
      case 'view-tables-readonly':
        state.readOnly = true;
        state.bringingPlusOne = false;
        state.plusOneName = '';
        state.plusOneSelfie = null;
        state.selectedSeat = null;
        state.selectedPlusOneSeat = null;
        showScreen('tables');
        break;
      case 'to-selfie':
        showScreen('selfie');
        break;
      case 'take-photo':
        takePhoto('primary');
        break;
      case 'retake-photo':
        retakePhoto('primary');
        break;
      case 'to-plus-one-decision':
        if (!state.playerSelfie) {
          const cameraMissing = !activeStream || activeCameraMode !== 'primary';
          if (cameraMissing) {
            showCameraError('primary', 'please allow camera access first.');
            if (els.selfieMessage) {
              els.selfieMessage.textContent = 'please allow camera access first.';
            }
            return;
          }
          if (els.selfieMessage) {
            els.selfieMessage.textContent = 'first take a photo, no photo no continue!!';
          }
          return;
        }
        if (els.selfieMessage) els.selfieMessage.textContent = '';
        showScreen('plus-one-decision');
        break;
      case 'to-plus-one-selfie':
        state.bringingPlusOne = true;
        showScreen('plus-one-selfie');
        break;
      case 'skip-plus-one':
        state.bringingPlusOne = false;
        state.plusOneName = '';
        state.plusOneSelfie = null;
        state.selectedPlusOneSeat = null;
        if (els.plusOneNameInput) els.plusOneNameInput.value = '';
        if (els.plusOneSelfiePreview) els.plusOneSelfiePreview.hidden = true;
        if (els.plusOneSelfieVideo) els.plusOneSelfieVideo.hidden = false;
        if (els.plusOneRetakePhoto) els.plusOneRetakePhoto.disabled = true;
        if (els.plusOneTakePhoto) els.plusOneTakePhoto.disabled = false;
        if (els.plusOneContinue) els.plusOneContinue.disabled = true;
        showScreen('tables');
        break;
      case 'take-plus-one-photo':
        takePhoto('plusOne');
        break;
      case 'retry-camera-access':
        stopCamera();
        startCamera('primary');
        break;
      case 'retry-plus-one-camera-access':
        stopCamera();
        startCamera('plusOne');
        break;
      case 'retake-plus-one-photo':
        retakePhoto('plusOne');
        break;
      case 'back-to-plus-one-decision':
        if (state.readOnly) {
          showScreen('intro');
        } else {
          showScreen('plus-one-decision');
        }
        break;
      case 'to-tables':
        showScreen('tables');
        break;
      case 'back-to-selfie':
        showScreen('selfie');
        break;
      case 'claim-seat':
        goToNoteScreen();
        break;
      case 'submit-note':
        claimSeat();
        break;
      case 'back-to-tables':
        handleBackToTables();
        break;
      case 'back-from-confirm':
        handleBackFromConfirm();
        break;
      case 'back-to-seats':
        showScreen('seats');
        break;
      case 'add-calendar':
        addToCalendar();
        break;
      case 'play-again':
        resetGame();
        break;
      default:
        break;
    }
  });

  root.addEventListener('click', (event) => {
    const tableCard = closestMatch(getEventTarget(event), '[data-table-id]');
    if (tableCard) {
      selectTable(tableCard.dataset.tableId);
    }
  });

  if (els.quizOptions) {
    els.quizOptions.addEventListener('click', (event) => {
      const option = event.target.closest('[data-option-index]');
      if (!option) return;
      const index = Number.parseInt(option.dataset.optionIndex, 10);
      if (Number.isNaN(index)) return;
      handleQuizAnswer(index);
    });
  }

  if (els.seatMap) {
    els.seatMap.addEventListener('click', (event) => {
      const seat = closestMatch(getEventTarget(event), '[data-seat-number]');
      if (!seat) return;
      const number = Number.parseInt(seat.dataset.seatNumber, 10);
      if (Number.isNaN(number)) return;
      selectSeat(number);
    });
  }

  if (els.soundToggle) {
    els.soundToggle.addEventListener('click', toggleSound);
  }

  if (els.codeInput) {
    els.codeInput.addEventListener('input', sanitizeCodeInput);
  }

  if (els.nameInput) {
    els.nameInput.addEventListener('input', handleNameInput);
  }

  if (els.plusOneNameInput) {
    els.plusOneNameInput.addEventListener('input', handlePlusOneNameInput);
  }

  if (els.noteInput) {
    els.noteInput.addEventListener('input', () => {
      state.playerNote = els.noteInput.value.trim();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      if (event.target && event.target.tagName === 'TEXTAREA') return;
      handlePrimaryAction();
    }
  });

  document.addEventListener(
    'pointerdown',
    () => {
      unlockAudio();
    },
    { once: true }
  );

  window.addEventListener('load', () => {
    updateSoundToggle();
    startAmbient();
    initClaimState();
    loadClaims({ silent: true });
  });
})();
