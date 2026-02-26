// ============================================================
//  FRACTION FUN — script.js
// ============================================================

/* ── PAGE NAVIGATION ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function goMenu() {
  q3Cleanup();
  showPage('page-menu');
}

/* ── SOUND ── */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _actx = null;
function getACtx() { if (!_actx) _actx = new AudioCtx(); return _actx; }
function playDing() {
  try {
    const ctx = getACtx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}
function playBuzz() {
  try {
    const ctx = getACtx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(180, ctx.currentTime);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch(e) {}
}

/* ── FEEDBACK ── */
function flashFeedback(icon, text, ms) {
  const el = document.getElementById('g-feedback');
  document.getElementById('g-feedback-icon').textContent = icon;
  document.getElementById('g-feedback-text').textContent = text;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), ms);
}
function spawnSparkles(x, y) {
  const emojis = ['✨','⭐','🌟','💫','🎉'];
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = (x + (Math.random()-0.5)*100) + 'px';
    el.style.top  = (y + (Math.random()-0.5)*80)  + 'px';
    el.style.animationDelay = (Math.random() * 0.25) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}
function showLevelComplete(score, total) {
  showPage('page-complete');
  document.getElementById('complete-msg').textContent =
    `You scored ${score} out of ${total} points!`;
  launchConfetti();
}
function launchConfetti() {
  const area = document.getElementById('confetti-area');
  area.innerHTML = '';
  const colors = ['#9c5de8','#ff6b9d','#ffd94a','#4ecb71','#4fb8ff','#ff4d6d'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random()*100 + '%';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.width  = (6 + Math.random()*8) + 'px';
    p.style.height = (6 + Math.random()*8) + 'px';
    p.style.animationDuration = (1.5 + Math.random()*2) + 's';
    p.style.animationDelay   = Math.random() + 's';
    area.appendChild(p);
  }
}

/* ============================================================
   OPTION 1 — Teacher Bea's Order (Reveal Based on Unit Fraction)
   ============================================================ */
const state = {
  score: 0, currentFraction: null,
  isLocked: false, itemType: 'pizza', questionCount: 0
};
function startOption1() {
  state.score = 0; state.questionCount = 0; state.isLocked = false;
  document.getElementById('score').textContent = '0';
  showPage('page-opt1');
  drawCharacter();
  initRound();
}
function drawCharacter() {
  const canvas = document.getElementById('character-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  
  const img = new Image();
  img.src = 'adi.png'; // Make sure adi.png exists or this fails silently
  img.onload = () => {
    const scale = 1.3;
    const scaledW = W * scale;
    const scaledH = H * scale;
    const x = (W - scaledW) / 2;
    const y = H - scaledH;
    ctx.drawImage(img, x, y, scaledW, scaledH);
  };
}

const speechBubble = document.getElementById('speech-bubble');
const counterArea  = document.getElementById('counter-area');
const scoreEl      = document.getElementById('score');
const feedbackOverlay = document.getElementById('feedback-overlay');
const msgTitle     = document.getElementById('msg-title');
const msgText      = document.getElementById('msg-text');
const characterContainer = document.getElementById('character-container');

function initRound() {
  if (state.questionCount >= 7) { showLevelComplete(state.score, 70); return; }
  state.isLocked = false;
  feedbackOverlay.style.visibility = 'hidden';
  feedbackOverlay.style.opacity = '0';
  state.currentFraction = Math.random() > 0.5 ? '1/2' : '1/4';
  const items = ['pizza','pie','bread','pastry'];
  state.itemType = items[Math.floor(Math.random()*items.length)];
  const qn = state.questionCount + 1;
  let txt = `<small style="opacity:0.7">Q${qn}/7 &nbsp;</small>`;
  if (state.currentFraction === '1/2') {
    txt += `I'd like <span class="fraction-highlight">1/2</span> of that ${state.itemType} please!`;
  } else {
    txt += `I'd like <span class="fraction-highlight">1/4</span> of that ${state.itemType} please!`;
  }
  speechBubble.innerHTML = txt;
  generateItemOptions(state.currentFraction);
}

function generateItemOptions(target) {
  counterArea.innerHTML = '';
  // Provide one correct fraction slice, and two incorrect ones
  let opts = target === '1/2'
    ? [{cutType:'1/2',correct:true},{cutType:'1/4',correct:false},{cutType:'unequal-large',correct:false}]
    : [{cutType:'1/4',correct:true},{cutType:'1/2',correct:false},{cutType:'unequal-large',correct:false}];
  opts.sort(() => Math.random()-0.5);
  opts.forEach(opt => {
    const wrap = document.createElement('div');
    wrap.className = 'item-option';
    wrap.onclick = () => checkAnswer(opt.correct);
    const cv = document.createElement('canvas'); cv.width=160; cv.height=160;
    drawItem(cv, state.itemType, opt.cutType);
    const btn = document.createElement('button'); btn.className='btn-order'; btn.innerText='SERVE';
    wrap.appendChild(cv); wrap.appendChild(btn); counterArea.appendChild(wrap);
  });
}

// 1. I-update ang initRound para Cinnamon Bread at Cookie na ang banggitin ni Teacher Bea
function initRound() {
  if (state.questionCount >= 7) { showLevelComplete(state.score, 70); return; }
  state.isLocked = false;
  feedbackOverlay.style.visibility = 'hidden';
  feedbackOverlay.style.opacity = '0';
  state.currentFraction = Math.random() > 0.5 ? '1/2' : '1/4';
  
  // DITO NATIN BINAGO ANG LISTAHAN:
  const items = ['pizza', 'pie', 'cinnamon bread', 'cookie'];
  state.itemType = items[Math.floor(Math.random() * items.length)];
  
  const qn = state.questionCount + 1;
  let txt = `<small style="opacity:0.7">Q${qn}/7 &nbsp;</small>`;
  if (state.currentFraction === '1/2') {
    txt += `I'd like <span class="fraction-highlight">1/2</span> of that ${state.itemType} please!`;
  } else {
    txt += `I'd like <span class="fraction-highlight">1/4</span> of that ${state.itemType} please!`;
  }
  speechBubble.innerHTML = txt;
  generateItemOptions(state.currentFraction);
}

// 2. I-update ang drawItem para basahin ang bagong pangalan
function drawItem(canvas, itemType, cutType) {
  const ctx = canvas.getContext('2d'), cx = 80, cy = 80, r = 70;
  ctx.clearRect(0, 0, 160, 160);

  function makeOutline() {
    ctx.beginPath();
    if (itemType === 'pizza' || itemType === 'pie' || itemType === 'cookie') {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (itemType === 'cinnamon bread') {
      const size = r * 1.7;
      const offset = size / 2;
      if (ctx.roundRect) {
        ctx.roundRect(cx - offset, cy - offset, size, size, 20);
      } else {
        ctx.rect(cx - offset, cy - offset, size, size);
      }
    }
  }

  makeOutline();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#222';
  ctx.stroke();

  let startAngle = 0, endAngle = Math.PI * 2;
  if (cutType === '1/2') { startAngle = Math.PI / 2; endAngle = Math.PI * 1.5; } 
  else if (cutType === '1/4') { startAngle = Math.PI; endAngle = Math.PI * 1.5; } 
  else if (cutType === 'unequal-large') { startAngle = Math.PI / 2; endAngle = Math.PI * 1.8; } 
  else if (cutType === 'unequal-small') { startAngle = Math.PI; endAngle = Math.PI * 1.3; }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r + 20, startAngle, endAngle); 
  ctx.closePath();
  ctx.clip();

  switch(itemType) {
    case 'pizza': drawPizzaBase(ctx,cx,cy,r); break;
    case 'pie':   drawPieBase(ctx,cx,cy,r);   break;
    case 'cinnamon bread': drawCinnamonBread(ctx,cx,cy,r); break;
    case 'cookie': drawCookie(ctx,cx,cy,r); break;
  }
  ctx.restore();

  ctx.save();
  makeOutline();
  ctx.clip(); 
  
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#222';
  ctx.lineCap = 'round';
  ctx.beginPath();
  
  if (cutType === '1/2') {
    ctx.moveTo(cx, cy - r - 20); ctx.lineTo(cx, cy + r + 20);
  } else if (cutType === '1/4') {
    ctx.moveTo(cx, cy - r - 20); ctx.lineTo(cx, cy + r + 20);
    ctx.moveTo(cx - r - 20, cy); ctx.lineTo(cx + r + 20, cy);
  } else {
    ctx.moveTo(cx, cy); ctx.lineTo(cx + (r+20) * Math.cos(startAngle), cy + (r+20) * Math.sin(startAngle));
    ctx.moveTo(cx, cy); ctx.lineTo(cx + (r+20) * Math.cos(endAngle), cy + (r+20) * Math.sin(endAngle));
  }
  ctx.stroke();
  ctx.restore();

  makeOutline();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#222';
  ctx.stroke();
}
// ============================================
// UPDATE: Cinnamon Bread (Fixed Overlap)
// ============================================
function drawCinnamonBread(ctx, cx, cy, r) {
  // 1. Draw the actual bread shape first before filling!
  ctx.beginPath();
  const size = r * 1.7;
  const offset = size / 2;
  if (ctx.roundRect) {
    ctx.roundRect(cx - offset, cy - offset, size, size, 20);
  } else {
    ctx.rect(cx - offset, cy - offset, size, size);
  }
  ctx.fillStyle = '#f4e3c5'; 
  ctx.fill(); 

  // 2. Cinnamon Swirl
  ctx.beginPath();
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  
  for (let i = 0; i < 45; i++) {
    const angle = 0.25 * i;
    const spiralR = 1.2 * i;
    const x = cx + spiralR * Math.cos(angle);
    const y = cy + spiralR * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 3. Cinnamon/raisin bits
  ctx.fillStyle = '#5c2e0e';
  [{x: -15, y: -20}, {x: 25, y: -10}, {x: -20, y: 25}, {x: 15, y: 30}].forEach(p => {
    ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 3, 0, Math.PI * 2); ctx.fill();
  });
}

// ============================================
// UPDATE: Cookie (Fixed Overlap)
// ============================================
function drawCookie(ctx, cx, cy, r) {
  // 1. Draw the round cookie shape first before filling!
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#e5b974';
  ctx.fill(); 

  // 2. Chocolate Chips
  ctx.fillStyle = '#3e2723';
  const chips = [
    {x: -20, y: -30, s: 6}, {x: 20, y: -25, s: 5}, {x: 0, y: -10, s: 7}, 
    {x: -30, y: 10, s: 6}, {x: 30, y: 15, s: 5}, {x: -15, y: 35, s: 7}, 
    {x: 10, y: 40, s: 6}, {x: 40, y: -5, s: 5}, {x: -40, y: -10, s: 6},
    {x: 0, y: 20, s: 5}
  ];
  
  chips.forEach(c => {
    ctx.beginPath();
    ctx.arc(cx + c.x, cy + c.y, c.s, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPizzaBase(ctx,cx,cy,r){
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#e6a85c';ctx.fill();
  ctx.strokeStyle='#c27e3a';ctx.lineWidth=4;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,r-8,0,Math.PI*2);ctx.fillStyle='#fdd835';ctx.fill();
  [{x:-20,y:-20},{x:20,y:-30},{x:0,y:0},{x:-30,y:20},{x:30,y:30},{x:40,y:-10},{x:-10,y:40}].forEach(t=>{
    ctx.beginPath();ctx.arc(cx+t.x,cy+t.y,7,0,Math.PI*2);ctx.fillStyle='#d32f2f';ctx.fill();ctx.stroke();
  });
}
function drawPieBase(ctx,cx,cy,r){
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#d4a276';ctx.fill();
  ctx.strokeStyle='#b68a5e';ctx.lineWidth=5;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,r-10,0,Math.PI*2);ctx.fillStyle='#c62828';ctx.fill();
  ctx.strokeStyle='#d4a276';ctx.lineWidth=6;ctx.beginPath();
  ctx.moveTo(cx-r+10,cy-30);ctx.lineTo(cx+r-10,cy-30);
  ctx.moveTo(cx-r+10,cy+30);ctx.lineTo(cx+r-10,cy+30);
  ctx.moveTo(cx-30,cy-r+10);ctx.lineTo(cx-30,cy+r-10);
  ctx.moveTo(cx+30,cy-r+10);ctx.lineTo(cx+30,cy+r-10);ctx.stroke();
}

function drawBreadBase(ctx,cx,cy,r){
  ctx.beginPath();ctx.ellipse(cx,cy,r,r-20,0,0,Math.PI*2);ctx.fillStyle='#d7ccc8';ctx.fill();
  ctx.strokeStyle='#a1887f';ctx.lineWidth=4;ctx.stroke();
  ctx.strokeStyle='#8d6e63';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(cx-40,cy-20);ctx.lineTo(cx-20,cy+20);
  ctx.moveTo(cx,cy-20);ctx.lineTo(cx+20,cy+20);
  ctx.moveTo(cx+40,cy-20);ctx.lineTo(cx+60,cy+20);ctx.stroke();
}
function drawPastryBase(ctx,cx,cy,r){
  ctx.beginPath();
  for(let i=0;i<5;i++){ctx.ellipse(cx+Math.cos(i*Math.PI*2/5)*20,cy+Math.sin(i*Math.PI*2/5)*20,r-20,r-30,i*Math.PI*2/5,0,Math.PI*2);}
  ctx.fillStyle='#ffe0b2';ctx.fill();ctx.strokeStyle='#ffb74d';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,20,0,Math.PI*2);ctx.fillStyle='#ad1457';ctx.fill();
}

function checkAnswer(isCorrect) {
  if (state.isLocked) return;
  state.isLocked = true;
  feedbackOverlay.style.visibility='visible'; feedbackOverlay.style.opacity='1';
  document.getElementById('feedback-msg').style.transform='scale(1)';
  if (isCorrect) {
    state.score+=10; scoreEl.textContent=state.score;
    msgTitle.textContent='Yummy!'; msgTitle.style.color='#4caf50';
    msgText.textContent="That's exactly right!";
    characterContainer.style.transform='translateY(-20px)';
    setTimeout(()=>characterContainer.style.transform='translateY(0)',300);
    playDing();
  } else {
    msgTitle.textContent='Nice Try!'; msgTitle.style.color='#d32f2f';
    msgText.textContent="That's not the fraction I asked for.";
    playBuzz();
  }
}
function nextLevel() {
  document.getElementById('feedback-msg').style.transform='scale(0.8)';
  feedbackOverlay.style.opacity='0';
  setTimeout(()=>{ feedbackOverlay.style.visibility='hidden'; state.questionCount++; initRound(); },300);
}

/* ============================================================
   OPTION 2 — Trace & Paint
   ============================================================ */

const OPT2_Q = [
  { text: 'Which unit fraction is <span class="hl">smaller</span>? Trace the line, paint one part, and choose the correct answer.', traceTarget: 'quarter' },
  { text: 'Which unit fraction is <span class="hl">bigger</span>? Trace the line, paint one part, and choose the correct answer.', traceTarget: 'half' },
  { text: 'Trace and paint <span class="hl">both unit fractions</span>, then connect each to its match!', traceTarget: 'both' },
];

const CORRECT_ANS = { 0: 'quarter', 1: 'half' };

let o2 = {};

function startOption2() {
  o2 = { qIndex: 0, score: 0 };
  showPage('page-opt2');
  loadOpt2Q();
}

function loadOpt2Q() {
  const q = OPT2_Q[o2.qIndex];
  document.getElementById('opt2-counter').textContent = `Question ${o2.qIndex+1} of 3`;
  document.getElementById('opt2-progress').style.width = ((o2.qIndex/3)*100)+'%';
  document.getElementById('opt2-score').textContent = o2.score;
  document.getElementById('opt2-question').innerHTML = q.text;
  if (o2.qIndex < 2) showQ12(q);
  else showQ3();
}

function showQ12(q) {
  document.getElementById('circles-row').style.display = 'flex';
  document.getElementById('opt2-btns').style.display   = 'flex';
  document.getElementById('q3-area').style.display     = 'none';

  const hH = document.getElementById('hint-half');
  const hQ = document.getElementById('hint-quarter');
  hH.textContent = '✏️ Trace top to bottom!';  hH.classList.remove('done');
  hQ.textContent = '✏️ Trace left to right first!'; hQ.classList.remove('done');

  const bH = document.getElementById('btn-half');
  const bQ = document.getElementById('btn-quarter');
  bH.disabled=true; bH.classList.remove('wrong');
  bQ.disabled=true; bQ.classList.remove('wrong');

  ['circle-half','circle-quarter'].forEach(id => {
    const el = document.getElementById(id);
    el.style.opacity = '1';
    el.style.cursor  = 'crosshair';
  });

  o2.locked        = false;
  o2.tracedHalf    = false;
  o2.paintedHalf   = 0;
  o2.tracedQuarter = false;
  o2.paintedQuarter= 0;
  o2.quarterStep   = 0;   
  o2.halfProg      = 0;
  o2.qHProg        = 0;   
  o2.qVProg        = 0;   

  cloneCanvas('circle-half');
  cloneCanvas('circle-quarter');
  drawHalfCircle(0);
  drawQuarterCircle(0, 0);

  setupHalfTrace(q.traceTarget);
  setupQuarterTrace(q.traceTarget);
}

function cloneCanvas(id) {
  const old = document.getElementById(id);
  const neo = old.cloneNode(false);
  neo.id = id;
  neo.width  = old.width;
  neo.height = old.height;
  old.parentNode.replaceChild(neo, old);
  return neo;
}

const BUCKET_CURSOR = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' style=\'font-size:24px\'><text y=\'24\'>🪣</text></svg>") 0 24, pointer';

function drawHalfCircle(progress) {
  const cv = document.getElementById('circle-half');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W=cv.width, H=cv.height, cx=W/2, cy=H/2, r=W/2-16;
  ctx.clearRect(0,0,W,H);

  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='#ede9fe'; ctx.fill();

  // Painted Area
  if (o2.paintedHalf) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, o2.paintedHalf===2 ? -Math.PI/2 : Math.PI/2, o2.paintedHalf===2 ? Math.PI/2 : Math.PI*1.5);
    ctx.fillStyle = '#c4b5fd'; ctx.fill();
  }

  ctx.strokeStyle='#a78bfa'; ctx.lineWidth=4; ctx.stroke();

  ctx.save();
  ctx.setLineDash([10,7]); ctx.strokeStyle='rgba(124,58,237,0.45)'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(cx,cy-r+8); ctx.lineTo(cx,cy+r-8); ctx.stroke();
  ctx.restore();

  if (progress > 0) {
    const totalLen=(r-8)*2;
    ctx.save(); ctx.setLineDash([]);
    ctx.strokeStyle='#7c3aed'; ctx.lineWidth=7; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(cx, cy-r+8);
    ctx.lineTo(cx, cy-r+8 + totalLen*Math.min(progress,1));
    ctx.stroke(); ctx.restore();
  }
}

function drawQuarterCircle(hProgress, vProgress) {
  const cv = document.getElementById('circle-quarter');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W=cv.width, H=cv.height, cx=W/2, cy=H/2, r=W/2-16;
  ctx.clearRect(0,0,W,H);

  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='#fce7f3'; ctx.fill();

  // Painted Area
  if (o2.paintedQuarter) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    if (o2.paintedQuarter===1) ctx.arc(cx,cy,r, Math.PI*1.5, Math.PI*2); // TR
    if (o2.paintedQuarter===2) ctx.arc(cx,cy,r, 0, Math.PI/2); // BR
    if (o2.paintedQuarter===3) ctx.arc(cx,cy,r, Math.PI/2, Math.PI); // BL
    if (o2.paintedQuarter===4) ctx.arc(cx,cy,r, Math.PI, Math.PI*1.5); // TL
    ctx.fillStyle = '#f9a8d4'; ctx.fill();
  }

  ctx.strokeStyle='#f472b6'; ctx.lineWidth=4; ctx.stroke();

  const L=r-8;
  ctx.save(); ctx.setLineDash([10,7]); ctx.lineWidth=5;
  ctx.strokeStyle='rgba(190,24,93,0.45)';
  ctx.beginPath(); ctx.moveTo(cx-L,cy); ctx.lineTo(cx+L,cy); ctx.stroke(); 
  ctx.beginPath(); ctx.moveTo(cx,cy-L); ctx.lineTo(cx,cy+L); ctx.stroke(); 
  ctx.restore();

  ctx.save(); ctx.setLineDash([]); ctx.lineWidth=7; ctx.lineCap='round';
  if (hProgress > 0) {
    ctx.strokeStyle='#be185d';
    ctx.beginPath();
    ctx.moveTo(cx-L, cy);
    ctx.lineTo(cx-L + L*2*Math.min(hProgress,1), cy);
    ctx.stroke();
  }
  if (vProgress > 0) {
    ctx.strokeStyle='#9d174d';
    ctx.beginPath();
    ctx.moveTo(cx, cy-L);
    ctx.lineTo(cx, cy-L + L*2*Math.min(vProgress,1));
    ctx.stroke();
  }
  ctx.restore();
}

function setupHalfTrace(traceTarget) {
  const cv = document.getElementById('circle-half');
  const glow = document.getElementById('glow-half');
  if (!cv) return;

  let isDown = false;
  let startY = 0;
  const NEED_PX = 80;

  function getPos(e) {
    const rect = cv.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: s.clientX - rect.left, y: s.clientY - rect.top };
  }

  cv.addEventListener('mousedown', onDown, {passive:false});
  cv.addEventListener('mousemove', onMove, {passive:false});
  cv.addEventListener('mouseup',   onUp);
  cv.addEventListener('mouseleave', onLeave);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove',  onMove, {passive:false});
  cv.addEventListener('touchend',   onUp);
  cv.addEventListener('click', onClick);

  function onClick(e) {
    if (!o2.tracedHalf || o2.paintedHalf) return;
    const p = getPos(e);
    o2.paintedHalf = p.x < cv.width/2 ? 1 : 2; // 1 = Left, 2 = Right
    cv.style.cursor = 'default';
    drawHalfCircle(1);
    
    const h = document.getElementById('hint-half');
    if (traceTarget === 'half') {
      h.textContent = '✅ Painted! Now, pick an answer.'; h.classList.add('done');
      document.getElementById('btn-half').disabled = false;
      document.getElementById('btn-quarter').disabled = false;
    } else {
      h.textContent = '✅ Painted! (Now do the other circle)'; h.classList.add('done');
    }
  }

  function onDown(e) {
    if (o2.tracedHalf) return;
    e.preventDefault();
    if (o2.locked) return;
    isDown = true;
    const p = getPos(e);
    startY = p.y;
    showGlow(glow, p.x, p.y);
  }
  
  function onMove(e) {
    if (o2.tracedHalf) return;
    e.preventDefault();
    const p = getPos(e);
    showGlow(glow, p.x, p.y);
    if (!isDown || o2.locked) return;

    const dy = p.y - startY; 
    if (dy < -5) {
      o2.halfProg = 0; startY = p.y; drawHalfCircle(0); return;
    }

    const progress = Math.min(dy / NEED_PX, 1);
    o2.halfProg = progress;
    drawHalfCircle(progress);

    if (progress >= 1) {
      isDown = false; o2.tracedHalf = true;
      cv.style.cursor = BUCKET_CURSOR;
      const h = document.getElementById('hint-half');
      h.textContent = '🪣 Click inside to paint one part!';
      hideGlow(glow);
    }
  }
  function onUp()    { isDown = false; }
  function onLeave() { isDown = false; hideGlow(glow); }
}

function setupQuarterTrace(traceTarget) {
  const cv = document.getElementById('circle-quarter');
  const glow = document.getElementById('glow-quarter');
  if (!cv) return;

  let isDown = false;
  let startX = 0, startY = 0;
  const NEED_PX = 80;

  function getPos(e) {
    const rect = cv.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: s.clientX - rect.left, y: s.clientY - rect.top };
  }

  cv.addEventListener('mousedown', onDown, {passive:false});
  cv.addEventListener('mousemove', onMove, {passive:false});
  cv.addEventListener('mouseup',   onUp);
  cv.addEventListener('mouseleave', onLeave);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove',  onMove, {passive:false});
  cv.addEventListener('touchend',   onUp);
  cv.addEventListener('click', onClick);

  function onClick(e) {
    if (!o2.tracedQuarter || o2.paintedQuarter) return;
    const p = getPos(e);
    const cx = cv.width/2, cy = cv.height/2;
    if (p.y < cy) {
       o2.paintedQuarter = p.x > cx ? 1 : 4; // Top-Right : Top-Left
    } else {
       o2.paintedQuarter = p.x > cx ? 2 : 3; // Bottom-Right : Bottom-Left
    }
    cv.style.cursor = 'default';
    drawQuarterCircle(1, 1);
    
    const h = document.getElementById('hint-quarter');
    if (traceTarget === 'quarter') {
      h.textContent = '✅ Painted! Now, pick an answer.'; h.classList.add('done');
      document.getElementById('btn-half').disabled = false;
      document.getElementById('btn-quarter').disabled = false;
    } else {
      h.textContent = '✅ Painted! (Now do the other circle)'; h.classList.add('done');
    }
  }

  function onDown(e) {
    if (o2.tracedQuarter) return;
    e.preventDefault();
    if (o2.locked || o2.quarterStep >= 2) return;
    isDown = true;
    const p = getPos(e);
    startX = p.x; startY = p.y;
    showGlow(glow, p.x, p.y);
  }

  function onMove(e) {
    if (o2.tracedQuarter) return;
    e.preventDefault();
    const p = getPos(e);
    showGlow(glow, p.x, p.y);
    if (!isDown || o2.locked || o2.quarterStep >= 2) return;

    if (o2.quarterStep === 0) {
      const dx = p.x - startX, dy = p.y - startY;
      if (Math.abs(dy) > Math.abs(dx) + 15 || dx < -5) {
        o2.qHProg = 0; startX = p.x; startY = p.y; drawQuarterCircle(0, 0); updateQHint(0, 0); return;
      }
      const prog = Math.min(dx / NEED_PX, 1);
      o2.qHProg = prog;
      drawQuarterCircle(prog, 0);
      updateQHint(0, prog);

      if (prog >= 1) {
        o2.quarterStep = 1; isDown = false;
        drawQuarterCircle(1, 0); updateQHint(1, 0);
      }
    } else if (o2.quarterStep === 1) {
      const dx = p.x - startX, dy = p.y - startY;
      if (Math.abs(dx) > Math.abs(dy) + 15 || dy < -5) {
        o2.qVProg = 0; startX = p.x; startY = p.y; drawQuarterCircle(1, 0); updateQHint(1, 0); return;
      }
      const prog = Math.min(dy / NEED_PX, 1);
      o2.qVProg = prog;
      drawQuarterCircle(1, prog);
      updateQHint(1, prog);

      if (prog >= 1) {
        o2.quarterStep = 2; isDown = false; o2.tracedQuarter = true;
        cv.style.cursor = BUCKET_CURSOR;
        const h = document.getElementById('hint-quarter');
        h.textContent = '🪣 Click inside to paint one part!'; h.classList.remove('done');
        drawQuarterCircle(1, 1);
        hideGlow(glow);
      }
    }
  }
  function onUp()    { isDown = false; }
  function onLeave() { isDown = false; hideGlow(glow); }
}

function updateQHint(step, prog) {
  const h = document.getElementById('hint-quarter');
  if (step === 0) { h.textContent = '✏️ Trace left to right!'; h.classList.remove('done'); } 
  else if (step === 1 && prog < 1) { h.textContent = '✅ Now, trace top to bottom!'; h.classList.add('done'); }
}

function opt2Answer(choice) {
  if (o2.locked) return;
  const correct = CORRECT_ANS[o2.qIndex];
  const isCorrect = (choice === correct);
  const btn = document.getElementById(choice==='half'?'btn-half':'btn-quarter');
  const rect = btn.getBoundingClientRect();
  const cx = rect.left+rect.width/2, cy = rect.top+rect.height/2;
  if (isCorrect) {
    o2.locked = true; o2.score += 20;
    playDing(); spawnSparkles(cx,cy);
    flashFeedback('✅','Great job! 🎉',950);
    setTimeout(advanceOpt2, 1100);
  } else {
    playBuzz(); btn.classList.add('wrong');
    flashFeedback('❌','Try again!',900);
    setTimeout(()=>btn.classList.remove('wrong'),950);
  }
}

function advanceOpt2() {
  o2.qIndex++;
  document.getElementById('opt2-score').textContent = o2.score;
  if (o2.qIndex >= 3) showLevelComplete(o2.score, 60);
  else loadOpt2Q();
}

function showGlow(el, x, y) { if (!el) return; el.style.display='block'; el.style.left=x+'px'; el.style.top=y+'px'; }
function hideGlow(el) { if (el) el.style.display='none'; }

/* ============================================================
   Q3 — Drag-to-connect (With Paint Step)
   ============================================================ */

let q3 = {};

function showQ3() {
  document.getElementById('circles-row').style.display = 'none';
  document.getElementById('opt2-btns').style.display   = 'none';
  document.getElementById('q3-area').style.display     = 'block';

  o2.tracedHalf    = false; o2.paintedHalf   = 0;
  o2.tracedQuarter = false; o2.paintedQuarter= 0;
  o2.quarterStep   = 0; o2.locked = false;

  initQ3Canvas();
}

function initQ3Canvas() {
  const area = document.getElementById('q3-area');
  const W    = Math.min(area.clientWidth || 620, 620);
  const H    = Math.round(W * 0.65);

  let cv = document.getElementById('q3-canvas');
  const neo = cv.cloneNode(false);
  neo.id='q3-canvas'; neo.width=W; neo.height=H;
  cv.parentNode.replaceChild(neo, cv);
  cv = neo;

  const PAD = 28, CR = Math.round(W * 0.135), LCX = PAD + CR, RCX = W - PAD - CR;
  const CY1 = Math.round(H * 0.28), CY2 = Math.round(H * 0.74), DOT = 11;

  q3 = {
    cv, W, H, CR, LCX, RCX, CY1, CY2, DOT,
    dotHalf: { x: LCX+CR, y: CY1 }, dotQuarter: { x: LCX+CR, y: CY2 },
    lblHalf: { x: RCX-CR, y: CY2 }, lblQuarter: { x: RCX-CR, y: CY1 },
    connHalf: null, connQuarter: null,
    tracedHalf: false, paintedHalf: 0,
    tracedQuarter: false, paintedQuarter: 0,
    quarterStep: 0, halfProg: 0, qHProg: 0, qVProg: 0,
    dragging: null, glowX: null, glowY: null, glowOn: false,
    isDown: false, traceTarget: null, startX: 0, startY: 0,
    phase: 'trace', done: false,
  };

  document.getElementById('q3-hint').textContent = '✏️ Trace the ½ circle first!';
  drawQ3();

  cv.addEventListener('mousedown',  q3Down,  {passive:false});
  cv.addEventListener('mousemove',  q3Move,  {passive:false});
  cv.addEventListener('mouseup',    q3Up,    {passive:false});
  cv.addEventListener('mouseleave', q3Leave);
  cv.addEventListener('touchstart', q3Down,  {passive:false});
  cv.addEventListener('touchmove',  q3Move,  {passive:false});
  cv.addEventListener('touchend',   q3Up,    {passive:false});
  cv.addEventListener('click',      q3Click);
}

function q3Cleanup() {
  const cv = document.getElementById('q3-canvas');
  if (cv) {
    const neo = cv.cloneNode(false); neo.id='q3-canvas';
    cv.parentNode.replaceChild(neo, cv);
  }
  q3 = {};
}

function q3Pos(e) {
  const cv = document.getElementById('q3-canvas');
  if (!cv) return {x:0,y:0};
  const rect = cv.getBoundingClientRect();
  const scX  = cv.width  / rect.width, scY  = cv.height / rect.height;
  const s    = e.touches ? e.touches[0] : e;
  return { x:(s.clientX-rect.left)*scX, y:(s.clientY-rect.top)*scY };
}

function drawQ3() {
  const { cv,W,H,CR,LCX,RCX,CY1,CY2,DOT } = q3;
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#faf7ff'; ctx.fillRect(0,0,W,H);

  if (q3.phase === 'trace') {
    q3DrawHalf(ctx, LCX, CY1, CR, q3.halfProg, q3.paintedHalf);
    q3DrawQuarter(ctx, LCX, CY2, CR, q3.qHProg, q3.qVProg, q3.paintedQuarter);
    q3DrawLabel(ctx, RCX, CY1, CR, '¼', '#8DB600','#fdf4ff','#8DB600');
    q3DrawLabel(ctx, RCX, CY2, CR, '½', '#ff8000','#f5f3ff','#ff8000');
    if (q3.glowOn) q3DrawGlow(ctx, q3.glowX, q3.glowY);
  }

  if (q3.phase === 'connect') {
    q3DrawHalf(ctx, LCX, CY1, CR, 1, q3.paintedHalf);
    q3DrawQuarter(ctx, LCX, CY2, CR, 1, 1, q3.paintedQuarter);
    const hOk = q3.connHalf === 'half', qOk = q3.connQuarter === 'quarter';

    q3DrawLabel(ctx, RCX, CY1, CR, '¼', qOk?'#8DB600':'#8DB600', qOk?'#fce7f3':'#fdf4ff', qOk?'#8DB600':'#8DB600');
    q3DrawLabel(ctx, RCX, CY2, CR, '½', hOk?'#ff8000':'#ff8000', hOk?'#ede9fe':'#f5f3ff', hOk?'#ff8000':'#ff8000');

    drawDot(ctx, LCX+CR, CY1, DOT, q3.connHalf ? (hOk?'#7c3aed':'#ff4d6d') : '#c4b5fd');
    drawDot(ctx, LCX+CR, CY2, DOT, q3.connQuarter ? (qOk?'#be185d':'#ff4d6d') : '#f9a8d4');

    const quarterLblConn = (q3.connHalf==='quarter'||q3.connQuarter==='quarter');
    const halfLblConn    = (q3.connHalf==='half'||q3.connQuarter==='half');
    drawDot(ctx, RCX-CR, CY1, DOT, quarterLblConn ? (qOk?'#be185d':'#ff4d6d') : '#8DB600'); 
    drawDot(ctx, RCX-CR, CY2, DOT, halfLblConn ? (hOk?'#7c3aed':'#ff4d6d') : '#ff8000');   

    if (q3.connHalf)    drawLine(ctx, LCX+CR, CY1, RCX-CR, (q3.connHalf==='quarter'?CY1:CY2), hOk?'#7c3aed':'#ff4d6d');
    if (q3.connQuarter) drawLine(ctx, LCX+CR, CY2, RCX-CR, (q3.connQuarter==='quarter'?CY1:CY2), qOk?'#be185d':'#ff4d6d');

    if (q3.dragging) {
      const fy = q3.dragging.from==='half' ? CY1 : CY2;
      ctx.save(); ctx.setLineDash([6,5]); ctx.strokeStyle='#9c5de8'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(LCX+CR, fy); ctx.lineTo(q3.dragging.curX, q3.dragging.curY);
      ctx.stroke(); ctx.restore(); q3DrawGlow(ctx, q3.dragging.curX, q3.dragging.curY);
    }
  }
}

function drawDot(ctx, x, y, r, color) {
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
}
function drawLine(ctx, x1, y1, x2, y2, color) {
  ctx.save(); ctx.setLineDash([]); ctx.strokeStyle=color; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore();
}

function q3DrawHalf(ctx, cx, cy, r, progress, paintR) {
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='#ede9fe'; ctx.fill();
  
  if (paintR) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, paintR===2 ? -Math.PI/2 : Math.PI/2, paintR===2 ? Math.PI/2 : Math.PI*1.5);
    ctx.fillStyle = '#c4b5fd'; ctx.fill();
  }
  
  ctx.strokeStyle='#a78bfa'; ctx.lineWidth=3; ctx.stroke();
  ctx.save(); ctx.setLineDash([8,5]); ctx.strokeStyle='rgba(124,58,237,0.35)'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(cx,cy-r+8); ctx.lineTo(cx,cy+r-8); ctx.stroke(); ctx.restore();

  if (progress > 0) {
    const L=(r-8)*2; ctx.save(); ctx.setLineDash([]); ctx.strokeStyle='#7c3aed'; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(cx,cy-r+8); ctx.lineTo(cx,cy-r+8+L*Math.min(progress,1)); ctx.stroke(); ctx.restore();
  }
}

function q3DrawQuarter(ctx, cx, cy, r, hP, vP, paintR) {
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle='#fce7f3'; ctx.fill();

  if (paintR) {
    ctx.beginPath(); ctx.moveTo(cx, cy);
    if (paintR===1) ctx.arc(cx,cy,r, Math.PI*1.5, Math.PI*2); 
    if (paintR===2) ctx.arc(cx,cy,r, 0, Math.PI/2); 
    if (paintR===3) ctx.arc(cx,cy,r, Math.PI/2, Math.PI); 
    if (paintR===4) ctx.arc(cx,cy,r, Math.PI, Math.PI*1.5); 
    ctx.fillStyle = '#f9a8d4'; ctx.fill();
  }

  ctx.strokeStyle='#f472b6'; ctx.lineWidth=3; ctx.stroke();
  const L=r-8; ctx.save(); ctx.setLineDash([8,5]); ctx.strokeStyle='rgba(190,24,93,0.35)'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(cx-L,cy); ctx.lineTo(cx+L,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-L); ctx.lineTo(cx,cy+L); ctx.stroke(); ctx.restore();

  ctx.save(); ctx.setLineDash([]); ctx.lineWidth=6; ctx.lineCap='round';
  if (hP > 0) { ctx.strokeStyle='#be185d'; ctx.beginPath(); ctx.moveTo(cx-L,cy); ctx.lineTo(cx-L+L*2*Math.min(hP,1),cy); ctx.stroke(); }
  if (vP > 0) { ctx.strokeStyle='#9d174d'; ctx.beginPath(); ctx.moveTo(cx,cy-L); ctx.lineTo(cx,cy-L+L*2*Math.min(vP,1)); ctx.stroke(); }
  ctx.restore();
}

function q3DrawLabel(ctx, cx, cy, r, text, stroke, fill, textColor) {
  const hw=r+6, hh=r*0.65; ctx.beginPath(); ctx.roundRect(cx-hw, cy-hh, hw*2, hh*2, 12);
  ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle=textColor;
  ctx.font=`bold ${Math.round(r*1.05)}px Fredoka One, cursive`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, cx, cy); ctx.textBaseline='alphabetic';
}

function q3DrawGlow(ctx, x, y) {
  if (x==null||y==null) return;
  const g = ctx.createRadialGradient(x,y,2,x,y,20);
  g.addColorStop(0,'rgba(255,220,40,1)'); g.addColorStop(0.5,'rgba(255,160,0,0.6)'); g.addColorStop(1,'rgba(255,120,0,0)');
  ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
}

const TRACE_NEED = 60;

function q3Click(e) {
  if (q3.phase !== 'trace') return;
  const p = q3Pos(e);
  let changed = false;

  // Check Half paint
  if (q3.tracedHalf && !q3.paintedHalf && Math.hypot(p.x-q3.LCX, p.y-q3.CY1) < q3.CR) {
    q3.paintedHalf = p.x < q3.LCX ? 1 : 2; changed = true;
  }
  // Check Quarter paint
  if (q3.tracedQuarter && !q3.paintedQuarter && Math.hypot(p.x-q3.LCX, p.y-q3.CY2) < q3.CR) {
    if (p.y < q3.CY2) q3.paintedQuarter = p.x > q3.LCX ? 1 : 4;
    else              q3.paintedQuarter = p.x > q3.LCX ? 2 : 3;
    changed = true;
  }

  if (changed) {
    drawQ3();
    if (!q3.paintedHalf && !q3.paintedQuarter) q3.cv.style.cursor = 'default';
    q3CheckTraceDone();
  }
}

function q3Down(e) {
  e.preventDefault(); if (!q3.cv || q3.done) return;
  const p = q3Pos(e); q3.glowX=p.x; q3.glowY=p.y; q3.glowOn=true;

  if (q3.phase === 'trace') {
    if (!q3.tracedHalf && Math.hypot(p.x-q3.LCX, p.y-q3.CY1) < q3.CR+10) {
      q3.traceTarget='half'; q3.isDown=true; q3.startX=p.x; q3.startY=p.y;
    } else if (!q3.tracedQuarter && Math.hypot(p.x-q3.LCX, p.y-q3.CY2) < q3.CR+10) {
      q3.traceTarget='quarter'; q3.isDown=true; q3.startX=p.x; q3.startY=p.y;
    }
    drawQ3(); return;
  }

  if (q3.phase === 'connect') {
    if (Math.hypot(p.x-q3.dotHalf.x, p.y-q3.dotHalf.y) < q3.DOT+14) { q3.dragging = { from:'half', curX:p.x, curY:p.y }; q3.connHalf = null; } 
    else if (Math.hypot(p.x-q3.dotQuarter.x, p.y-q3.dotQuarter.y) < q3.DOT+14) { q3.dragging = { from:'quarter', curX:p.x, curY:p.y }; q3.connQuarter = null; }
    drawQ3();
  }
}

function q3Move(e) {
  e.preventDefault(); if (!q3.cv || q3.done) return;
  const p = q3Pos(e); q3.glowX=p.x; q3.glowY=p.y; q3.glowOn=true;

  if (q3.phase === 'trace' && q3.isDown) {
    const dx = p.x - q3.startX, dy = p.y - q3.startY;
    if (q3.traceTarget === 'half') {
      if (dy < -5 || (Math.abs(dx) > Math.abs(dy)+15)) { q3.halfProg = 0; q3.startX=p.x; q3.startY=p.y; drawQ3(); return; }
      q3.halfProg = Math.min(dy / TRACE_NEED, 1); drawQ3();
      if (q3.halfProg >= 1 && !q3.tracedHalf) { q3.tracedHalf = true; q3.isDown = false; q3.cv.style.cursor = BUCKET_CURSOR; q3CheckTraceDone(); }
    } else if (q3.traceTarget === 'quarter') {
      if (q3.quarterStep === 0) {
        if (dx < -5 || (Math.abs(dy) > Math.abs(dx)+15)) { q3.qHProg=0; q3.startX=p.x; q3.startY=p.y; drawQ3(); return; }
        q3.qHProg = Math.min(dx / TRACE_NEED, 1); drawQ3();
        if (q3.qHProg >= 1) { q3.quarterStep = 1; q3.isDown = false; document.getElementById('q3-hint').textContent = '✅ Now, trace the ¼ circle top to bottom!'; }
      } else if (q3.quarterStep === 1) {
        if (dy < -5 || (Math.abs(dx) > Math.abs(dy)+15)) { q3.qVProg=0; q3.startX=p.x; q3.startY=p.y; drawQ3(); return; }
        q3.qVProg = Math.min(dy / TRACE_NEED, 1); drawQ3();
        if (q3.qVProg >= 1 && !q3.tracedQuarter) { q3.tracedQuarter=true; q3.isDown=false; q3.quarterStep=2; q3.cv.style.cursor = BUCKET_CURSOR; q3CheckTraceDone(); }
      }
    }
    return;
  }

  if (q3.phase === 'connect' && q3.dragging) { q3.dragging.curX = p.x; q3.dragging.curY = p.y; drawQ3(); }
}

function q3Up(e) {
  e.preventDefault(); if (!q3.cv || q3.done) return;
  if (q3.phase === 'trace') { q3.isDown = false; drawQ3(); return; }

  if (q3.phase === 'connect' && q3.dragging) {
    const p = { x:q3.dragging.curX, y:q3.dragging.curY }, from = q3.dragging.from;
    q3.dragging = null; let dropped = null;
    if (Math.hypot(p.x-q3.lblQuarter.x, p.y-q3.CY1) < q3.CR+20) dropped='quarter';
    else if (Math.hypot(p.x-q3.lblHalf.x, p.y-q3.CY2) < q3.CR+20) dropped='half';

    if (dropped) {
      if (from==='half') q3.connHalf = dropped;
      if (from==='quarter') q3.connQuarter = dropped;
      drawQ3();

      if (q3.connHalf!==null && q3.connQuarter!==null) {
        if (q3.connHalf==='half' && q3.connQuarter==='quarter') {
          q3.done = true; o2.score+=20; playDing();
          const rect = q3.cv.getBoundingClientRect(); spawnSparkles(rect.left+rect.width/2, rect.top+rect.height/2);
          flashFeedback('✅','Perfect match! 🎉',1000);
          setTimeout(()=>{ o2.qIndex++; showLevelComplete(o2.score,60); },1200);
        } else {
          playBuzz(); flashFeedback('❌','Not quite! Try again!',950);
          setTimeout(()=>{ q3.connHalf=null; q3.connQuarter=null; drawQ3(); },950);
        }
      }
    } else {
      if (from==='half') q3.connHalf=null;
      if (from==='quarter') q3.connQuarter=null;
      drawQ3();
    }
  }
}

function q3Leave() { q3.glowOn=false; q3.isDown=false; drawQ3(); }

function q3CheckTraceDone() {
  if (q3.tracedHalf && q3.tracedQuarter && q3.paintedHalf && q3.paintedQuarter) {
    setTimeout(()=>{
      q3.phase='connect';
      q3.cv.style.cursor = 'crosshair';
      document.getElementById('q3-hint').textContent = 'Now, drag each circle dot → to the matching fraction label!';
      drawQ3();
    },400);
  } else if (q3.tracedHalf && !q3.paintedHalf) {
    document.getElementById('q3-hint').textContent = '🪣 Click the ½ circle to paint one part!';
  } else if (q3.tracedQuarter && !q3.paintedQuarter) {
    document.getElementById('q3-hint').textContent = '🪣 Click the ¼ circle to paint one part!';
  } else if (q3.tracedHalf && !q3.tracedQuarter) {
    document.getElementById('q3-hint').textContent = '✅ Now, trace the ¼ circle!';
  } else if (!q3.tracedHalf && q3.tracedQuarter) {
    document.getElementById('q3-hint').textContent = '✅ Now, trace the ½ circle!';
  }
}