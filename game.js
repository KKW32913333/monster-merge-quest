// ===== MONSTER MERGE QUEST =====
// Dark Fantasy Theme — Matter.js Physics

const { Engine, Runner, Bodies, Body, World, Events } = Matter;

// ===== モンスター定義 =====
const MONSTERS = [
  { name: 'スライム',     emoji: '🟢', radius: 12,  color: '#44aa44', score: 1,  magic: '#88ff88' },
  { name: 'コウモリ',     emoji: '🦇', radius: 18,  color: '#553366', score: 3,  magic: '#cc88ff' },
  { name: 'ゴブリン',     emoji: '👺', radius: 26,  color: '#226622', score: 6,  magic: '#44ff44' },
  { name: 'スケルトン',   emoji: '💀', radius: 34,  color: '#aaaaaa', score: 10, magic: '#ffffff' },
  { name: 'オーク',       emoji: '👹', radius: 44,  color: '#885522', score: 15, magic: '#ffaa44' },
  { name: 'ミノタウロス', emoji: '🐂', radius: 54,  color: '#664422', score: 21, magic: '#ff8844' },
  { name: '魔女',         emoji: '🧙', radius: 66,  color: '#442266', score: 28, magic: '#dd44ff' },
  { name: 'フェニックス', emoji: '🔥', radius: 80,  color: '#cc4400', score: 36, magic: '#ff6600' },
  { name: 'リッチ王',     emoji: '👑', radius: 95,  color: '#886600', score: 45, magic: '#ffdd00' },
  { name: '魔王',         emoji: '😈', radius: 112, color: '#660022', score: 55, magic: '#ff0044' },
];

// ===== ゲーム状態 =====
let engine, world, runner;
let gameCanvas, effectCanvas, nextCanvas;
let gameCtx, effectCtx, nextCtx;
let containerEl;
let W, H;

let bodies      = [];
let particles   = [];
let embers      = [];   // 漂うエンバー
let score       = 0;
let bestScore   = 0;
let chainCount  = 0;
let chainTimer  = null;
let nextIdx     = 0;
let currentIdx  = 0;
let mouseX      = 0;
let isDropping  = false;
let isGameOver  = false;
let mergeQueue  = [];
let dangerFrames= 0;

// ===== 初期化 =====
function init() {
  gameCanvas   = document.getElementById('game-canvas');
  effectCanvas = document.getElementById('effect-canvas');
  nextCanvas   = document.getElementById('next-canvas');
  containerEl  = document.getElementById('game-container');
  gameCtx      = gameCanvas.getContext('2d');
  effectCtx    = effectCanvas.getContext('2d');
  nextCtx      = nextCanvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  buildPhysics();
  setupInput();
  buildEvolutionBar();
  spawnEmbers();

  bestScore = parseInt(localStorage.getItem('monsterMergeBest') || '0');
  document.getElementById('best-display').textContent = bestScore;

  currentIdx = randomDropIdx();
  nextIdx    = randomDropIdx();
  drawNextMonster();

  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  W = containerEl.clientWidth;
  H = containerEl.clientHeight;
  gameCanvas.width = effectCanvas.width = W;
  gameCanvas.height = effectCanvas.height = H;
  if (engine) rebuildWalls();
}

// ===== 物理エンジン =====
function buildPhysics() {
  engine = Engine.create({ gravity: { y: 1.2 } });
  world  = engine.world;
  runner = Runner.create();
  Runner.run(runner, engine);
  rebuildWalls();
  setupCollision();
}

function rebuildWalls() {
  World.remove(world, world.bodies.filter(b => b.label === 'wall'));
  const opts = { isStatic: true, label: 'wall', restitution: 0.2, friction: 0.6 };
  const t = 30;
  World.add(world, [
    Bodies.rectangle(W/2, H + t/2, W, t, opts),
    Bodies.rectangle(-t/2, H/2, t, H*2, opts),
    Bodies.rectangle(W + t/2, H/2, t, H*2, opts),
  ]);
}

// ===== 衝突・合体 =====
function setupCollision() {
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const a = pair.bodyA, b = pair.bodyB;
      if (a.label === 'wall' || b.label === 'wall') continue;
      const mA = bodies.find(m => m.body === a);
      const mB = bodies.find(m => m.body === b);
      if (!mA || !mB) continue;
      if (mA.idx !== mB.idx) continue;
      if (mA.merging || mB.merging) continue;
      if (mA.idx >= MONSTERS.length - 1) continue;
      mA.merging = mB.merging = true;
      mergeQueue.push([mA, mB]);
    }
  });
}

// ===== ゲームループ =====
function gameLoop(ts) {
  if (!isGameOver) {
    processMergeQueue();
    checkDanger();
  }
  renderGame();
  renderEffects(ts);
  requestAnimationFrame(gameLoop);
}

function processMergeQueue() {
  if (!mergeQueue.length) return;
  const [mA, mB] = mergeQueue.shift();
  if (!world.bodies.includes(mA.body) || !world.bodies.includes(mB.body)) return;

  const newIdx = mA.idx + 1;
  const mx = (mA.body.position.x + mB.body.position.x) / 2;
  const my = (mA.body.position.y + mB.body.position.y) / 2;

  // スコア
  const base = MONSTERS[newIdx].score * 10;
  chainCount++;
  clearTimeout(chainTimer);
  chainTimer = setTimeout(() => { chainCount = 0; }, 1600);
  const mult = Math.min(chainCount, 8);
  score += base * mult;
  document.getElementById('score-display').textContent = score;
  updateChainDisplay(mult);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('monsterMergeBest', bestScore);
    document.getElementById('best-display').textContent = bestScore;
  }

  // エフェクト
  spawnMagicExplosion(mx, my, MONSTERS[mA.idx], mult);
  if (newIdx >= 4) spawnBlastWave(mx, my, newIdx);

  removeMonster(mA);
  removeMonster(mB);

  setTimeout(() => addMonster(newIdx, mx, my, true), 80);

  // 進化名アナウンス
  showLevelUp(MONSTERS[newIdx].name, MONSTERS[newIdx].emoji);
}

function removeMonster(m) {
  World.remove(world, m.body);
  bodies = bodies.filter(b => b !== m);
}

function addMonster(idx, x, y, fromMerge = false) {
  const r = MONSTERS[idx].radius;
  const body = Bodies.circle(x, y, r, {
    restitution: 0.25, friction: 0.45, frictionAir: 0.01, label: 'monster',
  });
  if (fromMerge) Body.setVelocity(body, { x: 0, y: -2 });
  World.add(world, body);
  bodies.push({ body, idx, merging: false });
  return body;
}

// ===== ドロップ =====
function dropMonster(x) {
  if (isDropping || isGameOver) return;
  isDropping = true;
  const r = MONSTERS[currentIdx].radius;
  const cx = Math.max(r + 5, Math.min(W - r - 5, x));
  addMonster(currentIdx, cx, 55, false);
  currentIdx = nextIdx;
  nextIdx    = randomDropIdx();
  drawNextMonster();
  setTimeout(() => { isDropping = false; }, 500);
}

function randomDropIdx() { return Math.floor(Math.random() * 5); }

// ===== 危険ゾーン =====
function checkDanger() {
  let danger = false;
  for (const m of bodies) {
    if (m.body.position.y - MONSTERS[m.idx].radius < 62) { danger = true; break; }
  }
  if (danger) {
    dangerFrames++;
    document.getElementById('danger-line').style.opacity = 0.7 + 0.3 * Math.sin(Date.now() / 80);
    if (dangerFrames > 120) triggerGameOver();
  } else {
    dangerFrames = 0;
    document.getElementById('danger-line').style.opacity = 0.8;
  }
}

// ===== 描画: モンスター =====
function renderGame() {
  gameCtx.clearRect(0, 0, W, H);

  for (const m of bodies) {
    const b = m.body;
    const mon = MONSTERS[m.idx];
    const x = b.position.x, y = b.position.y, r = mon.radius;

    gameCtx.save();
    gameCtx.translate(x, y);

    // 外側グロー（魔力）
    const glow = gameCtx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 1.3);
    glow.addColorStop(0, 'transparent');
    glow.addColorStop(1, mon.magic + '22');
    gameCtx.beginPath();
    gameCtx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
    gameCtx.fillStyle = glow;
    gameCtx.fill();

    // 本体
    const grad = gameCtx.createRadialGradient(-r*0.3, -r*0.3, r*0.05, 0, 0, r);
    grad.addColorStop(0, lightenColor(mon.color, 50));
    grad.addColorStop(0.55, mon.color);
    grad.addColorStop(1, darkenColor(mon.color, 50));
    gameCtx.beginPath();
    gameCtx.arc(0, 0, r, 0, Math.PI * 2);
    gameCtx.fillStyle = grad;
    gameCtx.fill();

    // 縁取り（魔法っぽい）
    gameCtx.strokeStyle = mon.magic + '88';
    gameCtx.lineWidth = 1.5;
    gameCtx.stroke();

    // 光沢
    const shine = gameCtx.createRadialGradient(-r*0.35, -r*0.35, 0, -r*0.35, -r*0.35, r*0.55);
    shine.addColorStop(0, 'rgba(255,255,255,0.3)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    gameCtx.fillStyle = shine;
    gameCtx.fill();

    // Emoji
    gameCtx.rotate(-b.angle);
    const fs = Math.max(10, Math.floor(r * 1.0));
    gameCtx.font = `${fs}px serif`;
    gameCtx.textAlign = 'center';
    gameCtx.textBaseline = 'middle';
    gameCtx.fillText(mon.emoji, 0, 0);

    gameCtx.restore();
  }

  // ガイドライン（魔法陣チック）
  if (!isDropping && !isGameOver) {
    gameCtx.save();
    gameCtx.strokeStyle = 'rgba(212,160,18,0.2)';
    gameCtx.setLineDash([3, 7]);
    gameCtx.lineWidth = 1;
    gameCtx.beginPath();
    gameCtx.moveTo(mouseX, 0);
    gameCtx.lineTo(mouseX, H);
    gameCtx.stroke();
    gameCtx.restore();
  }
}

// ===== 描画: エフェクト =====
function renderEffects(ts) {
  effectCtx.clearRect(0, 0, W, H);

  // エンバー（残り火）
  for (const e of embers) {
    e.x += e.vx + Math.sin(ts * 0.001 + e.phase) * 0.3;
    e.y += e.vy;
    e.life -= 0.002;
    if (e.life <= 0) { e.x = Math.random() * W; e.y = H + 5; e.life = 0.6 + Math.random() * 0.4; }
    effectCtx.save();
    effectCtx.globalAlpha = e.life * 0.7;
    effectCtx.beginPath();
    effectCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    effectCtx.fillStyle = e.color;
    effectCtx.shadowColor = e.color;
    effectCtx.shadowBlur = 6;
    effectCtx.fill();
    effectCtx.restore();
  }

  // パーティクル
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.06; p.vx *= 0.97;
    p.rot = (p.rot || 0) + (p.rotSpeed || 0);
    p.life -= p.decay;
    if (p.life <= 0) { particles.splice(i, 1); continue; }

    effectCtx.save();
    effectCtx.globalAlpha = p.life;
    effectCtx.translate(p.x, p.y);

    if (p.type === 'rune') {
      effectCtx.rotate(p.rot);
      effectCtx.font = `${p.size * 2}px serif`;
      effectCtx.textAlign = 'center';
      effectCtx.textBaseline = 'middle';
      effectCtx.fillStyle = p.color;
      effectCtx.shadowColor = p.color;
      effectCtx.shadowBlur = 10;
      effectCtx.fillText(p.char, 0, 0);
    } else if (p.type === 'spark') {
      effectCtx.beginPath();
      effectCtx.arc(0, 0, p.size, 0, Math.PI * 2);
      effectCtx.fillStyle = p.color;
      effectCtx.shadowColor = p.color;
      effectCtx.shadowBlur = 8;
      effectCtx.fill();
    } else if (p.type === 'ring') {
      effectCtx.translate(-p.x, -p.y); // back to canvas coords for arc
      effectCtx.beginPath();
      effectCtx.arc(p.x, p.y, p.size * (2 - p.life), 0, Math.PI * 2);
      effectCtx.strokeStyle = p.color;
      effectCtx.lineWidth = 2.5 * p.life;
      effectCtx.shadowColor = p.color;
      effectCtx.shadowBlur = 12;
      effectCtx.stroke();
    } else if (p.type === 'magic-circle') {
      effectCtx.translate(-p.x, -p.y);
      drawMagicCircle(effectCtx, p.x, p.y, p.size * (1 + (1 - p.life)), p.color, p.life);
    }

    effectCtx.restore();
  }
}

function drawMagicCircle(ctx, x, y, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  // 外円
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  // 内円
  ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.stroke();
  // 五芒星ライン
  for (let i = 0; i < 5; i++) {
    const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
    ctx.lineTo(x + Math.cos(a2) * r, y + Math.sin(a2) * r);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== 魔法爆発エフェクト =====
const RUNES = ['✦','★','✸','⚡','☽','✺','⚔','🔮','💎','⭐'];

function spawnMagicExplosion(x, y, monster, chainMult) {
  const cnt = 10 + chainMult * 3;
  const col = monster.magic;

  // スパーク
  for (let i = 0; i < cnt; i++) {
    const angle = (i / cnt) * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      type: 'spark', x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      size: 2.5 + Math.random() * 3,
      color: col, life: 1,
      decay: 0.018 + Math.random() * 0.015,
    });
  }

  // ルーン文字（魔法エフェクト）
  for (let i = 0; i < 5 + chainMult; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    particles.push({
      type: 'rune', x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 6 + Math.random() * 4,
      color: col,
      char: RUNES[Math.floor(Math.random() * RUNES.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      life: 1,
      decay: 0.02 + Math.random() * 0.015,
    });
  }

  // 魔法陣リング
  particles.push({
    type: 'magic-circle', x, y, vx: 0, vy: 0,
    size: 30 + chainMult * 8, color: col, life: 1, decay: 0.035,
  });
  particles.push({
    type: 'ring', x, y, vx: 0, vy: 0,
    size: 20 + chainMult * 6, color: col, life: 0.8, decay: 0.04,
  });

  if (chainMult >= 2) showChainPopup(chainMult);
}

// ===== 爆風 =====
function spawnBlastWave(x, y, newIdx) {
  const br = MONSTERS[newIdx].radius * 4;
  const f  = newIdx * 0.003;
  for (const m of bodies) {
    if (m.merging) continue;
    const dx = m.body.position.x - x;
    const dy = m.body.position.y - y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < br && dist > 0) {
      const fo = 1 - dist / br;
      Body.applyForce(m.body, m.body.position, {
        x: (dx/dist) * f * fo,
        y: (dy/dist) * f * fo - f * 0.4,
      });
    }
  }
  // 爆風リング
  for (let i = 0; i < 3; i++) {
    particles.push({
      type: 'ring', x, y, vx: 0, vy: 0,
      size: br * (0.5 + i * 0.3),
      color: '#ff8800', life: 0.6, decay: 0.04 + i * 0.01,
    });
  }
}

// ===== エンバー生成 =====
function spawnEmbers() {
  const colors = ['#ff4400','#ff8800','#ffcc00','#ff6600','#dd2200'];
  for (let i = 0; i < 20; i++) {
    embers.push({
      x: Math.random() * 420, y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random(), phase: Math.random() * Math.PI * 2,
    });
  }
}

// ===== UI =====
function updateChainDisplay(mult) {
  const el = document.getElementById('chain-display');
  el.textContent = `x${mult}`;
  el.classList.remove('chain-pop');
  void el.offsetWidth;
  el.classList.add('chain-pop');
}

function showChainPopup(mult) {
  const ex = document.getElementById('chain-popup');
  if (ex) ex.remove();
  const el = document.createElement('div');
  el.id = 'chain-popup';
  el.textContent = `⚔️ COMBO x${mult}!`;
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 750);
}

function showLevelUp(name, emoji) {
  const ex = document.getElementById('levelup-popup');
  if (ex) ex.remove();
  const el = document.createElement('div');
  el.id = 'levelup-popup';
  el.innerHTML = `${emoji}<br><span style="font-size:0.9rem">${name} 召喚！</span>`;
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ===== ネクスト描画 =====
function drawNextMonster() {
  const mon = MONSTERS[nextIdx];
  const cx = 30, cy = 30, r = Math.min(mon.radius, 24);
  nextCtx.clearRect(0, 0, 60, 60);

  const grad = nextCtx.createRadialGradient(cx-r*0.3, cy-r*0.3, r*0.05, cx, cy, r);
  grad.addColorStop(0, lightenColor(mon.color, 50));
  grad.addColorStop(0.55, mon.color);
  grad.addColorStop(1, darkenColor(mon.color, 50));
  nextCtx.beginPath(); nextCtx.arc(cx, cy, r, 0, Math.PI*2);
  nextCtx.fillStyle = grad; nextCtx.fill();
  nextCtx.strokeStyle = mon.magic + '99'; nextCtx.lineWidth = 1.5; nextCtx.stroke();

  const fs = Math.max(8, Math.floor(r));
  nextCtx.font = `${fs}px serif`;
  nextCtx.textAlign = 'center'; nextCtx.textBaseline = 'middle';
  nextCtx.fillText(mon.emoji, cx, cy);
}

// ===== 進化バー =====
function buildEvolutionBar() {
  const list = document.getElementById('evo-list');
  list.innerHTML = '';
  MONSTERS.forEach((mon, i) => {
    const item = document.createElement('div');
    item.className = 'evo-item';
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const r = Math.min(mon.radius * 0.5, 13), cx = 16, cy = 16;
    const g = ctx.createRadialGradient(cx-r*0.3, cy-r*0.3, r*0.05, cx, cy, r);
    g.addColorStop(0, lightenColor(mon.color, 50));
    g.addColorStop(0.55, mon.color);
    g.addColorStop(1, darkenColor(mon.color, 50));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = mon.magic + '88'; ctx.lineWidth = 1; ctx.stroke();
    ctx.font = `${Math.max(6, Math.floor(r))}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(mon.emoji, cx, cy);

    const name = document.createElement('div');
    name.className = 'evo-name';
    name.textContent = mon.name;
    item.appendChild(canvas); item.appendChild(name);
    list.appendChild(item);
    if (i < MONSTERS.length - 1) {
      const arr = document.createElement('div');
      arr.className = 'evo-arrow'; arr.textContent = '→';
      list.appendChild(arr);
    }
  });
}

// ===== 入力 =====
function setupInput() {
  containerEl.addEventListener('mousemove', e => {
    mouseX = e.clientX - containerEl.getBoundingClientRect().left;
  });
  containerEl.addEventListener('click', e => {
    dropMonster(e.clientX - containerEl.getBoundingClientRect().left);
  });
  containerEl.addEventListener('touchstart', e => {
    e.preventDefault();
    mouseX = e.touches[0].clientX - containerEl.getBoundingClientRect().left;
  }, { passive: false });
  containerEl.addEventListener('touchmove', e => {
    e.preventDefault();
    mouseX = e.touches[0].clientX - containerEl.getBoundingClientRect().left;
  }, { passive: false });
  containerEl.addEventListener('touchend', e => {
    e.preventDefault();
    dropMonster(e.changedTouches[0].clientX - containerEl.getBoundingClientRect().left);
  }, { passive: false });
}

// ===== ゲームオーバー =====
function triggerGameOver() {
  if (isGameOver) return;
  isGameOver = true;
  Runner.stop(runner);
  document.getElementById('final-score').textContent = score;
  document.getElementById('gameover-screen').classList.remove('hidden');
}

function restartGame() {
  isGameOver = false; score = 0; chainCount = 0; dangerFrames = 0;
  particles = []; mergeQueue = [];
  document.getElementById('score-display').textContent = '0';
  document.getElementById('chain-display').textContent = 'x1';
  document.getElementById('gameover-screen').classList.add('hidden');
  for (const m of bodies) World.remove(world, m.body);
  bodies = [];
  rebuildWalls();
  Runner.run(runner, engine);
  currentIdx = randomDropIdx(); nextIdx = randomDropIdx();
  drawNextMonster();
}

// ===== ボタン =====
document.getElementById('retry-btn').addEventListener('click', restartGame);
document.getElementById('ranking-btn').addEventListener('click', () => {
  document.getElementById('gameover-screen').classList.add('hidden');
  showRanking();
});
document.getElementById('close-ranking-btn').addEventListener('click', () => {
  document.getElementById('ranking-screen').classList.add('hidden');
});
document.getElementById('submit-score-btn').addEventListener('click', () => {
  const name = document.getElementById('player-name').value.trim() || '名無し';
  if (window.submitScore) {
    window.submitScore(name, score).then(() => {
      document.getElementById('gameover-name-section').innerHTML =
        '<div style="color:#44aa55;font-size:0.85rem;">✅ 殿堂入り！</div>';
    });
  }
});

function showRanking() {
  document.getElementById('ranking-screen').classList.remove('hidden');
  document.getElementById('ranking-list').innerHTML =
    '<div style="color:#7a6040;text-align:center;padding:20px;">読み込み中...</div>';
  if (window.loadRanking) {
    window.loadRanking().then(entries => renderRanking(entries));
  } else {
    renderRanking([]);
  }
}

function renderRanking(entries) {
  const list = document.getElementById('ranking-list');
  if (!entries || !entries.length) {
    list.innerHTML = '<div style="color:#7a6040;text-align:center;padding:20px;">まだ記録がありません</div>';
    return;
  }
  list.innerHTML = '';
  const medals = ['🥇','🥈','🥉'], cls = ['gold','silver','bronze'];
  entries.slice(0, 20).forEach((e, i) => {
    const div = document.createElement('div'); div.className = 'rank-entry';
    const num = document.createElement('div'); num.className = `rank-num ${cls[i]||''}`; num.textContent = medals[i]||`${i+1}`;
    const nm  = document.createElement('div'); nm.className  = 'rank-name';  nm.textContent  = e.name || '名無し';
    const sc  = document.createElement('div'); sc.className  = 'rank-score'; sc.textContent  = (e.score||0).toLocaleString();
    div.appendChild(num); div.appendChild(nm); div.appendChild(sc);
    list.appendChild(div);
  });
}

// ===== カラーユーティリティ =====
function lightenColor(hex, n) { return adjustColor(hex, n); }
function darkenColor(hex, n)  { return adjustColor(hex, -n); }
function adjustColor(hex, n) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + n));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + n));
  const b = Math.min(255, Math.max(0, (num & 0xff) + n));
  return `rgb(${r},${g},${b})`;
}

// ===== START =====
window.addEventListener('DOMContentLoaded', init);
