(() => {
  const config = window.RSVP_CONFIG || {};
  const form = document.getElementById('rsvpForm');
  const steps = [...document.querySelectorAll('.wizard-step')];
  const totalInput = document.getElementById('totalPessoasInput');
  const criancasInput = document.getElementById('criancasInput');
  const bebemCervejaInput = document.getElementById('bebemCervejaInput');
  const consumoInput = document.getElementById('consumoCervejaInput');
  const nome = document.getElementById('nome');

  const totalError = document.getElementById('totalError');
  const criancasError = document.getElementById('criancasError');
  const beerError = document.getElementById('beerError');
  const nomeError = document.getElementById('nomeError');
  const statusMessage = document.getElementById('statusMessage');

  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const progressFill = document.getElementById('wizardProgressFill');
  const stepLabel = document.getElementById('wizardStepLabel');
  const stepName = document.getElementById('wizardStepName');

  const rsvpCard = document.getElementById('confirmar');
  const successCard = document.getElementById('successCard');
  const successText = document.getElementById('successText');
  const successRecap = document.getElementById('successRecap');
  const newResponseBtn = document.getElementById('newResponseBtn');

  const stepNames = ['Total de pessoas', 'Crianças', 'Quem bebe cerveja', 'Quanto bebe', 'Resumo'];
  let currentStep = 0;

  const BEER_CAN_LITERS = 0.35;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.parseInt(value, 10) || 0));
  const plural = (value, one, many) => `${value} ${value === 1 ? one : many}`;
  const formatLiters = value => `${value.toFixed(2).replace('.', ',')} L`;

  function clearErrors() {
    totalError.textContent = '';
    criancasError.textContent = '';
    beerError.textContent = '';
    nomeError.textContent = '';
    statusMessage.textContent = '';
  }

  function getState() {
    const total = clamp(totalInput.value, 1, 30);
    const criancas = clamp(criancasInput.value, 0, total);
    const adultos = Math.max(0, total - criancas);
    const bebemCerveja = clamp(bebemCervejaInput.value, 0, adultos);
    const consumoLatinhas = bebemCerveja > 0 ? clamp(consumoInput.value, 1, 8) : 0;
    const estimativaLatinhas = bebemCerveja * consumoLatinhas;
    const estimativaLitros = estimativaLatinhas * BEER_CAN_LITERS;
    return { total, criancas, adultos, bebemCerveja, consumoLatinhas, estimativaLatinhas, estimativaLitros };
  }

  function syncState() {
    const state = getState();

    totalInput.value = state.total;
    criancasInput.max = state.total;
    criancasInput.value = state.criancas;
    bebemCervejaInput.max = state.adultos;
    bebemCervejaInput.value = state.bebemCerveja;

    document.getElementById('kidsTotalReference').textContent = plural(state.total, 'pessoa', 'pessoas');
    document.getElementById('adultosPreview').textContent = state.adultos;
    document.getElementById('beerAdultsReference').textContent = plural(state.adultos, 'adulto', 'adultos');

    const sliderCard = document.getElementById('beerSliderCard');
    const noBeerMessage = document.getElementById('noBeerMessage');
    sliderCard.hidden = state.bebemCerveja === 0;
    noBeerMessage.hidden = state.bebemCerveja !== 0;

    const cans = state.bebemCerveja > 0 ? state.consumoLatinhas : 0;
    document.getElementById('consumoCervejaValue').textContent = cans || '0';
    document.getElementById('beerVisual').textContent = cans > 0 ? '🍺'.repeat(cans) : '🥤';
    document.getElementById('beerLitersPreview').textContent = state.bebemCerveja > 0
      ? `${plural(state.estimativaLatinhas, 'latinha', 'latinhas')} • ${formatLiters(state.estimativaLitros)}`
      : '0 latinhas';

    document.getElementById('summaryTotal').textContent = plural(state.total, 'pessoa', 'pessoas');
    document.getElementById('summaryKids').textContent = state.criancas;
    document.getElementById('summaryAdults').textContent = state.adultos;
    document.getElementById('summaryBeerPeople').textContent = state.bebemCerveja;
    document.getElementById('summaryBeerConsumption').textContent = state.bebemCerveja > 0
      ? `${state.consumoLatinhas} ${state.consumoLatinhas === 1 ? 'latinha' : 'latinhas'} por pessoa • ${state.estimativaLatinhas} no grupo (${formatLiters(state.estimativaLitros)})`
      : 'Não se aplica';

    return state;
  }

  function validateStep(stepIndex) {
    clearErrors();
    const state = syncState();

    if (stepIndex === 0 && (state.total < 1 || state.total > 30)) {
      totalError.textContent = 'Informe entre 1 e 30 pessoas.';
      return false;
    }

    if (stepIndex === 1 && state.criancas > state.total) {
      criancasError.textContent = 'A quantidade de crianças não pode ser maior que o total de pessoas.';
      return false;
    }

    if (stepIndex === 2 && state.bebemCerveja > state.adultos) {
      beerError.textContent = 'A quantidade de pessoas que bebem cerveja não pode ser maior que a quantidade de adultos.';
      return false;
    }

    if (stepIndex === 4) {
      const cleanName = nome.value.trim().replace(/\s+/g, ' ');
      if (cleanName.length < 2) {
        nomeError.textContent = 'Informe seu nome para concluir a confirmação.';
        nome.focus();
        return false;
      }
    }

    return true;
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, i) => {
      const active = i === currentStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });

    const progress = ((currentStep + 1) / steps.length) * 100;
    progressFill.style.width = `${progress}%`;
    stepLabel.textContent = `Passo ${currentStep + 1} de ${steps.length}`;
    stepName.textContent = stepNames[currentStep];

    backBtn.hidden = currentStep === 0;
    nextBtn.hidden = currentStep === steps.length - 1;
    submitBtn.hidden = currentStep !== steps.length - 1;

    syncState();
    clearErrors();

    const focusTarget = currentStep === 0 ? totalInput
      : currentStep === 1 ? criancasInput
      : currentStep === 2 ? bebemCervejaInput
      : currentStep === 3 ? consumoInput
      : nome;
    setTimeout(() => focusTarget?.focus({ preventScroll: true }), 120);
  }

  document.querySelectorAll('.wizard-stepper').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      const step = Number(button.dataset.step || 0);
      const min = Number(input.min || 0);
      const max = Number(input.max || 30);
      input.value = clamp(Number(input.value) + step, min, max);
      syncState();
      clearErrors();
    });
  });

  [totalInput, criancasInput, bebemCervejaInput].forEach(input => {
    input.addEventListener('input', () => {
      syncState();
      clearErrors();
    });
    input.addEventListener('change', syncState);
  });

  consumoInput.addEventListener('input', syncState);
  nome.addEventListener('input', () => { nomeError.textContent = ''; statusMessage.textContent = ''; });

  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    showStep(currentStep + 1);
  });

  backBtn.addEventListener('click', () => showStep(currentStep - 1));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateStep(4)) return;
    if (document.getElementById('website').value) return;

    const endpoint = String(config.endpoint || '');
    if (!endpoint.startsWith('https://script.google.com/')) {
      statusMessage.textContent = 'A lista ainda não está conectada à planilha.';
      return;
    }

    const state = syncState();
    const cleanName = nome.value.trim().replace(/\s+/g, ' ');
    const payload = {
      nome: cleanName,
      totalPessoas: state.total,
      criancas: state.criancas,
      adultos: state.adultos,
      bebemCerveja: state.bebemCerveja,
      consumoCervejaLatinhas: state.consumoLatinhas,
      estimativaCervejaLatinhas: state.estimativaLatinhas,
      estimativaCervejaLitros: Number(state.estimativaLitros.toFixed(2)),

      // Compatibilidade temporária com versões antigas do Apps Script.
      acompanhantes: Math.max(0, state.total - 1),
      bebemChopp: state.bebemCerveja,
      consumoCervejaCopos: state.consumoLatinhas,

      origem: window.location.href,
      enviadoEm: new Date().toISOString(),
      website: ''
    };

    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';
    statusMessage.textContent = '';

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      successText.textContent = `${payload.nome}, recebemos a confirmação do seu grupo.`;
      const recap = [
        `👨‍👩‍👧‍👦 ${plural(payload.totalPessoas, 'pessoa', 'pessoas')}`,
        `🧒 ${plural(payload.criancas, 'criança', 'crianças')}`,
        `🧑 ${plural(payload.adultos, 'adulto', 'adultos')}`,
        `🍺 ${plural(payload.bebemCerveja, 'pessoa bebe', 'pessoas bebem')}`
      ];
      if (payload.bebemCerveja > 0) {
        recap.push(`🍻 ~${plural(payload.estimativaCervejaLatinhas, 'latinha de 350 ml', 'latinhas de 350 ml')} (${formatLiters(payload.estimativaCervejaLitros)})`);
      }
      successRecap.innerHTML = recap.map(item => `<span>${item}</span>`).join('');

      rsvpCard.hidden = true;
      successCard.hidden = false;
      successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      launchConfetti(150);
    } catch (error) {
      console.error(error);
      statusMessage.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.';
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = 'Confirmar e enviar';
    }
  });

  newResponseBtn.addEventListener('click', () => {
    form.reset();
    totalInput.value = 1;
    criancasInput.value = 0;
    bebemCervejaInput.value = 0;
    consumoInput.value = 3;
    nome.value = '';
    successCard.hidden = true;
    rsvpCard.hidden = false;
    showStep(0);
    rsvpCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  syncState();
  showStep(0);

  const eventTime = new Date(config.eventDate || '2026-10-24T15:00:00-03:00').getTime();
  const countdownIds = ['days', 'hours', 'minutes', 'seconds'];

  function updateCountdown() {
    const distance = eventTime - Date.now();
    if (distance <= 0) {
      countdownIds.forEach(id => document.getElementById(id).textContent = '00');
      return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let pieces = [];
  let animationFrame = null;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launchConfetti(amount = 90) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const palette = ['#0b4aa0', '#68a9ef', '#e9a81b', '#ffd875', '#ffffff'];
    const centerX = innerWidth / 2;
    const centerY = Math.min(innerHeight * .42, 380);

    for (let i = 0; i < amount; i++) {
      pieces.push({
        x: centerX + (Math.random() - .5) * 150,
        y: centerY + (Math.random() - .5) * 35,
        vx: (Math.random() - .5) * 10,
        vy: -Math.random() * 9 - 4,
        gravity: .16 + Math.random() * .08,
        drag: .991,
        size: 5 + Math.random() * 7,
        rotate: Math.random() * Math.PI,
        spin: (Math.random() - .5) * .22,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 0,
        maxLife: 150 + Math.random() * 70
      });
    }
    if (!animationFrame) animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pieces = pieces.filter(p => p.life < p.maxLife && p.y < innerHeight + 30);
    pieces.forEach(p => {
      p.life++;
      p.vx *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotate += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotate);
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * .66);
      ctx.restore();
    });

    if (pieces.length) animationFrame = requestAnimationFrame(animateConfetti);
    else {
      animationFrame = null;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  setTimeout(() => launchConfetti(70), 450);
})();
