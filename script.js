(() => {
  const config = window.RSVP_CONFIG || {};
  const form = document.getElementById('rsvpForm');
  const nome = document.getElementById('nome');
  const acompanhantes = document.getElementById('acompanhantes');
  const criancas = document.getElementById('criancas');
  const homensAdultos = document.getElementById('homensAdultos');
  const bebemChopp = document.getElementById('bebemChopp');
  const nomeError = document.getElementById('nomeError');
  const criancasError = document.getElementById('criancasError');
  const homensError = document.getElementById('homensError');
  const choppError = document.getElementById('choppError');
  const adultosResumo = document.getElementById('adultosResumo');
  const totalPessoas = document.getElementById('totalPessoas');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const statusMessage = document.getElementById('statusMessage');
  const rsvpCard = document.getElementById('confirmar');
  const successCard = document.getElementById('successCard');
  const successText = document.getElementById('successText');
  const newResponseBtn = document.getElementById('newResponseBtn');

  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.parseInt(value, 10) || 0));

  function clearErrors() {
    nomeError.textContent = '';
    criancasError.textContent = '';
    homensError.textContent = '';
    choppError.textContent = '';
    statusMessage.textContent = '';
  }

  function normalizeCounters() {
    const a = clamp(acompanhantes.value, 0, 20);
    let c = clamp(criancas.value, 0, 20);
    if (c > a) c = a;

    const total = a + 1;
    const adultos = total - c;

    let h = clamp(homensAdultos.value, 0, adultos);
    let ch = clamp(bebemChopp.value, 0, adultos);

    acompanhantes.value = a;
    criancas.value = c;
    criancas.max = a;
    homensAdultos.max = adultos;
    bebemChopp.max = adultos;
    homensAdultos.value = h;
    bebemChopp.value = ch;

    const mulheres = adultos - h;
    adultosResumo.textContent = `Adultos confirmados: ${adultos}. Mulheres: ${mulheres}.`;
    totalPessoas.textContent = `${total} ${total === 1 ? 'pessoa' : 'pessoas'}`;
  }

  document.querySelectorAll('.stepper').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      const step = Number(button.dataset.step || 0);
      input.value = clamp(Number(input.value) + step, Number(input.min || 0), Number(input.max || 20));
      normalizeCounters();
      clearErrors();
    });
  });

  [acompanhantes, criancas, homensAdultos, bebemChopp].forEach(input => input.addEventListener('input', normalizeCounters));
  normalizeCounters();

  function validate() {
    clearErrors();
    let valid = true;
    const cleanName = nome.value.trim().replace(/\s+/g, ' ');
    const a = clamp(acompanhantes.value, 0, 20);
    const c = clamp(criancas.value, 0, 20);
    const total = a + 1;
    const adultos = total - c;
    const h = clamp(homensAdultos.value, 0, 20);
    const ch = clamp(bebemChopp.value, 0, 20);

    if (cleanName.length < 2) {
      nomeError.textContent = 'Informe seu nome para confirmar a presença.';
      valid = false;
    }

    if (c > a) {
      criancasError.textContent = 'O número de crianças não pode ser maior que o de acompanhantes.';
      valid = false;
    }

    if (h > adultos) {
      homensError.textContent = 'O número de homens não pode ser maior que o total de adultos.';
      valid = false;
    }

    if (ch > adultos) {
      choppError.textContent = 'O número de pessoas que bebem chopp não pode ser maior que o total de adultos.';
      valid = false;
    }

    return { valid, cleanName, a, c, total, adultos, h, ch, mulheres: adultos - h };
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const { valid, cleanName, a, c, total, adultos, h, ch, mulheres } = validate();
    if (!valid) return;

    if (document.getElementById('website').value) return;

    const endpoint = String(config.endpoint || '');
    if (!endpoint.startsWith('https://script.google.com/')) {
      statusMessage.textContent = 'A lista ainda não está conectada à planilha. Configure a URL do Google Apps Script em config.js.';
      return;
    }

    const payload = {
      nome: cleanName,
      acompanhantes: a,
      criancas: c,
      totalPessoas: total,
      adultos,
      homensAdultos: h,
      mulheresAdultas: mulheres,
      bebemChopp: ch,
      origem: window.location.href,
      enviadoEm: new Date().toISOString(),
      website: ''
    };

    submitBtn.disabled = true;
    submitText.textContent = 'Registrando...';

    try {
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      successText.textContent = `${payload.nome}: ${payload.totalPessoas} ${payload.totalPessoas === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}, com ${payload.criancas} ${payload.criancas === 1 ? 'criança' : 'crianças'}, ${payload.homensAdultos} ${payload.homensAdultos === 1 ? 'homem adulto' : 'homens adultos'}, ${payload.mulheresAdultas} ${payload.mulheresAdultas === 1 ? 'mulher adulta' : 'mulheres adultas'} e ${payload.bebemChopp} ${payload.bebemChopp === 1 ? 'adulto que bebe chopp' : 'adultos que bebem chopp'}.`;
      rsvpCard.hidden = true;
      successCard.hidden = false;
      successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      launchConfetti(130);
      form.reset();
      acompanhantes.value = 0;
      criancas.value = 0;
      homensAdultos.value = 0;
      bebemChopp.value = 0;
      normalizeCounters();
    } catch (error) {
      console.error(error);
      statusMessage.textContent = 'Não foi possível registrar agora. Verifique sua conexão e tente novamente.';
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = 'Confirmar presença';
    }
  });

  newResponseBtn.addEventListener('click', () => {
    successCard.hidden = true;
    rsvpCard.hidden = false;
    clearErrors();
    rsvpCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => nome.focus(), 450);
  });

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