// ===== MONSTER MERGE QUEST =====
// Dark Fantasy Theme — Matter.js Physics

const { Engine, Runner, Bodies, Body, World, Events } = Matter;

// ===== モンスター画像読み込みヘルパー =====
// 画像が用意されている段階は img を優先描画し、
// 画像が読み込めなかった場合は draw 関数（Canvas描画）にフォールバックする
function loadMonsterImg(src) {
  const img = new Image();
  img.onload = () => {
    // ゲーム盤面は毎フレーム再描画されるが、進化バー／NEXT表示は
    // 静的キャンバスなので画像読込完了時に再描画して反映する
    if (typeof buildEvolutionBar === 'function' && document.getElementById('evo-list')) buildEvolutionBar();
    if (typeof drawNextMonster === 'function' && nextCtx) drawNextMonster();
  };
  img.src = src;
  return img;
}

// ===== モンスター定義 =====
// img があれば画像描画、無ければ draw 関数でCanvas描画（フォールバック）
const MONSTERS = [
  { name: 'スライム',     radius: 12,  color: '#33bb44', score: 1,  magic: '#88ffaa',
    img: loadMonsterImg('monster-slime.png'), draw: drawSlime },
  { name: 'コウモリ',     radius: 18,  color: '#5533aa', score: 3,  magic: '#bb88ff',
    img: loadMonsterImg('monster-bat.png'), draw: drawBat },
  { name: 'ピクシー',     radius: 26,  color: '#2d7a2d', score: 6,  magic: '#ff99dd',
    img: loadMonsterImg('monster-pixie.png'), draw: drawGoblin },
  { name: 'スケルトン',   radius: 34,  color: '#c8c8c8', score: 10, magic: '#ffffff',
    img: loadMonsterImg('monster-skeleton.png'), draw: drawSkeleton },
  { name: 'ケンタウルス', radius: 44,  color: '#5a3010', score: 15, magic: '#88cc44',
    img: loadMonsterImg('monster-centaur.png'), draw: drawOrc },
  { name: 'ミノタウロス', radius: 54,  color: '#3d1f0a', score: 21, magic: '#ff6622',
    img: loadMonsterImg('monster-minotaur.png'), draw: drawMinotaur },
  { name: '魔女',         radius: 66,  color: '#330066', score: 28, magic: '#cc44ff',
    img: loadMonsterImg('monster-witch.png'), draw: drawWitch },
  { name: 'フェニックス', radius: 80,  color: '#cc3300', score: 36, magic: '#ff6600',
    img: loadMonsterImg('monster-phoenix.png'), draw: drawPhoenix },
  { name: 'ドラゴン',     radius: 95,  color: '#664400', score: 45, magic: '#3388ff',
    img: loadMonsterImg('monster-dragon.png'), draw: drawLich },
  { name: '魔王',         radius: 112, color: '#440011', score: 55, magic: '#ff0033',
    img: loadMonsterImg('monster-demonlord.png'), draw: drawDemonLord },
];

// ===== 特殊モンスター =====
const SPECIAL_MONSTERS = {
  bomb: {
    name: '爆弾スライム', radius: 30, color: '#1a1a1a', magic: '#ff5500', score: 0,
    draw: drawBombMonster, specialType: 'bomb',
  },
  rainbow: {
    name: '虹スライム', radius: 30, color: '#ffffff', magic: '#ffffff', score: 0,
    draw: drawRainbowMonster, specialType: 'rainbow',
  },
};

// idxが通常の階層番号でも特殊モンスターのキー('bomb'/'rainbow')でも解決できるヘルパー
function monsterDef(idx) {
  return (typeof idx === 'string') ? SPECIAL_MONSTERS[idx] : MONSTERS[idx];
}

// ===================================================
// ===== カスタムモンスター描画関数 (ctx, r) =====
// ctx は translate済み（0,0 が中心）
// ===================================================

function drawBombMonster(ctx, r) {
  const s = r;
  const bg = ctx.createRadialGradient(-s*0.2, -s*0.2, s*0.1, 0, 0, s);
  bg.addColorStop(0, '#555555'); bg.addColorStop(0.6, '#1c1c1c'); bg.addColorStop(1, '#000000');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2); ctx.fillStyle = bg; ctx.fill();
  // 導火線
  ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = s*0.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -s*0.92); ctx.quadraticCurveTo(s*0.35, -s*1.25, s*0.18, -s*1.5); ctx.stroke();
  // 火花
  ctx.fillStyle = '#ffdd33'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(s*0.18, -s*1.5, s*0.14, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 顔（怒った目）
  ctx.fillStyle = '#ff3300'; ctx.shadowColor = '#ff5500'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.ellipse(-s*0.22, -s*0.05, s*0.13, s*0.09, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( s*0.22, -s*0.05, s*0.13, s*0.09,  0.2, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // 口
  ctx.strokeStyle = '#ff5500'; ctx.lineWidth = s*0.06;
  ctx.beginPath(); ctx.arc(0, s*0.18, s*0.2, 0.15, Math.PI - 0.15); ctx.stroke();
  // 光沢
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.ellipse(-s*0.25, -s*0.35, s*0.28, s*0.16, -0.4, 0, Math.PI*2); ctx.fill();
}

function drawRainbowMonster(ctx, r) {
  const s = r;
  const colors = ['#ff4d4d','#ff9d4d','#ffe14d','#6fdc6f','#4da6ff','#a366ff'];
  for (let i = 0; i < colors.length; i++) {
    const a0 = -Math.PI/2 + (i/colors.length)*Math.PI*2;
    const a1 = -Math.PI/2 + ((i+1)/colors.length)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, s, a0, a1); ctx.closePath();
    ctx.fillStyle = colors[i]; ctx.fill();
  }
  // 白いつや（シャボン玉っぽく）
  const glow = ctx.createRadialGradient(-s*0.2, -s*0.3, s*0.1, 0, 0, s);
  glow.addColorStop(0, 'rgba(255,255,255,0.65)');
  glow.addColorStop(0.5, 'rgba(255,255,255,0.15)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2); ctx.fillStyle = glow; ctx.fill();
  // 顔
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-s*0.22, -s*0.02, s*0.09, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc( s*0.22, -s*0.02, s*0.09, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = s*0.05;
  ctx.beginPath(); ctx.arc(0, s*0.12, s*0.16, 0.2, Math.PI - 0.2); ctx.stroke();
}


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
// 画面のdevicePixelRatioに合わせてCanvas解像度を上げ、スマホでのぼやけを防ぐ（重すぎないよう最大3倍まで）
const DPR = Math.min(window.devicePixelRatio || 1, 3);
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
let mergeGraceEntries = []; // [{ id: body.id, until: timestamp }] 誕生直後の特定モンスターだけ危険判定を猶予する

// ===== 難易度設定 =====
const DIFFICULTIES = {
  easy:   { label: '初級', gravity: 0.24, frictionAir: 0.05,  dropPool: 4, scoreMult: 0.8 },
  normal: { label: '中級', gravity: 0.32, frictionAir: 0.035, dropPool: 5, scoreMult: 1.0 },
  hard:   { label: '上級', gravity: 0.44, frictionAir: 0.022, dropPool: 6, scoreMult: 1.3 },
};
let currentDifficulty = localStorage.getItem('monsterMergeDifficulty') || 'normal';

// ===== ホールド機能 =====
let heldIdx  = null;
let canHold  = true;
let holdCanvas, holdCtx;

// ===== デイリーミッション =====
const MISSION_POOL = [
  { id: 'merge_skeleton', desc: 'スケルトンを5体誕生させよう', target: 5,    trackIdx: 3 },
  { id: 'merge_witch',    desc: '魔女を3体誕生させよう',       target: 3,    trackIdx: 6 },
  { id: 'reach_dragon',   desc: 'ドラゴンを1体誕生させよう',     target: 1,    trackIdx: 8 },
  { id: 'score_3000',     desc: '1プレイで3000ゴールド以上稼ごう', target: 3000, trackType: 'score' },
  { id: 'combo_4',        desc: 'コンボx4以上を1回出そう',       target: 1,    trackType: 'combo', comboReq: 4 },
];
let missionState = null;

// ===== 初期化 =====
function init() {
  gameCanvas   = document.getElementById('game-canvas');
  effectCanvas = document.getElementById('effect-canvas');
  nextCanvas   = document.getElementById('next-canvas');
  holdCanvas   = document.getElementById('hold-canvas');
  containerEl  = document.getElementById('game-container');
  gameCtx      = gameCanvas.getContext('2d');
  effectCtx    = effectCanvas.getContext('2d');
  nextCtx      = nextCanvas.getContext('2d');
  holdCtx      = holdCanvas.getContext('2d');

  // NEXT表示キャンバスもDPR倍の解像度にして高精細化（表示サイズは60x60のまま）
  const nextCssSize = window.innerWidth >= 700 ? 56 : 44;
  nextCanvas.width  = nextCssSize * DPR;
  nextCanvas.height = nextCssSize * DPR;
  nextCanvas.style.width  = nextCssSize + 'px';
  nextCanvas.style.height = nextCssSize + 'px';
  nextCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // HOLD表示キャンバスも同様にDPR対応
  holdCanvas.width  = nextCssSize * DPR;
  holdCanvas.height = nextCssSize * DPR;
  holdCanvas.style.width  = nextCssSize + 'px';
  holdCanvas.style.height = nextCssSize + 'px';
  holdCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  buildPhysics();
  setupInput();
  buildEvolutionBar();
  spawnEmbers();
  initMission();
  initDifficultyUI();

  bestScore = parseInt(localStorage.getItem('monsterMergeBest') || '0');
  document.getElementById('best-display').textContent = bestScore;

  currentIdx = randomDropIdx();
  nextIdx    = randomDropIdx();
  drawNextMonster();
  drawHoldMonster();

  // 物理エンジンは一旦止める（タイトル画面中は動かさない）
  Runner.stop(runner);

  // タイトル画面を表示
  document.getElementById('title-screen').classList.remove('hidden');

  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  W = containerEl.clientWidth;
  H = containerEl.clientHeight;
  // 実解像度をDPR倍にして高精細に。CSS表示サイズは従来通りW×H。
  gameCanvas.width  = W * DPR;
  gameCanvas.height = H * DPR;
  gameCanvas.style.width  = W + 'px';
  gameCanvas.style.height = H + 'px';
  effectCanvas.width  = W * DPR;
  effectCanvas.height = H * DPR;
  effectCanvas.style.width  = W + 'px';
  effectCanvas.style.height = H + 'px';
  gameCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  effectCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (engine) rebuildWalls();
}

// ===== 物理エンジン =====
function buildPhysics() {
  engine = Engine.create({ gravity: { y: DIFFICULTIES[currentDifficulty].gravity } });
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
  // 床の装飾ゾーン（CSS側で高さ8%）より上に着地ラインを設定し、
  // ボールが装飾の中に埋もれて見えないようにする
  const floorMargin = H * 0.06;
  World.add(world, [
    Bodies.rectangle(W/2, H - floorMargin + t/2, W, t, opts),
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
      if (mA.merging || mB.merging) continue;

      const defA = monsterDef(mA.idx), defB = monsterDef(mB.idx);

      // 爆弾スライム：何と触れても爆発
      if (defA.specialType === 'bomb' || defB.specialType === 'bomb') {
        mA.merging = mB.merging = true;
        mergeQueue.push([mA, mB, 'bomb']);
        continue;
      }

      // 虹スライム：どのモンスターとも合体できるワイルドカード（虹同士は反応なし）
      const hasRainbow = defA.specialType === 'rainbow' || defB.specialType === 'rainbow';
      if (hasRainbow) {
        if (defA.specialType === 'rainbow' && defB.specialType === 'rainbow') continue;
        mA.merging = mB.merging = true;
        mergeQueue.push([mA, mB, 'rainbow']);
        continue;
      }

      // 通常合体：同じ階層同士のみ
      if (mA.idx !== mB.idx) continue;
      if (mA.idx >= MONSTERS.length - 1) continue;
      mA.merging = mB.merging = true;
      mergeQueue.push([mA, mB, 'normal']);
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
  const [mA, mB, mode] = mergeQueue.shift();
  if (!world.bodies.includes(mA.body) || !world.bodies.includes(mB.body)) return;

  const mx = (mA.body.position.x + mB.body.position.x) / 2;
  const my = (mA.body.position.y + mB.body.position.y) / 2;

  if (mode === 'bomb') {
    handleBombExplosion(mA, mB, mx, my);
    return;
  }

  let newIdx;
  if (mode === 'rainbow') {
    const normalOne = (typeof mA.idx === 'number') ? mA : mB;
    newIdx = (typeof normalOne.idx === 'number') ? normalOne.idx + 1 : 1;
  } else {
    newIdx = mA.idx + 1;
  }
  newIdx = Math.min(newIdx, MONSTERS.length - 1);

  chainCount++;
  clearTimeout(chainTimer);
  chainTimer = setTimeout(() => { chainCount = 0; }, 1600);
  const chainMult = Math.min(chainCount, 8);
  const base = MONSTERS[newIdx].score * 10 * DIFFICULTIES[currentDifficulty].scoreMult;
  addScore(Math.round(base * chainMult));
  updateChainDisplay(chainMult);
  trackMissionCombo(chainMult);

  spawnMagicExplosion(mx, my, monsterDef(mA.idx), chainMult);
  if (newIdx >= 4) {
    spawnBlastWave(mx, my, newIdx);
    triggerScreenShake(1);
    triggerVibration([25]);
  }

  removeMonster(mA);
  removeMonster(mB);
  // 大きなモンスターほど落ち着くまで時間がかかるため、誕生したそのモンスターだけ
  // 危険判定に猶予を与える（他のボールの判定は止めない）
  const grace = 1000 + newIdx * 150;
  setTimeout(() => {
    const newBody = addMonster(newIdx, mx, my, true);
    addDangerGrace(newBody, grace);
  }, 80);
  showLevelUp(MONSTERS[newIdx].name);
  trackMissionProgress(newIdx);
}

// ===== 爆弾スライムの爆発処理 =====
function handleBombExplosion(mA, mB, mx, my) {
  // 範囲攻撃ではなく、触れた1体（＋爆弾自身）だけを消す
  const affected = [mA, mB];
  affected.forEach(m => removeMonster(m));

  const bonus = 30 * DIFFICULTIES[currentDifficulty].scoreMult;
  addScore(Math.round(bonus * affected.length));

  spawnMagicExplosion(mx, my, { magic: '#ff5500' }, 5);
  triggerScreenShake(1);
  triggerVibration([30, 20]);
  showLevelUp('💥 爆発！');
}

// ===== スコア加算共通処理（ミッション連携込み） =====
function addScore(amount) {
  score += amount;
  document.getElementById('score-display').textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('monsterMergeBest', bestScore);
    document.getElementById('best-display').textContent = bestScore;
  }
  trackMissionScore(score);
}

function removeMonster(m) {
  World.remove(world, m.body);
  bodies = bodies.filter(b => b !== m);
}

function addMonster(idx, x, y, fromMerge = false) {
  const r = monsterDef(idx).radius;
  const body = Bodies.circle(x, y, r, {
    restitution: 0.25, friction: 0.45, frictionAir: DIFFICULTIES[currentDifficulty].frictionAir, label: 'monster',
  });
  if (fromMerge) Body.setVelocity(body, { x: 0, y: -1.5 });
  World.add(world, body);
  bodies.push({ body, idx, merging: false });
  return body;
}

// 誕生直後のモンスター（大型ほど落ち着くまで時間がかかる）だけ、
// 一時的に危険判定の対象から除外する。盤面全体には影響しない。
function addDangerGrace(body, ms) {
  mergeGraceEntries.push({ id: body.id, until: Date.now() + ms });
}

// ===== ショップ（ゲーム中に貯めたゴールドをその場で使う） =====
const SHOP_ITEMS = [
  { id: 'bomb_clear',     name: '💣 危険回避',   cost: 200, desc: '盤面上部の高いモンスターを3体まとめて消す' },
  { id: 'rainbow_charge', name: '🌈 虹チャージ', cost: 100, desc: '次に落とすモンスターを虹スライムに変える' },
  { id: 'grace_time',     name: '⏱️ 猶予タイム', cost: 60,  desc: '5秒間、危険ラインの判定を止める' },
];

function openShop() {
  if (isGameOver) return;
  renderShop();
  document.getElementById('shop-screen').classList.remove('hidden');
}

function closeShop() {
  document.getElementById('shop-screen').classList.add('hidden');
}

function renderShop() {
  document.getElementById('shop-gold').textContent = score;
  const list = document.getElementById('shop-list');
  list.innerHTML = '';
  SHOP_ITEMS.forEach(item => {
    const btn = document.createElement('button');
    const affordable = score >= item.cost;
    btn.className = 'shop-item' + (affordable ? '' : ' disabled');
    btn.disabled = !affordable;
    btn.innerHTML = `
      <span class="shop-item-name">${item.name}</span>
      <span class="shop-item-desc">${item.desc}</span>
      <span class="shop-item-cost">💰 ${item.cost}</span>
    `;
    btn.addEventListener('click', () => buyShopItem(item.id));
    list.appendChild(btn);
  });
}

function buyShopItem(id) {
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item || score < item.cost || isGameOver) return;

  score -= item.cost;
  document.getElementById('score-display').textContent = score;

  if (id === 'bomb_clear') {
    const sorted = [...bodies].sort((a, b) => a.body.position.y - b.body.position.y);
    const toRemove = sorted.slice(0, Math.min(3, sorted.length));
    // それぞれの位置で個別にエフェクトを出す（1箇所だけだと何が消えたか分からないため）
    toRemove.forEach(m => {
      spawnMagicExplosion(m.body.position.x, m.body.position.y, { magic: '#66ccff' }, 3);
    });
    toRemove.forEach(m => removeMonster(m));
    triggerScreenShake(1);
    triggerVibration([20, 20]);
    // 盤面で何が起きたか見えるよう、購入直後にショップを閉じる
    closeShop();
  } else if (id === 'rainbow_charge') {
    nextIdx = 'rainbow';
    drawNextMonster();
  } else if (id === 'grace_time') {
    bodies.forEach(m => addDangerGrace(m.body, 5000));
  }

  showLevelUp(`🛒 ${item.name} 購入！`);
  renderShop();
}

// ===== ドロップ =====
function dropMonster() {
  if (isDropping || isGameOver) return;
  isDropping = true;
  const r = monsterDef(currentIdx).radius;
  const cx = Math.max(r + 5, Math.min(W - r - 5, mouseX));
  addMonster(currentIdx, cx, 55, false);
  currentIdx = nextIdx;
  nextIdx    = randomDropIdx();
  drawNextMonster();
  canHold = true;
  updateHoldButtonState();
  setTimeout(() => { isDropping = false; }, 500);
}

function randomDropIdx() {
  const roll = Math.random();
  if (roll < 0.025) return 'bomb';
  if (roll < 0.055) return 'rainbow';
  return Math.floor(Math.random() * DIFFICULTIES[currentDifficulty].dropPool);
}

// ===== 危険ゾーン =====
function checkDanger() {
  // 期限切れの猶予エントリを掃除
  const now = Date.now();
  if (mergeGraceEntries.length) {
    mergeGraceEntries = mergeGraceEntries.filter(e => e.until > now);
  }
  const gracedIds = mergeGraceEntries.length ? new Set(mergeGraceEntries.map(e => e.id)) : null;

  let danger = false;
  for (const m of bodies) {
    if (gracedIds && gracedIds.has(m.body.id)) continue; // 誕生直後のそのボールだけ猶予
    if (m.body.position.y - monsterDef(m.idx).radius < 62) { danger = true; break; }
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

// ===== モンスターアート描画（画像優先・未読込/フェニックスはCanvas描画） =====
function renderMonsterArt(ctx, mon, r) {
  if (mon.img && mon.img.complete && mon.img.naturalWidth > 0) {
    // 画像を円形クリップいっぱいに描画（少し大きめにして端の隙間を防止）
    const d = r * 2.16;
    ctx.drawImage(mon.img, -d/2, -d/2, d, d);
  } else if (mon.draw) {
    mon.draw(ctx, r);
  }
}

// ===== モンスター描画ヘルパー =====
function drawMonsterAt(ctx, idx, x, y, angle) {
  const mon = monsterDef(idx);
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

  // アート描画（画像は角度反映しない／カスタム描画は角度反映）
  ctx.save();
  if (!(mon.img && mon.img.complete && mon.img.naturalWidth > 0)) ctx.rotate(angle);
  renderMonsterArt(ctx, mon, r);
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
    const mon = monsterDef(currentIdx);
    const r   = mon.radius;
    const cx  = Math.max(r + 5, Math.min(W - r - 5, mouseX));
    const previewY = 55;

    // 点線ガイド（明るい青）
    gameCtx.save();
    gameCtx.strokeStyle = 'rgba(42,125,225,0.3)';
    gameCtx.setLineDash([4, 6]);
    gameCtx.lineWidth = 1.5;
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

// ===== 演出強化：画面揺れ・振動 =====
function triggerScreenShake(intensity = 1) {
  if (!containerEl) return;
  containerEl.classList.remove('shake', 'shake-strong');
  void containerEl.offsetWidth; // reflow でアニメーションを再トリガー
  containerEl.classList.add(intensity >= 2 ? 'shake-strong' : 'shake');
  const cls = intensity >= 2 ? 'shake-strong' : 'shake';
  setTimeout(() => containerEl.classList.remove(cls), 400);
}

function triggerVibration(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { /* 非対応環境は無視 */ }
  }
}

function spawnEmbers() {
  // 明るいファンタジーの輝き（金・白・水色）
  const colors = ['#ffd700','#fff176','#aef2ff','#ffb3c6','#b3e5fc'];
  for (let i = 0; i < 20; i++) {
    embers.push({
      x: Math.random()*420, y: Math.random()*600,
      vx: (Math.random()-0.5)*0.5,
      vy: -0.4 - Math.random()*0.6,
      size: 1 + Math.random()*2.5,
      color: colors[Math.floor(Math.random()*colors.length)],
      life: Math.random(), phase: Math.random()*Math.PI*2
    });
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
  el.textContent = `✨ COMBO x${mult}!`;
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 750);
}
function showLevelUp(name) {
  const ex = document.getElementById('levelup-popup'); if (ex) ex.remove();
  const el = document.createElement('div'); el.id = 'levelup-popup';
  el.innerHTML = `⭐ <span style="font-size:0.9rem">${name} 登場！</span>`;
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ===== ネクスト描画（カスタムアート） =====
function drawNextMonster() {
  const size = nextCanvas.width / DPR;
  const cx = size / 2, cy = size / 2;
  const mon = monsterDef(nextIdx);
  const r   = Math.min(mon.radius, size * 0.36);
  nextCtx.clearRect(0, 0, size, size);

  // グロー
  const glow = nextCtx.createRadialGradient(cx, cy, r*0.6, cx, cy, r*1.3);
  glow.addColorStop(0, 'transparent'); glow.addColorStop(1, mon.magic + '33');
  nextCtx.beginPath(); nextCtx.arc(cx, cy, r*1.3, 0, Math.PI*2);
  nextCtx.fillStyle = glow; nextCtx.fill();

  // クリップして描画
  nextCtx.save();
  nextCtx.translate(cx, cy);
  nextCtx.beginPath(); nextCtx.arc(0, 0, r, 0, Math.PI*2); nextCtx.clip();
  renderMonsterArt(nextCtx, mon, r);
  nextCtx.restore();

  // 縁取り
  nextCtx.beginPath(); nextCtx.arc(cx, cy, r, 0, Math.PI*2);
  nextCtx.strokeStyle = mon.magic + 'aa'; nextCtx.lineWidth = 1.5; nextCtx.stroke();
}

// ===== ホールド機能 =====
function drawHoldMonster() {
  const size = holdCanvas.width / DPR;
  const cx = size / 2, cy = size / 2;
  holdCtx.clearRect(0, 0, size, size);

  if (heldIdx === null) {
    holdCtx.save();
    holdCtx.strokeStyle = 'rgba(255,255,255,0.3)';
    holdCtx.setLineDash([3, 3]);
    holdCtx.lineWidth = 1.5;
    holdCtx.beginPath(); holdCtx.arc(cx, cy, size * 0.3, 0, Math.PI*2); holdCtx.stroke();
    holdCtx.restore();
    return;
  }

  const mon = monsterDef(heldIdx);
  const r = Math.min(mon.radius, size * 0.36);

  const glow = holdCtx.createRadialGradient(cx, cy, r*0.6, cx, cy, r*1.3);
  glow.addColorStop(0, 'transparent'); glow.addColorStop(1, mon.magic + '33');
  holdCtx.beginPath(); holdCtx.arc(cx, cy, r*1.3, 0, Math.PI*2);
  holdCtx.fillStyle = glow; holdCtx.fill();

  holdCtx.save();
  holdCtx.translate(cx, cy);
  holdCtx.beginPath(); holdCtx.arc(0, 0, r, 0, Math.PI*2); holdCtx.clip();
  renderMonsterArt(holdCtx, mon, r);
  holdCtx.restore();

  holdCtx.beginPath(); holdCtx.arc(cx, cy, r, 0, Math.PI*2);
  holdCtx.strokeStyle = mon.magic + 'aa'; holdCtx.lineWidth = 1.5; holdCtx.stroke();
}

function doHold() {
  if (!canHold || isGameOver || isDropping) return;
  if (heldIdx === null) {
    heldIdx = currentIdx;
    currentIdx = nextIdx;
    nextIdx = randomDropIdx();
    drawNextMonster();
  } else {
    const tmp = heldIdx;
    heldIdx = currentIdx;
    currentIdx = tmp;
  }
  canHold = false;
  drawHoldMonster();
  updateHoldButtonState();
}

function updateHoldButtonState() {
  const panel = document.getElementById('hold-panel');
  if (panel) panel.classList.toggle('disabled', !canHold);
}

function resetHold() {
  heldIdx = null;
  canHold = true;
  drawHoldMonster();
  updateHoldButtonState();
}

// ===== デイリーミッション =====
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function getDailyMission() {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const mission = MISSION_POOL[hash % MISSION_POOL.length];
  return { ...mission, dateKey: key };
}

function loadMissionState() {
  const mission = getDailyMission();
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('monsterMergeMission') || 'null'); } catch (e) {}
  if (saved && saved.dateKey === mission.dateKey) {
    return { ...mission, progress: saved.progress, completed: saved.completed };
  }
  return { ...mission, progress: 0, completed: false };
}

function saveMissionState() {
  if (!missionState) return;
  localStorage.setItem('monsterMergeMission', JSON.stringify({
    dateKey: missionState.dateKey, progress: missionState.progress, completed: missionState.completed,
  }));
}

function initMission() {
  missionState = loadMissionState();
  renderMissionUI();
}

function renderMissionUI() {
  const descEl = document.getElementById('mission-desc');
  const barEl  = document.getElementById('mission-bar-fill');
  const statusEl = document.getElementById('mission-status');
  if (!descEl || !missionState) return;
  descEl.textContent = missionState.desc;
  const pct = Math.min(100, Math.round((missionState.progress / missionState.target) * 100));
  barEl.style.width = pct + '%';
  statusEl.textContent = missionState.completed
    ? '✅ 達成済み'
    : `${Math.min(missionState.progress, missionState.target)}/${missionState.target}`;
  document.getElementById('mission-panel')?.classList.toggle('completed', !!missionState.completed);
}

function trackMissionProgress(newIdx) {
  if (!missionState || missionState.completed) return;
  if (missionState.trackIdx !== undefined && newIdx === missionState.trackIdx) {
    missionState.progress++;
    checkMissionComplete();
  }
}

function trackMissionScore(finalScore) {
  if (!missionState || missionState.completed) return;
  if (missionState.trackType === 'score') {
    missionState.progress = Math.max(missionState.progress, finalScore);
    checkMissionComplete();
  }
}

function trackMissionCombo(mult) {
  if (!missionState || missionState.completed) return;
  if (missionState.trackType === 'combo' && mult >= missionState.comboReq) {
    missionState.progress = 1;
    checkMissionComplete();
  }
}

function checkMissionComplete() {
  if (!missionState.completed && missionState.progress >= missionState.target) {
    missionState.completed = true;
    // ミッション達成でゴールドボーナスを付与（プレイ中のみ。ショップで使える）
    if (typeof isGameOver !== 'undefined' && !isGameOver && typeof score === 'number') {
      addScore(500);
    }
    showMissionComplete();
  }
  saveMissionState();
  renderMissionUI();
}

function showMissionComplete() {
  const ex = document.getElementById('mission-complete-popup'); if (ex) ex.remove();
  const el = document.createElement('div'); el.id = 'mission-complete-popup';
  el.innerHTML = '🎉 <span style="font-size:0.9rem">デイリーミッション達成！ +500 GOLD</span>';
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

// ===== 難易度選択 =====
function initDifficultyUI() {
  const labelEl = document.getElementById('difficulty-label');
  if (labelEl) labelEl.textContent = DIFFICULTIES[currentDifficulty].label;
}

function applyDifficulty(id) {
  currentDifficulty = id;
  localStorage.setItem('monsterMergeDifficulty', id);
  const labelEl = document.getElementById('difficulty-label');
  if (labelEl) labelEl.textContent = DIFFICULTIES[id].label;
  if (engine) engine.gravity.y = DIFFICULTIES[id].gravity;
}

function updateDifficultyActiveState(id) {
  document.querySelectorAll('.difficulty-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.difficultyId === id);
  });
}

function showDifficultyScreen() {
  updateDifficultyActiveState(currentDifficulty);
  document.getElementById('difficulty-screen').classList.remove('hidden');
}

// ===== 進化バー =====
function buildEvolutionBar() {
  const list = document.getElementById('evo-list');
  list.innerHTML = '';
  MONSTERS.forEach((mon, i) => {
    const item = document.createElement('div'); item.className = 'evo-item';
    const canvas = document.createElement('canvas');
    const cssSize = 32;
    canvas.width  = cssSize * DPR;
    canvas.height = cssSize * DPR;
    canvas.style.width  = cssSize + 'px';
    canvas.style.height = cssSize + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const r = Math.min(mon.radius*0.5, 12), cx = 16, cy = 16;
    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.clip();
    renderMonsterArt(ctx, mon, r);
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
  isGameOver = false; score = 0; chainCount = 0; dangerFrames = 0; mergeGraceEntries = []; resetHold();
  particles = []; mergeQueue = []; isTouching = false;
  document.getElementById('score-display').textContent = '0';
  document.getElementById('chain-display').textContent = 'x1';
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('ranking-screen').classList.add('hidden');
  document.getElementById('shop-screen').classList.add('hidden');
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
  isGameOver = false; score = 0; chainCount = 0; dangerFrames = 0; mergeGraceEntries = []; resetHold();
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
  if (fromTitle) document.getElementById('title-screen').classList.add('hidden');
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
// bodyの末尾で読み込まれるため、DOM は既に存在している
(function () {
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

  document.getElementById('home-btn').addEventListener('click', () => {
    if (isGameOver) { showTitle(); return; }
    showConfirm('現在のゲームを終了して<br>タイトルに戻りますか？', () => {
      showTitle();
    });
  });

  // ===== ショップ =====
  document.getElementById('shop-btn').addEventListener('click', openShop);
  document.getElementById('shop-close-btn').addEventListener('click', closeShop);

  // ===== テーマ選択 =====
  document.getElementById('theme-btn').addEventListener('click', () => {
    showThemeScreen();
  });
  document.getElementById('theme-close-btn').addEventListener('click', () => {
    document.getElementById('theme-screen').classList.add('hidden');
  });
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.dataset.themeId;
      applyTheme(themeId);
      updateThemeActiveState(themeId);
    });
  });

  // ===== ホールド =====
  document.getElementById('hold-panel').addEventListener('click', doHold);

  // ===== 難易度選択 =====
  document.getElementById('difficulty-btn').addEventListener('click', () => {
    showDifficultyScreen();
  });
  document.getElementById('difficulty-close-btn').addEventListener('click', () => {
    document.getElementById('difficulty-screen').classList.add('hidden');
  });
  document.querySelectorAll('.difficulty-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.difficultyId;
      applyDifficulty(id);
      updateDifficultyActiveState(id);
    });
  });
})();

// ===== テーマ切り替え =====
function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem('monsterMergeTheme', themeId);
}

function updateThemeActiveState(themeId) {
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeId === themeId);
  });
}

function showThemeScreen() {
  const current = localStorage.getItem('monsterMergeTheme') || 'dungeon';
  updateThemeActiveState(current);
  document.getElementById('theme-screen').classList.remove('hidden');
}

