// ===== MONSTER MERGE QUEST =====
// Dark Fantasy Theme — Matter.js Physics

const { Engine, Runner, Bodies, Body, World, Events } = Matter;

// ===== モンスター定義 =====
// draw関数でCanvas描画するカスタムアート
const MONSTERS = [
  { name: 'スライム',     radius: 12,  color: '#33bb44', score: 1,  magic: '#88ffaa',
    draw: drawSlime },
  { name: 'コウモリ',     radius: 18,  color: '#5533aa', score: 3,  magic: '#bb88ff',
    draw: drawBat },
  { name: 'ゴブリン',     radius: 26,  color: '#2d7a2d', score: 6,  magic: '#66ff66',
    draw: drawGoblin },
  { name: 'スケルトン',   radius: 34,  color: '#c8c8c8', score: 10, magic: '#ffffff',
    draw: drawSkeleton },
  { name: 'オーク',       radius: 44,  color: '#5a3010', score: 15, magic: '#ff9933',
    draw: drawOrc },
  { name: 'ミノタウロス', radius: 54,  color: '#3d1f0a', score: 21, magic: '#ff6622',
    draw: drawMinotaur },
  { name: '魔女',         radius: 66,  color: '#330066', score: 28, magic: '#cc44ff',
    draw: drawWitch },
  { name: 'フェニックス', radius: 80,  color: '#cc3300', score: 36, magic: '#ff6600',
    draw: drawPhoenix },
  { name: 'リッチ王',     radius: 95,  color: '#664400', score: 45, magic: '#ffcc00',
    draw: drawLich },
  { name: '魔王',         radius: 112, color: '#440011', score: 55, magic: '#ff0033',
    draw: drawDemonLord },
];

// ===================================================
// ===== カスタムモンスター描画関数 (ctx, r) =====
// ctx は translate済み（0,0 が中心）
// ===================================================

function drawSlime(ctx, r) {
  // ぷよぷよした体
  const bodyGrad = ctx.createRadialGradient(-r*0.2, -r*0.3, r*0.1, 0, r*0.1, r);
  bodyGrad.addColorStop(0, '#88ffaa');
  bodyGrad.addColorStop(0.5, '#33bb44');
  bodyGrad.addColorStop(1, '#115522');
  ctx.beginPath();
  ctx.ellipse(0, r*0.1, r*0.9, r*0.8, 0, 0, Math.PI*2);
  ctx.fillStyle = bodyGrad; ctx.fill();
  // ツノ
  ctx.fillStyle = '#22aa33';
  ctx.beginPath(); ctx.ellipse(-r*0.25, -r*0.55, r*0.1, r*0.22, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( r*0.25, -r*0.55, r*0.1, r*0.22,  0.3, 0, Math.PI*2); ctx.fill();
  // 目
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-r*0.28, -r*0.1, r*0.14, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( r*0.28, -r*0.1, r*0.14, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-r*0.22, -r*0.15, r*0.06, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( r*0.22, -r*0.15, r*0.06, 0, Math.PI*2); ctx.fill();
  // 光沢
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-r*0.2, -r*0.3, r*0.25, r*0.15, -0.4, 0, Math.PI*2); ctx.fill();
}

function drawBat(ctx, r) {
  const s = r;
  // 翼
  ctx.fillStyle = '#331166';
  ctx.beginPath();
  ctx.moveTo(-s*0.1, 0);
  ctx.bezierCurveTo(-s*0.5, -s*0.6, -s*1.2, -s*0.3, -s*1.1, s*0.3);
  ctx.bezierCurveTo(-s*0.9, s*0.5, -s*0.4, s*0.1, -s*0.1, s*0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s*0.1, 0);
  ctx.bezierCurveTo(s*0.5, -s*0.6, s*1.2, -s*0.3, s*1.1, s*0.3);
  ctx.bezierCurveTo(s*0.9, s*0.5, s*0.4, s*0.1, s*0.1, s*0.2);
  ctx.fill();
  // 翼の筋
  ctx.strokeStyle = '#7744cc'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-s*0.1, 0); ctx.lineTo(-s*0.9, s*0.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s*0.1, 0); ctx.lineTo(-s*0.7, -s*0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.9, s*0.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.7, -s*0.4); ctx.stroke();
  // 体
  const bodyGrad = ctx.createRadialGradient(-s*0.1, -s*0.1, s*0.05, 0, 0, s*0.45);
  bodyGrad.addColorStop(0, '#9966dd');
  bodyGrad.addColorStop(1, '#220055');
  ctx.beginPath(); ctx.ellipse(0, s*0.05, s*0.38, s*0.42, 0, 0, Math.PI*2);
  ctx.fillStyle = bodyGrad; ctx.fill();
  // 耳
  ctx.fillStyle = '#220055';
  ctx.beginPath(); ctx.moveTo(-s*0.2, -s*0.35); ctx.lineTo(-s*0.35, -s*0.7); ctx.lineTo(-s*0.05, -s*0.38); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.2, -s*0.35); ctx.lineTo( s*0.35, -s*0.7); ctx.lineTo( s*0.05, -s*0.38); ctx.fill();
  ctx.fillStyle = '#cc88ff';
  ctx.beginPath(); ctx.moveTo(-s*0.2, -s*0.38); ctx.lineTo(-s*0.3, -s*0.6); ctx.lineTo(-s*0.1, -s*0.4); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.2, -s*0.38); ctx.lineTo( s*0.3, -s*0.6); ctx.lineTo( s*0.1, -s*0.4); ctx.fill();
  // 目（赤く光る）
  ctx.fillStyle = '#ff2200';
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(-s*0.15, -s*0.05, s*0.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.15, -s*0.05, s*0.1, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 牙
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-s*0.1, s*0.18); ctx.lineTo(-s*0.16, s*0.33); ctx.lineTo(-s*0.04, s*0.18); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.1, s*0.18); ctx.lineTo( s*0.16, s*0.33); ctx.lineTo( s*0.04, s*0.18); ctx.fill();
}

function drawGoblin(ctx, r) {
  const s = r;
  // 体
  const bodyGrad = ctx.createRadialGradient(-s*0.1, -s*0.1, s*0.05, 0, 0, s);
  bodyGrad.addColorStop(0, '#55cc44');
  bodyGrad.addColorStop(0.6, '#2d7a2d');
  bodyGrad.addColorStop(1, '#0d3a0d');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bodyGrad; ctx.fill();
  // 耳（大きな尖り耳）
  ctx.fillStyle = '#2d7a2d';
  ctx.beginPath(); ctx.moveTo(-s*0.75, -s*0.1); ctx.lineTo(-s*1.1, -s*0.6); ctx.lineTo(-s*0.5, -s*0.4); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.75, -s*0.1); ctx.lineTo( s*1.1, -s*0.6); ctx.lineTo( s*0.5, -s*0.4); ctx.fill();
  ctx.fillStyle = '#aa3333';
  ctx.beginPath(); ctx.moveTo(-s*0.78, -s*0.18); ctx.lineTo(-s*1.0, -s*0.52); ctx.lineTo(-s*0.58, -s*0.36); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.78, -s*0.18); ctx.lineTo( s*1.0, -s*0.52); ctx.lineTo( s*0.58, -s*0.36); ctx.fill();
  // 目（黄色で邪悪）
  ctx.fillStyle = '#ffee00';
  ctx.beginPath(); ctx.ellipse(-s*0.3, -s*0.18, s*0.18, s*0.14, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.3, -s*0.18, s*0.18, s*0.14, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#220000';
  ctx.beginPath(); ctx.ellipse(-s*0.3, -s*0.18, s*0.09, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.3, -s*0.18, s*0.09, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  // 鼻（上を向いた丸い鼻）
  ctx.fillStyle = '#1e5a1e';
  ctx.beginPath(); ctx.ellipse(0, s*0.08, s*0.18, s*0.13, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0a2e0a';
  ctx.beginPath(); ctx.arc(-s*0.08, s*0.1, s*0.06, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.08, s*0.1, s*0.06, 0, Math.PI*2); ctx.fill();
  // 口（牙）
  ctx.fillStyle = '#0d3a0d';
  ctx.beginPath(); ctx.arc(0, s*0.38, s*0.28, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-s*0.15, s*0.38); ctx.lineTo(-s*0.2, s*0.58); ctx.lineTo(-s*0.05, s*0.38); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.15, s*0.38); ctx.lineTo( s*0.2, s*0.58); ctx.lineTo( s*0.05, s*0.38); ctx.fill();
  // 光沢
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(-s*0.2, -s*0.4, s*0.3, s*0.18, -0.4, 0, Math.PI*2); ctx.fill();
}

function drawSkeleton(ctx, r) {
  const s = r;
  // 背景（暗い）
  const bg = ctx.createRadialGradient(0, 0, s*0.2, 0, 0, s);
  bg.addColorStop(0, '#dddddd'); bg.addColorStop(1, '#666666');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  // 頭蓋骨の輪郭（白）
  ctx.fillStyle = '#eeeeee';
  ctx.beginPath(); ctx.ellipse(0, -s*0.05, s*0.65, s*0.72, 0, 0, Math.PI*2); ctx.fill();
  // あご
  ctx.fillStyle = '#dddddd';
  ctx.beginPath(); ctx.ellipse(0, s*0.52, s*0.42, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  // 目の穴（黒くて深い）
  ctx.fillStyle = '#111';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.ellipse(-s*0.26, -s*0.15, s*0.2, s*0.17, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.26, -s*0.15, s*0.2, s*0.17, 0, 0, Math.PI*2); ctx.fill();
  // 目の光（青白い）
  ctx.shadowColor = '#aaddff'; ctx.shadowBlur = 8;
  ctx.fillStyle = '#aaddff';
  ctx.beginPath(); ctx.arc(-s*0.26, -s*0.15, s*0.08, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.26, -s*0.15, s*0.08, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 鼻の穴
  ctx.fillStyle = '#999';
  ctx.beginPath(); ctx.ellipse(-s*0.09, s*0.18, s*0.07, s*0.1, 0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.09, s*0.18, s*0.07, s*0.1, -0.2, 0, Math.PI*2); ctx.fill();
  // 歯
  ctx.fillStyle = '#fff';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.rect(i*s*0.14 - s*0.06, s*0.38, s*0.11, s*0.2); ctx.fill();
  }
  ctx.fillStyle = '#ccc';
  ctx.beginPath(); ctx.rect(-s*0.42, s*0.36, s*0.84, s*0.06); ctx.fill();
}

function drawOrc(ctx, r) {
  const s = r;
  // 体（ごつい）
  const bg = ctx.createRadialGradient(-s*0.15, -s*0.15, s*0.05, 0, 0, s);
  bg.addColorStop(0, '#7a4a1a'); bg.addColorStop(0.6, '#5a3010'); bg.addColorStop(1, '#2a1005');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  // 皮膚の質感（暗い斑点）
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(-s*0.3, s*0.3, s*0.2, s*0.15, 0.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.4, -s*0.2, s*0.15, s*0.1, -0.3, 0, Math.PI*2); ctx.fill();
  // 眉（太く怒り）
  ctx.fillStyle = '#1a0800';
  ctx.beginPath(); ctx.ellipse(-s*0.3, -s*0.32, s*0.22, s*0.1, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.3, -s*0.32, s*0.22, s*0.1,  0.4, 0, Math.PI*2); ctx.fill();
  // 目（赤く怒り）
  ctx.fillStyle = '#cc2200';
  ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.ellipse(-s*0.3, -s*0.2, s*0.16, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.3, -s*0.2, s*0.16, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-s*0.3, -s*0.2, s*0.07, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.3, -s*0.2, s*0.07, 0, Math.PI*2); ctx.fill();
  // 鼻（でかい）
  ctx.fillStyle = '#3d2008';
  ctx.beginPath(); ctx.ellipse(0, s*0.08, s*0.25, s*0.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a0c03';
  ctx.beginPath(); ctx.arc(-s*0.1, s*0.1, s*0.09, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.1, s*0.1, s*0.09, 0, Math.PI*2); ctx.fill();
  // 口（牙が上に飛び出す）
  ctx.fillStyle = '#1a0800';
  ctx.beginPath(); ctx.arc(0, s*0.42, s*0.32, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#ffffcc';
  ctx.beginPath(); ctx.moveTo(-s*0.18, s*0.3); ctx.lineTo(-s*0.25, s*0.08); ctx.lineTo(-s*0.08, s*0.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.18, s*0.3); ctx.lineTo( s*0.25, s*0.08); ctx.lineTo( s*0.08, s*0.3); ctx.fill();
  // 傷跡
  ctx.strokeStyle = '#2a1005'; ctx.lineWidth = s*0.04;
  ctx.beginPath(); ctx.moveTo(s*0.1, -s*0.55); ctx.lineTo(s*0.25, -s*0.15); ctx.stroke();
  // 光沢
  ctx.fillStyle = 'rgba(255,200,100,0.15)';
  ctx.beginPath(); ctx.ellipse(-s*0.25, -s*0.45, s*0.28, s*0.16, -0.3, 0, Math.PI*2); ctx.fill();
}

function drawMinotaur(ctx, r) {
  const s = r;
  // 体
  const bg = ctx.createRadialGradient(-s*0.1, -s*0.1, s*0.1, 0, 0, s);
  bg.addColorStop(0, '#5a3a1a'); bg.addColorStop(1, '#1a0a02');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  // 角（大きな牛の角）
  ctx.fillStyle = '#c8a044';
  ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.55); ctx.bezierCurveTo(-s*0.6, -s*1.1, -s*1.0, -s*0.8, -s*0.85, -s*0.4); ctx.bezierCurveTo(-s*0.7, -s*0.2, -s*0.45, -s*0.45, -s*0.3, -s*0.55); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.3, -s*0.55); ctx.bezierCurveTo( s*0.6, -s*1.1,  s*1.0, -s*0.8,  s*0.85, -s*0.4); ctx.bezierCurveTo( s*0.7, -s*0.2,  s*0.45, -s*0.45,  s*0.3, -s*0.55); ctx.fill();
  ctx.fillStyle = '#a07830';
  ctx.beginPath(); ctx.moveTo(-s*0.32, -s*0.55); ctx.lineTo(-s*0.85, -s*0.42); ctx.lineTo(-s*0.75, -s*0.3); ctx.lineTo(-s*0.3, -s*0.52); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.32, -s*0.55); ctx.lineTo( s*0.85, -s*0.42); ctx.lineTo( s*0.75, -s*0.3); ctx.lineTo( s*0.3, -s*0.52); ctx.fill();
  // 耳
  ctx.fillStyle = '#3d2010';
  ctx.beginPath(); ctx.ellipse(-s*0.72, -s*0.1, s*0.15, s*0.24, -0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.72, -s*0.1, s*0.15, s*0.24,  0.8, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#cc7777';
  ctx.beginPath(); ctx.ellipse(-s*0.72, -s*0.1, s*0.09, s*0.15, -0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.72, -s*0.1, s*0.09, s*0.15,  0.8, 0, Math.PI*2); ctx.fill();
  // 目
  ctx.fillStyle = '#ff4400'; ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.ellipse(-s*0.28, -s*0.15, s*0.15, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.28, -s*0.15, s*0.15, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 鼻（牛の鼻）
  ctx.fillStyle = '#5a3020';
  ctx.beginPath(); ctx.ellipse(0, s*0.2, s*0.32, s*0.22, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#1a0a05';
  ctx.beginPath(); ctx.arc(-s*0.13, s*0.22, s*0.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.13, s*0.22, s*0.1, 0, Math.PI*2); ctx.fill();
  // 口
  ctx.fillStyle = '#1a0a05';
  ctx.beginPath(); ctx.arc(0, s*0.5, s*0.24, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(-s*0.12, s*0.5); ctx.lineTo(-s*0.17, s*0.3); ctx.lineTo(-s*0.04, s*0.5); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.12, s*0.5); ctx.lineTo( s*0.17, s*0.3); ctx.lineTo( s*0.04, s*0.5); ctx.fill();
}

function drawWitch(ctx, r) {
  const s = r;
  // 体（ローブ）
  const bg = ctx.createRadialGradient(-s*0.1, -s*0.2, s*0.05, 0, 0, s);
  bg.addColorStop(0, '#7722aa'); bg.addColorStop(0.6, '#440077'); bg.addColorStop(1, '#110022');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  // 魔法陣オーラ
  ctx.strokeStyle = '#dd44ff'; ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.arc(0, 0, s*0.92, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, s*0.78, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha = 1;
  // とんがり帽子
  ctx.fillStyle = '#220044';
  ctx.beginPath(); ctx.moveTo(0, -s*1.05); ctx.lineTo(-s*0.45, -s*0.38); ctx.lineTo(s*0.45, -s*0.38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5500aa';
  ctx.beginPath(); ctx.ellipse(0, -s*0.38, s*0.48, s*0.12, 0, 0, Math.PI*2); ctx.fill();
  // 帽子の星
  ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 4;
  ctx.beginPath(); drawStarShape(ctx, 0, -s*0.7, s*0.1, s*0.05, 5); ctx.fill();
  ctx.shadowBlur = 0;
  // 顔（青白い）
  ctx.fillStyle = '#d4ccee';
  ctx.beginPath(); ctx.ellipse(0, s*0.05, s*0.42, s*0.48, 0, 0, Math.PI*2); ctx.fill();
  // 目（紫の魔眼）
  ctx.fillStyle = '#9922ff'; ctx.shadowColor = '#cc44ff'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.ellipse(-s*0.2, -s*0.1, s*0.13, s*0.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.2, -s*0.1, s*0.13, s*0.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-s*0.16, -s*0.13, s*0.05, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.16, -s*0.13, s*0.05, 0, Math.PI*2); ctx.fill();
  // 口（不気味な笑み）
  ctx.strokeStyle = '#551144'; ctx.lineWidth = s*0.05;
  ctx.beginPath(); ctx.arc(0, s*0.25, s*0.18, 0.2, Math.PI-0.2); ctx.stroke();
  // 杖のエフェクト
  ctx.fillStyle = '#cc44ff'; ctx.shadowColor = '#ff88ff'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(-s*0.7, -s*0.3, s*0.1, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
}

function drawStarShape(ctx, cx, cy, outer, inner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r2 = i % 2 === 0 ? outer : inner;
    if (i === 0) ctx.moveTo(cx + Math.cos(angle)*r2, cy + Math.sin(angle)*r2);
    else ctx.lineTo(cx + Math.cos(angle)*r2, cy + Math.sin(angle)*r2);
  }
  ctx.closePath();
}

function drawPhoenix(ctx, r) {
  const s = r;
  // 炎の翼（左）
  const flameL = ctx.createRadialGradient(-s*0.4, 0, s*0.1, -s*0.8, -s*0.3, s*0.9);
  flameL.addColorStop(0, '#ffee00'); flameL.addColorStop(0.4, '#ff6600'); flameL.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.moveTo(-s*0.2, 0);
  ctx.bezierCurveTo(-s*0.5, -s*0.5, -s*1.2, -s*0.8, -s*1.1, s*0.1);
  ctx.bezierCurveTo(-s*0.9, s*0.4, -s*0.4, s*0.2, -s*0.2, s*0.1);
  ctx.fillStyle = flameL; ctx.fill();
  // 炎の翼（右）
  const flameR = ctx.createRadialGradient(s*0.4, 0, s*0.1, s*0.8, -s*0.3, s*0.9);
  flameR.addColorStop(0, '#ffee00'); flameR.addColorStop(0.4, '#ff6600'); flameR.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.moveTo(s*0.2, 0);
  ctx.bezierCurveTo(s*0.5, -s*0.5, s*1.2, -s*0.8, s*1.1, s*0.1);
  ctx.bezierCurveTo(s*0.9, s*0.4, s*0.4, s*0.2, s*0.2, s*0.1);
  ctx.fillStyle = flameR; ctx.fill();
  // 尾羽（炎）
  for (let i = -2; i <= 2; i++) {
    const tailGrad = ctx.createLinearGradient(i*s*0.15, s*0.3, i*s*0.1, s*1.1);
    tailGrad.addColorStop(0, '#ff8800'); tailGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(i*s*0.18, s*0.4);
    ctx.bezierCurveTo(i*s*0.3 - s*0.05, s*0.7, i*s*0.2 + s*0.05, s*0.95, i*s*0.1, s*1.1);
    ctx.bezierCurveTo(i*s*0.1 - s*0.08, s*0.95, i*s*0.1 - s*0.1, s*0.7, i*s*0.18, s*0.4);
    ctx.fillStyle = tailGrad; ctx.fill();
  }
  // 体
  const bodyGrad = ctx.createRadialGradient(-s*0.1, -s*0.15, s*0.05, 0, 0, s*0.6);
  bodyGrad.addColorStop(0, '#ffee88'); bodyGrad.addColorStop(0.5, '#ff6600'); bodyGrad.addColorStop(1, '#880000');
  ctx.beginPath(); ctx.ellipse(0, 0, s*0.52, s*0.62, 0, 0, Math.PI*2);
  ctx.fillStyle = bodyGrad; ctx.fill();
  // くちばし
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath(); ctx.moveTo(0, -s*0.42); ctx.lineTo(s*0.12, -s*0.28); ctx.lineTo(-s*0.12, -s*0.28); ctx.fill();
  // 目
  ctx.fillStyle = '#ffee00'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(-s*0.2, -s*0.22, s*0.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.2, -s*0.22, s*0.1, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-s*0.2, -s*0.22, s*0.05, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.2, -s*0.22, s*0.05, 0, Math.PI*2); ctx.fill();
  // 冠の羽
  ctx.fillStyle = '#ffcc00';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i*s*0.18, -s*0.55);
    ctx.bezierCurveTo(i*s*0.22, -s*0.85, i*s*0.18 + s*0.08, -s*0.92, i*s*0.05, -s*0.88);
    ctx.bezierCurveTo(i*s*0.02 - s*0.08, -s*0.85, i*s*0.08, -s*0.72, i*s*0.18, -s*0.55);
    ctx.fill();
  }
}

function drawLich(ctx, r) {
  const s = r;
  // 体（金と黒のローブ）
  const bg = ctx.createRadialGradient(-s*0.1, -s*0.1, s*0.05, 0, 0, s);
  bg.addColorStop(0, '#aa8800'); bg.addColorStop(0.5, '#664400'); bg.addColorStop(1, '#110800');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  // ゴールドの紋章リング
  ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = s*0.04;
  ctx.beginPath(); ctx.arc(0, 0, s*0.82, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = '#aa8800'; ctx.lineWidth = s*0.02;
  ctx.beginPath(); ctx.arc(0, 0, s*0.7, 0, Math.PI*2); ctx.stroke();
  // 王冠
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(-s*0.42, -s*0.48);
  ctx.lineTo(-s*0.42, -s*0.7);
  ctx.lineTo(-s*0.27, -s*0.58);
  ctx.lineTo(-s*0.12, -s*0.82);
  ctx.lineTo( s*0.02, -s*0.6);
  ctx.lineTo( s*0.16, -s*0.82);
  ctx.lineTo( s*0.3,  -s*0.58);
  ctx.lineTo( s*0.44, -s*0.7);
  ctx.lineTo( s*0.44, -s*0.48);
  ctx.closePath(); ctx.fill();
  // 王冠の宝石
  ctx.fillStyle = '#ff2200'; ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.arc(-s*0.12, -s*0.78, s*0.06, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0044ff';
  ctx.beginPath(); ctx.arc( s*0.16, -s*0.78, s*0.06, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 頭蓋骨の顔
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath(); ctx.ellipse(0, s*0.05, s*0.5, s*0.55, 0, 0, Math.PI*2); ctx.fill();
  // 目（禍々しく輝く）
  ctx.fillStyle = '#ffaa00'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.ellipse(-s*0.22, -s*0.1, s*0.17, s*0.14, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.22, -s*0.1, s*0.17, s*0.14, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-s*0.22, -s*0.1, s*0.07, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.22, -s*0.1, s*0.07, 0, Math.PI*2); ctx.fill();
  // 歯
  ctx.fillStyle = '#fff';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.rect(i*s*0.12 - s*0.05, s*0.32, s*0.09, s*0.18); ctx.fill();
  }
  ctx.fillStyle = '#ddd';
  ctx.beginPath(); ctx.rect(-s*0.38, s*0.3, s*0.76, s*0.06); ctx.fill();
}

function drawDemonLord(ctx, r) {
  const s = r;
  // 魔のオーラ
  const aura = ctx.createRadialGradient(0, 0, s*0.5, 0, 0, s*1.2);
  aura.addColorStop(0, 'transparent'); aura.addColorStop(0.7, '#ff002244'); aura.addColorStop(1, 'transparent');
  ctx.beginPath(); ctx.arc(0, 0, s*1.15, 0, Math.PI*2);
  ctx.fillStyle = aura; ctx.fill();
  // 体
  const bg = ctx.createRadialGradient(-s*0.1, -s*0.15, s*0.05, 0, 0, s);
  bg.addColorStop(0, '#880022'); bg.addColorStop(0.5, '#440011'); bg.addColorStop(1, '#0d0005');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2);
  ctx.fillStyle = bg; ctx.fill();
  // 大きな角（2対）
  ctx.fillStyle = '#1a0005';
  // 外側の角
  ctx.beginPath(); ctx.moveTo(-s*0.45, -s*0.55); ctx.bezierCurveTo(-s*0.8, -s*1.15, -s*1.15, -s*0.9, -s*0.95, -s*0.45); ctx.bezierCurveTo(-s*0.8, -s*0.2, -s*0.55, -s*0.42, -s*0.45, -s*0.55); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.45, -s*0.55); ctx.bezierCurveTo( s*0.8, -s*1.15,  s*1.15, -s*0.9,  s*0.95, -s*0.45); ctx.bezierCurveTo( s*0.8, -s*0.2,  s*0.55, -s*0.42,  s*0.45, -s*0.55); ctx.fill();
  ctx.fillStyle = '#330008';
  // 内側の角
  ctx.beginPath(); ctx.moveTo(-s*0.25, -s*0.6); ctx.bezierCurveTo(-s*0.35, -s*0.95, -s*0.65, -s*0.8, -s*0.55, -s*0.5); ctx.bezierCurveTo(-s*0.45, -s*0.32, -s*0.3, -s*0.5, -s*0.25, -s*0.6); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.25, -s*0.6); ctx.bezierCurveTo( s*0.35, -s*0.95,  s*0.65, -s*0.8,  s*0.55, -s*0.5); ctx.bezierCurveTo( s*0.45, -s*0.32,  s*0.3, -s*0.5,  s*0.25, -s*0.6); ctx.fill();
  // 翼の痕跡
  ctx.fillStyle = 'rgba(180,0,20,0.4)';
  ctx.beginPath(); ctx.moveTo(-s*0.5, s*0.1); ctx.bezierCurveTo(-s*0.9, -s*0.3, -s*1.1, s*0.4, -s*0.8, s*0.6); ctx.bezierCurveTo(-s*0.6, s*0.7, -s*0.5, s*0.4, -s*0.5, s*0.1); ctx.fill();
  ctx.beginPath(); ctx.moveTo( s*0.5, s*0.1); ctx.bezierCurveTo( s*0.9, -s*0.3,  s*1.1, s*0.4,  s*0.8, s*0.6); ctx.bezierCurveTo( s*0.6, s*0.7,  s*0.5, s*0.4,  s*0.5, s*0.1); ctx.fill();
  // 目（真っ赤に燃える）
  ctx.fillStyle = '#ff0000'; ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.ellipse(-s*0.28, -s*0.18, s*0.2, s*0.15, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.28, -s*0.18, s*0.2, s*0.15, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 縦スリット瞳
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(-s*0.28, -s*0.18, s*0.06, s*0.13, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.28, -s*0.18, s*0.06, s*0.13, 0, 0, Math.PI*2); ctx.fill();
  // 口（大きく裂けた）
  ctx.fillStyle = '#0d0005';
  ctx.beginPath(); ctx.arc(0, s*0.38, s*0.38, 0, Math.PI); ctx.fill();
  // 牙（複数）
  ctx.fillStyle = '#ffeecc';
  const fanPos = [-0.28, -0.12, 0.12, 0.28];
  fanPos.forEach(fp => {
    ctx.beginPath(); ctx.moveTo(fp*s, s*0.38); ctx.lineTo((fp-0.06)*s, s*0.66); ctx.lineTo((fp+0.06)*s, s*0.38); ctx.fill();
  });
  // 額の紋章
  ctx.fillStyle = '#ff4400'; ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 8;
  drawStarShape(ctx, 0, -s*0.48, s*0.12, s*0.06, 6);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ===== ゲーム状態 =====
let engine, world, runner;
let gameCanvas, effectCanvas, nextCanvas;
let gameCtx, effectCtx, nextCtx;
let containerEl;
let W, H;

let bodies       = [];
let particles    = [];
let embers       = [];
let score        = 0;
let bestScore    = 0;
let chainCount   = 0;
let chainTimer   = null;
let nextIdx      = 0;
let currentIdx   = 0;
let mouseX       = 200;
let isTouching   = false;   // タッチ/マウス押下中
let isDropping   = false;
let isGameOver   = false;
let mergeQueue   = [];
let dangerFrames = 0;

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

  // 物理エンジンは一旦止める（タイトル画面中は動かさない）
  Runner.stop(runner);

  // タイトル画面を表示
  document.getElementById('title-screen').classList.remove('hidden');

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
  // gravity を小さくしてゆっくり落下
  engine = Engine.create({ gravity: { y: 0.5 } });
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

  spawnMagicExplosion(mx, my, MONSTERS[mA.idx], mult);
  if (newIdx >= 4) spawnBlastWave(mx, my, newIdx);

  removeMonster(mA);
  removeMonster(mB);
  setTimeout(() => addMonster(newIdx, mx, my, true), 80);
  showLevelUp(MONSTERS[newIdx].name);
}

function removeMonster(m) {
  World.remove(world, m.body);
  bodies = bodies.filter(b => b !== m);
}

function addMonster(idx, x, y, fromMerge = false) {
  const r = MONSTERS[idx].radius;
  const body = Bodies.circle(x, y, r, {
    restitution: 0.25, friction: 0.45, frictionAir: 0.02, label: 'monster',
  });
  if (fromMerge) Body.setVelocity(body, { x: 0, y: -1.5 });
  World.add(world, body);
  bodies.push({ body, idx, merging: false });
  return body;
}

// ===== ドロップ =====
function dropMonster() {
  if (isDropping || isGameOver) return;
  isDropping = true;
  const r = MONSTERS[currentIdx].radius;
  const cx = Math.max(r + 5, Math.min(W - r - 5, mouseX));
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

// ===== モンスター描画ヘルパー =====
function drawMonsterAt(ctx, idx, x, y, angle) {
  const mon = MONSTERS[idx];
  const r   = mon.radius;
  ctx.save();
  ctx.translate(x, y);

  // 外側グロー
  const glow = ctx.createRadialGradient(0, 0, r*0.7, 0, 0, r*1.35);
  glow.addColorStop(0, 'transparent');
  glow.addColorStop(1, mon.magic + '33');
  ctx.beginPath(); ctx.arc(0, 0, r*1.35, 0, Math.PI*2);
  ctx.fillStyle = glow; ctx.fill();

  // クリップ円
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.clip();

  // カスタム描画（角度反映）
  ctx.save();
  ctx.rotate(angle);
  mon.draw(ctx, r);
  ctx.restore();

  ctx.restore();

  // 縁取り（クリップ外）
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.strokeStyle = mon.magic + 'aa';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// ===== 描画: ゲーム =====
function renderGame() {
  gameCtx.clearRect(0, 0, W, H);

  // 落下前プレビュー
  if (!isGameOver) {
    const mon = MONSTERS[currentIdx];
    const r   = mon.radius;
    const cx  = Math.max(r + 5, Math.min(W - r - 5, mouseX));
    const previewY = 55;

    // 点線ガイド
    gameCtx.save();
    gameCtx.strokeStyle = 'rgba(212,160,18,0.25)';
    gameCtx.setLineDash([4, 6]);
    gameCtx.lineWidth = 1;
    gameCtx.beginPath(); gameCtx.moveTo(cx, previewY + r); gameCtx.lineTo(cx, H);
    gameCtx.stroke();
    gameCtx.restore();

    // プレビューモンスター（半透明）
    gameCtx.save();
    gameCtx.globalAlpha = isTouching ? 0.9 : 0.55;
    drawMonsterAt(gameCtx, currentIdx, cx, previewY, 0);
    gameCtx.restore();
  }

  // 落下中・積み上がったモンスター
  for (const m of bodies) {
    drawMonsterAt(gameCtx, m.idx, m.body.position.x, m.body.position.y, m.body.angle);
  }
}

// ===== 描画: エフェクト =====
function renderEffects(ts) {
  effectCtx.clearRect(0, 0, W, H);

  for (const e of embers) {
    e.x += e.vx + Math.sin(ts * 0.001 + e.phase) * 0.3;
    e.y += e.vy;
    e.life -= 0.002;
    if (e.life <= 0) { e.x = Math.random() * W; e.y = H + 5; e.life = 0.6 + Math.random() * 0.4; }
    effectCtx.save();
    effectCtx.globalAlpha = e.life * 0.7;
    effectCtx.beginPath(); effectCtx.arc(e.x, e.y, e.size, 0, Math.PI*2);
    effectCtx.fillStyle = e.color;
    effectCtx.shadowColor = e.color; effectCtx.shadowBlur = 6;
    effectCtx.fill();
    effectCtx.restore();
  }

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
      effectCtx.textAlign = 'center'; effectCtx.textBaseline = 'middle';
      effectCtx.fillStyle = p.color;
      effectCtx.shadowColor = p.color; effectCtx.shadowBlur = 10;
      effectCtx.fillText(p.char, 0, 0);
    } else if (p.type === 'spark') {
      effectCtx.beginPath(); effectCtx.arc(0, 0, p.size, 0, Math.PI*2);
      effectCtx.fillStyle = p.color;
      effectCtx.shadowColor = p.color; effectCtx.shadowBlur = 8;
      effectCtx.fill();
    } else if (p.type === 'ring') {
      effectCtx.translate(-p.x, -p.y);
      effectCtx.beginPath(); effectCtx.arc(p.x, p.y, p.size * (2 - p.life), 0, Math.PI*2);
      effectCtx.strokeStyle = p.color;
      effectCtx.lineWidth = 2.5 * p.life;
      effectCtx.shadowColor = p.color; effectCtx.shadowBlur = 12;
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
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r*0.6, 0, Math.PI*2); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a1 = (i/5)*Math.PI*2 - Math.PI/2;
    const a2 = ((i+2)/5)*Math.PI*2 - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a1)*r, y + Math.sin(a1)*r);
    ctx.lineTo(x + Math.cos(a2)*r, y + Math.sin(a2)*r);
    ctx.stroke();
  }
  ctx.restore();
}

// ===== 魔法爆発 =====
const RUNES = ['✦','★','✸','⚡','☽','✺','⚔','🔮','💎','⭐'];

function spawnMagicExplosion(x, y, monster, chainMult) {
  const cnt = 10 + chainMult * 3;
  const col = monster.magic;
  for (let i = 0; i < cnt; i++) {
    const angle = (i/cnt)*Math.PI*2;
    const speed = 1.5 + Math.random()*3;
    particles.push({ type:'spark', x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-1.5, size:2.5+Math.random()*3, color:col, life:1, decay:0.018+Math.random()*0.015 });
  }
  for (let i = 0; i < 5 + chainMult; i++) {
    const angle = Math.random()*Math.PI*2, speed = 1+Math.random()*2;
    particles.push({ type:'rune', x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-2, size:6+Math.random()*4, color:col, char:RUNES[Math.floor(Math.random()*RUNES.length)], rot:Math.random()*Math.PI*2, rotSpeed:(Math.random()-0.5)*0.15, life:1, decay:0.02+Math.random()*0.015 });
  }
  particles.push({ type:'magic-circle', x, y, vx:0, vy:0, size:30+chainMult*8, color:col, life:1, decay:0.035 });
  particles.push({ type:'ring', x, y, vx:0, vy:0, size:20+chainMult*6, color:col, life:0.8, decay:0.04 });
  if (chainMult >= 2) showChainPopup(chainMult);
}

function spawnBlastWave(x, y, newIdx) {
  const br = MONSTERS[newIdx].radius * 4;
  const f  = newIdx * 0.003;
  for (const m of bodies) {
    if (m.merging) continue;
    const dx = m.body.position.x - x, dy = m.body.position.y - y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < br && dist > 0) {
      const fo = 1 - dist/br;
      Body.applyForce(m.body, m.body.position, { x:(dx/dist)*f*fo, y:(dy/dist)*f*fo - f*0.4 });
    }
  }
  for (let i = 0; i < 3; i++) {
    particles.push({ type:'ring', x, y, vx:0, vy:0, size:br*(0.5+i*0.3), color:'#ff8800', life:0.6, decay:0.04+i*0.01 });
  }
}

function spawnEmbers() {
  const colors = ['#ff4400','#ff8800','#ffcc00','#ff6600','#dd2200'];
  for (let i = 0; i < 20; i++) {
    embers.push({ x:Math.random()*420, y:Math.random()*600, vx:(Math.random()-0.5)*0.4, vy:-0.3-Math.random()*0.5, size:1+Math.random()*2, color:colors[Math.floor(Math.random()*colors.length)], life:Math.random(), phase:Math.random()*Math.PI*2 });
  }
}

// ===== UI =====
function updateChainDisplay(mult) {
  const el = document.getElementById('chain-display');
  el.textContent = `x${mult}`;
  el.classList.remove('chain-pop'); void el.offsetWidth; el.classList.add('chain-pop');
}
function showChainPopup(mult) {
  const ex = document.getElementById('chain-popup'); if (ex) ex.remove();
  const el = document.createElement('div'); el.id = 'chain-popup';
  el.textContent = `⚔️ COMBO x${mult}!`;
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 750);
}
function showLevelUp(name) {
  const ex = document.getElementById('levelup-popup'); if (ex) ex.remove();
  const el = document.createElement('div'); el.id = 'levelup-popup';
  el.innerHTML = `<span style="font-size:0.9rem">${name} 召喚！</span>`;
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ===== ネクスト描画（カスタムアート） =====
function drawNextMonster() {
  const cx = 30, cy = 30;
  const mon = MONSTERS[nextIdx];
  const r   = Math.min(mon.radius, 22);
  nextCtx.clearRect(0, 0, 60, 60);

  // グロー
  const glow = nextCtx.createRadialGradient(cx, cy, r*0.6, cx, cy, r*1.3);
  glow.addColorStop(0, 'transparent'); glow.addColorStop(1, mon.magic + '33');
  nextCtx.beginPath(); nextCtx.arc(cx, cy, r*1.3, 0, Math.PI*2);
  nextCtx.fillStyle = glow; nextCtx.fill();

  // クリップして描画
  nextCtx.save();
  nextCtx.translate(cx, cy);
  nextCtx.beginPath(); nextCtx.arc(0, 0, r, 0, Math.PI*2); nextCtx.clip();
  mon.draw(nextCtx, r);
  nextCtx.restore();

  // 縁取り
  nextCtx.beginPath(); nextCtx.arc(cx, cy, r, 0, Math.PI*2);
  nextCtx.strokeStyle = mon.magic + 'aa'; nextCtx.lineWidth = 1.5; nextCtx.stroke();
}

// ===== 進化バー =====
function buildEvolutionBar() {
  const list = document.getElementById('evo-list');
  list.innerHTML = '';
  MONSTERS.forEach((mon, i) => {
    const item = document.createElement('div'); item.className = 'evo-item';
    const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const r = Math.min(mon.radius*0.5, 12), cx = 16, cy = 16;
    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.clip();
    mon.draw(ctx, r);
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = mon.magic + '88'; ctx.lineWidth = 1; ctx.stroke();
    const name = document.createElement('div'); name.className = 'evo-name'; name.textContent = mon.name;
    item.appendChild(canvas); item.appendChild(name); list.appendChild(item);
    if (i < MONSTERS.length - 1) {
      const arr = document.createElement('div'); arr.className = 'evo-arrow'; arr.textContent = '→';
      list.appendChild(arr);
    }
  });
}

// ===== 入力 =====
function setupInput() {
  // マウス
  containerEl.addEventListener('mousemove', e => {
    mouseX = e.clientX - containerEl.getBoundingClientRect().left;
  });
  containerEl.addEventListener('mousedown', e => {
    isTouching = true;
    mouseX = e.clientX - containerEl.getBoundingClientRect().left;
  });
  containerEl.addEventListener('mouseup', e => {
    if (!isTouching) return;
    isTouching = false;
    dropMonster();
  });
  containerEl.addEventListener('mouseleave', () => { isTouching = false; });

  // タッチ
  containerEl.addEventListener('touchstart', e => {
    e.preventDefault();
    isTouching = true;
    mouseX = e.touches[0].clientX - containerEl.getBoundingClientRect().left;
  }, { passive: false });
  containerEl.addEventListener('touchmove', e => {
    e.preventDefault();
    mouseX = e.touches[0].clientX - containerEl.getBoundingClientRect().left;
  }, { passive: false });
  containerEl.addEventListener('touchend', e => {
    e.preventDefault();
    isTouching = false;
    dropMonster();
  }, { passive: false });
}

// ===== タイトル画面 =====
function showTitle() {
  // ゲーム状態リセット
  isGameOver = false; score = 0; chainCount = 0; dangerFrames = 0;
  particles = []; mergeQueue = []; isTouching = false;
  document.getElementById('score-display').textContent = '0';
  document.getElementById('chain-display').textContent = 'x1';
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('ranking-screen').classList.add('hidden');
  for (const m of bodies) World.remove(world, m.body);
  bodies = [];
  rebuildWalls();
  Runner.stop(runner);
  document.getElementById('title-screen').classList.remove('hidden');
}

function startGame() {
  document.getElementById('title-screen').classList.add('hidden');
  Runner.run(runner, engine);
  currentIdx = randomDropIdx(); nextIdx = randomDropIdx();
  drawNextMonster();
}

// ===== 確認ダイアログ =====
function showConfirm(message, onYes) {
  // 既存を削除
  const ex = document.getElementById('confirm-screen');
  if (ex) ex.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-screen';
  overlay.innerHTML = `
    <div id="confirm-box">
      <div id="confirm-title">⚠️ 確認</div>
      <div id="confirm-msg">${message}</div>
      <div id="confirm-buttons">
        <button id="confirm-yes">はい</button>
        <button id="confirm-no">キャンセル</button>
      </div>
    </div>
  `;
  document.getElementById('app').appendChild(overlay);

  document.getElementById('confirm-yes').addEventListener('click', () => {
    overlay.remove();
    onYes();
  });
  document.getElementById('confirm-no').addEventListener('click', () => {
    overlay.remove();
  });
}

// ===== ゲームオーバー =====
function triggerGameOver() {
  if (isGameOver) return;
  isGameOver = true;
  Runner.stop(runner);
  document.getElementById('final-score').textContent = score;
  // スコア登録欄をリセット
  document.getElementById('gameover-name-section').innerHTML = `
    <input id="player-name" type="text" placeholder="冒険者の名前..." maxlength="12">
    <button id="submit-score-btn">殿堂入り</button>
  `;
  // 登録ボタンの再バインド
  document.getElementById('submit-score-btn').addEventListener('click', submitScoreHandler);
  document.getElementById('gameover-screen').classList.remove('hidden');
}

function restartGame() {
  isGameOver = false; score = 0; chainCount = 0; dangerFrames = 0;
  particles = []; mergeQueue = []; isTouching = false;
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

// ===== スコア登録ハンドラ =====
function submitScoreHandler() {
  const name = document.getElementById('player-name').value.trim() || '名無し';
  if (window.submitScore) {
    window.submitScore(name, score).then(() => {
      document.getElementById('gameover-name-section').innerHTML =
        '<div style="color:#44aa55;font-size:0.85rem;">✅ 殿堂入り！</div>';
      // 2秒後にタイトルへ
      setTimeout(() => showTitle(), 2000);
    });
  }
}

// ===== ボタンバインドはDOMContentLoaded内で行う =====

function showRanking(fromTitle = false) {
  document.getElementById('ranking-screen').classList.remove('hidden');
  document.getElementById('ranking-list').innerHTML =
    '<div style="color:#7a6040;text-align:center;padding:20px;">読み込み中...</div>';
  if (window.loadRanking) { window.loadRanking().then(entries => renderRanking(entries)); }
  else { renderRanking([]); }
}

function renderRanking(entries) {
  const list = document.getElementById('ranking-list');
  if (!entries || !entries.length) {
    list.innerHTML = '<div style="color:#7a6040;text-align:center;padding:20px;">まだ記録がありません</div>'; return;
  }
  list.innerHTML = '';
  const medals=['🥇','🥈','🥉'], cls=['gold','silver','bronze'];
  entries.slice(0,20).forEach((e,i) => {
    const div=document.createElement('div'); div.className='rank-entry';
    const num=document.createElement('div'); num.className=`rank-num ${cls[i]||''}`; num.textContent=medals[i]||`${i+1}`;
    const nm=document.createElement('div');  nm.className='rank-name';  nm.textContent=e.name||'名無し';
    const sc=document.createElement('div');  sc.className='rank-score'; sc.textContent=(e.score||0).toLocaleString();
    div.appendChild(num); div.appendChild(nm); div.appendChild(sc); list.appendChild(div);
  });
}

// ===== カラーユーティリティ =====
function lightenColor(hex, n) { return adjustColor(hex, n); }
function darkenColor(hex, n)  { return adjustColor(hex, -n); }
function adjustColor(hex, n) {
  const num = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (num>>16)+n));
  const g = Math.min(255, Math.max(0, ((num>>8)&0xff)+n));
  const b = Math.min(255, Math.max(0, (num&0xff)+n));
  return `rgb(${r},${g},${b})`;
}

// ===== 起動 =====
window.addEventListener('DOMContentLoaded', () => {
  init();

  // ===== ボタン =====
  document.getElementById('start-btn').addEventListener('click', startGame);

  document.getElementById('title-ranking-btn').addEventListener('click', () => {
    showRanking(true);
  });

  document.getElementById('retry-btn').addEventListener('click', () => {
    document.getElementById('gameover-screen').classList.add('hidden');
    restartGame();
  });

  document.getElementById('ranking-btn').addEventListener('click', () => {
    document.getElementById('gameover-screen').classList.add('hidden');
    showRanking(false);
  });

  document.getElementById('title-btn').addEventListener('click', () => {
    showTitle();
  });

  document.getElementById('close-ranking-btn').addEventListener('click', () => {
    document.getElementById('ranking-screen').classList.add('hidden');
    showTitle();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    if (isGameOver) { restartGame(); return; }
    showConfirm('現在のゲームを終了して<br>最初からやり直しますか？', () => {
      restartGame();
    });
  });
});

