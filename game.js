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
  { name: 'ウィッチ',     radius: 66,  color: '#330066', score: 28, magic: '#cc44ff',
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
    img: loadMonsterImg('monster-bomb.png'), draw: drawBombMonster, specialType: 'bomb',
  },
  rainbow: {
    name: '虹スライム', radius: 30, color: '#ffffff', magic: '#ffffff', score: 0,
    img: loadMonsterImg('monster-rainbow.png'), draw: drawRainbowMonster, specialType: 'rainbow',
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
let score        = 0; // ランキング・自己ベスト用（減らない）
let gold         = 0; // ショップで使えるお金（購入すると減る）
let bestScore    = 0;
let nextIdx      = 0;
let nextNextIdx  = 0;
let currentIdx   = 0;
let mouseX       = 200;
let isTouching   = false;   // タッチ/マウス押下中
let isDropping   = false;
let isGameOver   = false;
let mergeQueue   = [];
let dangerStartTime = null; // 危険状態になった実時刻（フレームレートに依存しないよう時間で管理）
const DANGER_HOLD_MS = 2000; // この時間だけ連続でラインにかかるとゲームオーバー
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
let nextNextCanvas, nextNextCtx;

// ===== デイリーミッション =====
const MISSION_POOL = [
  { id: 'merge_skeleton', desc: 'スケルトンを5体誕生させよう', target: 5,    trackIdx: 3 },
  { id: 'merge_witch',    desc: 'ウィッチを3体誕生させよう',       target: 3,    trackIdx: 6 },
  { id: 'reach_dragon',   desc: 'ドラゴンを1体誕生させよう',     target: 1,    trackIdx: 8 },
  { id: 'score_3000',     desc: '1プレイで3000ゴールド以上稼ごう', target: 3000, trackType: 'score' },
  { id: 'merge_centaur',  desc: 'ケンタウルスを4体誕生させよう',   target: 4,    trackIdx: 4 },
];
let missionState = null;

// ===== 初期化 =====
function init() {
  gameCanvas   = document.getElementById('game-canvas');
  effectCanvas = document.getElementById('effect-canvas');
  nextCanvas   = document.getElementById('next-canvas');
  nextNextCanvas = document.getElementById('next-next-canvas');
  holdCanvas   = document.getElementById('hold-canvas');
  containerEl  = document.getElementById('game-container');
  gameCtx      = gameCanvas.getContext('2d');
  effectCtx    = effectCanvas.getContext('2d');
  nextCtx      = nextCanvas.getContext('2d');
  nextNextCtx  = nextNextCanvas.getContext('2d');
  holdCtx      = holdCanvas.getContext('2d');

  // NEXT表示キャンバスもDPR倍の解像度にして高精細化（表示サイズは60x60のまま）
  const nextCssSize = window.innerWidth >= 700 ? 56 : 44;
  nextCanvas.width  = nextCssSize * DPR;
  nextCanvas.height = nextCssSize * DPR;
  nextCanvas.style.width  = nextCssSize + 'px';
  nextCanvas.style.height = nextCssSize + 'px';
  nextCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // NEXT NEXT（2つ先）表示は少し小さめに
  const nextNextCssSize = Math.round(nextCssSize * 0.72);
  nextNextCanvas.width  = nextNextCssSize * DPR;
  nextNextCanvas.height = nextNextCssSize * DPR;
  nextNextCanvas.style.width  = nextNextCssSize + 'px';
  nextNextCanvas.style.height = nextNextCssSize + 'px';
  nextNextCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

  // HOLD表示キャンバスも同様にDPR対応
  holdCanvas.width  = nextCssSize * DPR;
  holdCanvas.height = nextCssSize * DPR;
  holdCanvas.style.width  = nextCssSize + 'px';
  holdCanvas.style.height = nextCssSize + 'px';
  holdCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('resize', () => {
    const catchScreen = document.getElementById('catch-screen');
    if (catchScreen && !catchScreen.classList.contains('hidden')) {
      initCatchCanvas();
      renderCatchFrame();
    }
  });
  buildPhysics();
  setupInput();
  buildEvolutionBar();
  spawnEmbers();
  initMission();
  initDifficultyUI();

  bestScore = parseInt(localStorage.getItem('monsterMergeBest') || '0');
  document.getElementById('best-display').textContent = bestScore;
  syncBestScoreFromRanking();

  currentIdx  = randomDropIdx();
  nextIdx     = randomDropIdx();
  nextNextIdx = randomDropIdx();
  drawNextMonster();
  drawNextNextMonster();
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
  function handlePair(pair) {
    const a = pair.bodyA, b = pair.bodyB;
    if (a.label === 'wall' || b.label === 'wall') return;
    const mA = bodies.find(m => m.body === a);
    const mB = bodies.find(m => m.body === b);
    if (!mA || !mB) return;
    if (mA.merging || mB.merging) return;

    const defA = monsterDef(mA.idx), defB = monsterDef(mB.idx);

    // 爆弾スライム：何と触れても爆発（出現直後でも安全のため即座に反応させる）
    if (defA.specialType === 'bomb' || defB.specialType === 'bomb') {
      mA.merging = mB.merging = true;
      mergeQueue.push([mA, mB, 'bomb']);
      return;
    }

    // 出現直後（まだ十分に落下していない）同士の合体を防ぐ。
    // 連続で投下すると、落ちきる前に上部で触れて即合体してしまう現象があったための対策。
    // ここでスキップしても、接触したまま落下し続ける限りcollisionActiveで毎フレーム
    // 再チェックされるため、閾値を超えた時点で正しく合体する。
    const SPAWN_MERGE_MIN_Y = 115;
    if (mA.body.position.y < SPAWN_MERGE_MIN_Y && mB.body.position.y < SPAWN_MERGE_MIN_Y) return;

    // 虹スライム：どのモンスターとも合体できるワイルドカード（虹同士は反応なし）
    const hasRainbow = defA.specialType === 'rainbow' || defB.specialType === 'rainbow';
    if (hasRainbow) {
      if (defA.specialType === 'rainbow' && defB.specialType === 'rainbow') return;
      mA.merging = mB.merging = true;
      mergeQueue.push([mA, mB, 'rainbow']);
      return;
    }

    // 魔王同士の共鳴：最上位のためこれ以上進化はしないが、
    // 特別な演出と大量ボーナスが発生する（今までは何も起きなかった）
    if (mA.idx === MONSTERS.length - 1 && mB.idx === MONSTERS.length - 1) {
      mA.merging = mB.merging = true;
      mergeQueue.push([mA, mB, 'demonfusion']);
      return;
    }

    // 通常合体：同じ階層同士のみ
    if (mA.idx !== mB.idx) return;
    if (mA.idx >= MONSTERS.length - 1) return;
    mA.merging = mB.merging = true;
    mergeQueue.push([mA, mB, 'normal']);
  }

  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) handlePair(pair);
  });
  // 出現直後で合体を見送ったペアも、接触したまま落下すればここで再評価される
  Events.on(engine, 'collisionActive', (event) => {
    for (const pair of event.pairs) handlePair(pair);
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

  if (mode === 'demonfusion') {
    handleDemonFusion(mA, mB, mx, my);
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

  const base = MONSTERS[newIdx].score * 6 * DIFFICULTIES[currentDifficulty].scoreMult;
  addScore(Math.round(base));

  spawnMagicExplosion(mx, my, monsterDef(mA.idx), 1);
  if (newIdx >= 4) {
    spawnBlastWave(mx, my, newIdx);
    triggerScreenShake(1);
    triggerVibration([25]);
    SoundManager.bigMerge();
  } else {
    SoundManager.merge(newIdx);
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

  const bonus = 20 * DIFFICULTIES[currentDifficulty].scoreMult;
  addScore(Math.round(bonus * affected.length));

  spawnMagicExplosion(mx, my, { magic: '#ff5500' }, 5);
  triggerScreenShake(1);
  triggerVibration([30, 20]);
  SoundManager.bomb();
  showLevelUp('💥 爆発！');
}

// ===== 魔王共鳴：魔王同士がぶつかった時の特別演出 =====
// これ以上進化はしないため、代わりに莫大なボーナスと大演出を発生させ、
// 魔王を1体、体勢を立て直した状態で盤面に戻す。
function handleDemonFusion(mA, mB, mx, my) {
  const topIdx = MONSTERS.length - 1;
  removeMonster(mA);
  removeMonster(mB);

  const bonus = MONSTERS[topIdx].score * 25 * DIFFICULTIES[currentDifficulty].scoreMult;
  addScore(Math.round(bonus));

  spawnMagicExplosion(mx, my, monsterDef(topIdx), 8);
  spawnBlastWave(mx, my, topIdx);
  triggerScreenShake(2);
  triggerVibration([50, 40, 50, 40, 90]);
  SoundManager.demonFusion();
  showLevelUp('👑 魔王共鳴！莫大な力が解放された！');

  setTimeout(() => {
    const newBody = addMonster(topIdx, mx, my, true);
    addDangerGrace(newBody, 1000 + topIdx * 150);
  }, 80);
}

// ===== スコア加算共通処理（ミッション連携込み） =====
function addScore(amount) {
  score += amount;
  gold  += Math.round(amount * 0.6); // GOLDはスコアと異なる比率で増える独立した通貨
  document.getElementById('score-display').textContent = score;
  document.getElementById('gold-display').textContent = gold;
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
  { id: 'bomb_clear',     name: '💣 危険回避',   free: true, maxUses: 3, desc: '盤面上部の高いモンスターを3体まとめて消す（1プレイ3回まで無料）' },
  { id: 'rainbow_charge', name: '🌈 虹チャージ', cost: 220, desc: '次に落とすモンスターを虹スライムに変える' },
  { id: 'grace_time',     name: '⏱️ 猶予タイム', cost: 150, desc: '5秒間、危険ラインの判定を止める' },
];

let dangerAvoidUsesLeft = 3; // 「危険回避」の1プレイあたりの残り無料使用回数

// ===== 盤面の状況から「今使うと良いアイテム」を判定 =====
// ゴールドが足りない/無料回数を使い切っている場合はおすすめしない
function getShopRecommendation() {
  if (!bodies.length) return null;

  const topY = Math.min(...bodies.map(m => m.body.position.y - monsterDef(m.idx).radius));
  const nearDanger = topY < 170; // 危険ラインに近い高さまで積み上がっている

  if (nearDanger || Date.now() < mergeGraceEntries.reduce((max,e)=>Math.max(max,e.until),0)) {
    if (dangerAvoidUsesLeft > 0) return { id: 'bomb_clear', reason: '盤面が危険ラインに近づいています。今のうちに上段を片付けましょう。' };
    if (gold >= 150) return { id: 'grace_time',  reason: '盤面が危険ラインに近づいています。少し猶予を作って落ち着いて置きましょう。' };
    return null;
  }

  // 同じ階層のモンスターが多く滞留＝合体が進んでいない状況
  const counts = {};
  bodies.forEach(m => { if (typeof m.idx === 'number') counts[m.idx] = (counts[m.idx] || 0) + 1; });
  const maxCount = Object.values(counts).length ? Math.max(...Object.values(counts)) : 0;
  if (maxCount >= 6 && gold >= 220) {
    return { id: 'rainbow_charge', reason: '同じ階層のモンスターが盤面に溜まっています。虹スライムで一気にさばきましょう。' };
  }

  return null;
}

function openShop() {
  if (isGameOver) return;
  renderShop();
  document.getElementById('shop-screen').classList.remove('hidden');
}

function closeShop() {
  document.getElementById('shop-screen').classList.add('hidden');
}

function renderShop() {
  document.getElementById('shop-gold').textContent = gold;
  const list = document.getElementById('shop-list');
  list.innerHTML = '';

  const recommendation = getShopRecommendation();

  const hintEl = document.getElementById('shop-hint');
  if (recommendation) {
    hintEl.textContent = '💡 ' + recommendation.reason;
    hintEl.classList.remove('hidden');
  } else {
    hintEl.classList.add('hidden');
  }

  SHOP_ITEMS.forEach(item => {
    const btn = document.createElement('button');
    const affordable = item.free ? dangerAvoidUsesLeft > 0 : gold >= item.cost;
    const isRecommended = recommendation && recommendation.id === item.id;
    btn.className = 'shop-item' + (affordable ? '' : ' disabled') + (isRecommended ? ' recommended' : '');
    btn.disabled = !affordable;
    const costHtml = item.free
      ? `<span class="shop-item-cost shop-item-uses">残り${dangerAvoidUsesLeft}/${item.maxUses}回</span>`
      : `<span class="shop-item-cost">💰 ${item.cost}</span>`;
    btn.innerHTML = `
      ${isRecommended ? '<span class="shop-item-badge">おすすめ！</span>' : ''}
      <span class="shop-item-name">${item.name}</span>
      <span class="shop-item-desc">${item.desc}</span>
      ${costHtml}
    `;
    btn.addEventListener('click', () => buyShopItem(item.id));
    list.appendChild(btn);
  });
}

function buyShopItem(id) {
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item || isGameOver) return;

  if (item.free) {
    if (dangerAvoidUsesLeft <= 0) return;
    dangerAvoidUsesLeft--;
  } else {
    if (gold < item.cost) return;
    gold -= item.cost;
    document.getElementById('gold-display').textContent = gold;
  }
  SoundManager.shopBuy();

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

  showLevelUp(`🛒 ${item.name} 使用！`);
  renderShop();
}

// ===== ドロップ =====
function dropMonster() {
  if (isDropping || isGameOver) return;
  isDropping = true;
  const r = monsterDef(currentIdx).radius;
  const cx = Math.max(r + 5, Math.min(W - r - 5, mouseX));
  const newBody = addMonster(currentIdx, cx, 55, false);
  SoundManager.drop();
  // 出現直後は必ず危険ラインの範囲内から始まるため、落下して抜けるまで少し猶予を与える
  // （連続でどんどん落とすと常にどれかが出現直後の状態になり、誤ってゲームオーバーになるのを防ぐ）
  addDangerGrace(newBody, 700 + r * 8);
  currentIdx = nextIdx;
  nextIdx     = nextNextIdx;
  nextNextIdx = randomDropIdx();
  drawNextMonster();
  drawNextNextMonster();
  canHold = true;
  updateHoldButtonState();
  setTimeout(() => { isDropping = false; }, 500);
}

function randomDropIdx() {
  const roll = Math.random();
  if (roll < 0.025) return 'bomb';
  if (roll < 0.055) return 'rainbow';

  // 階層が上がるほど出現率が下がる重み付き抽選（大きい・レアなツムほど出にくい）
  const pool = DIFFICULTIES[currentDifficulty].dropPool;
  let total = 0;
  const weights = [];
  for (let i = 0; i < pool; i++) {
    const w = pool - i; // 例: pool=5 → [5,4,3,2,1]
    weights.push(w);
    total += w;
  }
  let r = Math.random() * total;
  for (let i = 0; i < pool; i++) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return 0;
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
    if (dangerStartTime === null) dangerStartTime = now;
    document.getElementById('danger-line').style.opacity = 0.7 + 0.3 * Math.sin(now / 80);
    if (now - dangerStartTime >= DANGER_HOLD_MS) triggerGameOver();
  } else {
    dangerStartTime = null;
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

function spawnMagicExplosion(x, y, monster, intensity) {
  const cnt = 10 + intensity * 3;
  const col = monster.magic;
  for (let i = 0; i < cnt; i++) {
    const angle = (i/cnt)*Math.PI*2;
    const speed = 1.5 + Math.random()*3;
    particles.push({ type:'spark', x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-1.5, size:2.5+Math.random()*3, color:col, life:1, decay:0.018+Math.random()*0.015 });
  }
  for (let i = 0; i < 5 + intensity; i++) {
    const angle = Math.random()*Math.PI*2, speed = 1+Math.random()*2;
    particles.push({ type:'rune', x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed-2, size:6+Math.random()*4, color:col, char:RUNES[Math.floor(Math.random()*RUNES.length)], rot:Math.random()*Math.PI*2, rotSpeed:(Math.random()-0.5)*0.15, life:1, decay:0.02+Math.random()*0.015 });
  }
  particles.push({ type:'magic-circle', x, y, vx:0, vy:0, size:30+intensity*8, color:col, life:1, decay:0.035 });
  particles.push({ type:'ring', x, y, vx:0, vy:0, size:20+intensity*6, color:col, life:0.8, decay:0.04 });
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

// ===== サウンド（効果音・BGM）=====
// 外部音声ファイルを使わず、Web Audio APIで全て生成する
const SoundManager = {
  ctx: null,
  master: null,
  sfxGain: null,
  bgmGain: null,
  bgmNodes: null,
  muted: localStorage.getItem('monsterMergeMuted') === '1',
  started: false,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.master);
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.12;
    this.bgmGain.connect(this.master);
  },

  // 最初のユーザー操作で呼び出し、AudioContextの自動再生制限を解除する
  unlock() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.started) {
      this.started = true;
      this.startBgm();
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('monsterMergeMuted', this.muted ? '1' : '0');
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.05);
    return this.muted;
  },

  // ---- 効果音の基本パーツ ----
  _tone(freq, duration, { type = 'sine', gain = 0.3, freqEnd = null, delay = 0 } = {}) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g); g.connect(this.sfxGain);
    osc.start(t0); osc.stop(t0 + duration + 0.02);
  },

  _noise(duration, { gain = 0.25, delay = 0, filterFreq = 2000 } = {}) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    src.connect(filter); filter.connect(g); g.connect(this.sfxGain);
    src.start(t0);
  },

  // ---- 個別のSE ----
  drop()      { this._tone(320, 0.08, { type: 'triangle', gain: 0.15, freqEnd: 220 }); },
  merge(tier=0) {
    const base = 260 + tier * 30;
    this._tone(base, 0.18, { type: 'sine', gain: 0.28, freqEnd: base*1.8 });
    this._tone(base*1.5, 0.22, { type: 'triangle', gain: 0.14, freqEnd: base*2.2, delay: 0.03 });
  },
  bigMerge()  {
    this.merge(6);
    this._tone(150, 0.4, { type: 'sawtooth', gain: 0.18, freqEnd: 400, delay: 0.05 });
  },
  bomb() {
    this._noise(0.35, { gain: 0.4, filterFreq: 1200 });
    this._tone(90, 0.3, { type: 'sawtooth', gain: 0.25, freqEnd: 40 });
  },
  demonFusion() {
    [0,0.08,0.16].forEach((d,i) => this._tone(180+i*60, 0.5, { type: 'sawtooth', gain: 0.22, freqEnd: 500, delay: d }));
    this._noise(0.6, { gain: 0.2, delay: 0.1, filterFreq: 3000 });
  },
  danger()    { this._tone(880, 0.12, { type: 'square', gain: 0.12 }); },
  gameOver()  {
    [520,440,360,280].forEach((f,i) => this._tone(f, 0.35, { type: 'triangle', gain: 0.22, delay: i*0.14 }));
  },
  buttonClick(){ this._tone(600, 0.05, { type: 'square', gain: 0.08 }); },
  shopBuy()   { this._tone(500, 0.1, { type: 'sine', gain: 0.2, freqEnd: 900 }); this._tone(900, 0.15, { type: 'sine', gain: 0.15, freqEnd: 1300, delay: 0.06 }); },
  missionComplete() {
    [523,659,784,1047].forEach((f,i) => this._tone(f, 0.28, { type: 'triangle', gain: 0.22, delay: i*0.09 }));
  },
  holdUse()   { this._tone(700, 0.09, { type: 'sine', gain: 0.16, freqEnd: 500 }); },
  rankUpdate(){ this._tone(660, 0.14, { type: 'sine', gain: 0.2, freqEnd: 990 }); this._tone(990, 0.18, { type: 'sine', gain: 0.15, delay: 0.08 }); },

  // ---- モンスターキャッチ専用SE ----
  catchGood(tier=0) {
    const f = 440 + tier*25;
    this._tone(f, 0.1, { type: 'sine', gain: 0.22, freqEnd: f*1.6 });
  },
  catchCombo(combo) {
    const f = 500 + Math.min(combo,10)*40;
    this._tone(f, 0.12, { type: 'triangle', gain: 0.18, freqEnd: f*1.4 });
  },
  catchRainbow() {
    [660,880,1100].forEach((f,i)=>this._tone(f,0.14,{type:'sine',gain:0.2,delay:i*0.05}));
  },
  catchBomb() {
    this._noise(0.3, { gain: 0.35, filterFreq: 1000 });
    this._tone(120, 0.25, { type: 'sawtooth', gain: 0.22, freqEnd: 50 });
  },
  catchMiss() { this._tone(260, 0.08, { type: 'sine', gain: 0.08, freqEnd: 180 }); },
  catchGameOver() {
    [400,320,240,160].forEach((f,i)=>this._tone(f,0.3,{type:'triangle',gain:0.2,delay:i*0.13}));
  },

  // ---- 簡易アンビエントBGM（不気味で穏やかなダンジョン風ループ）----
  startBgm() {
    if (!this.ctx || this.bgmNodes) return;
    const notes = [130.81, 155.56, 196.00, 174.61]; // C3,Eb3,G3,F3 (マイナー調の浮遊感)
    const oscs = [];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      osc.connect(g); g.connect(this.bgmGain);
      osc.start();
      oscs.push({ osc, g });

      // ゆっくりしたパッド的な出入り（LFO代わりの手動スケジューリング）
      const period = 9 + i * 1.7;
      const scheduleFade = (t) => {
        if (!this.bgmNodes) return;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.22, t + period/2);
        g.gain.linearRampToValueAtTime(0, t + period);
        setTimeout(() => scheduleFade(this.ctx.currentTime), period*1000);
      };
      scheduleFade(this.ctx.currentTime + i*1.2);
    });
    this.bgmNodes = oscs;
  },

  stopBgm() {
    if (!this.bgmNodes) return;
    this.bgmNodes.forEach(({ osc }) => { try { osc.stop(); } catch(e){} });
    this.bgmNodes = null;
    this.started = false;
  },
};

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

function drawNextNextMonster() {
  if (!nextNextCanvas) return;
  const size = nextNextCanvas.width / DPR;
  const cx = size / 2, cy = size / 2;
  const mon = monsterDef(nextNextIdx);
  const r   = Math.min(mon.radius, size * 0.36);
  nextNextCtx.clearRect(0, 0, size, size);

  nextNextCtx.save();
  nextNextCtx.globalAlpha = 0.65; // 1つ先より控えめな見た目にして優先度を分かりやすく
  nextNextCtx.translate(cx, cy);
  nextNextCtx.beginPath(); nextNextCtx.arc(0, 0, r, 0, Math.PI*2); nextNextCtx.clip();
  renderMonsterArt(nextNextCtx, mon, r);
  nextNextCtx.restore();

  nextNextCtx.beginPath(); nextNextCtx.arc(cx, cy, r, 0, Math.PI*2);
  nextNextCtx.strokeStyle = mon.magic + '77'; nextNextCtx.lineWidth = 1.2; nextNextCtx.stroke();
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
  localStorage.setItem('monsterMergeHoldUsed', '1');
  SoundManager.holdUse();
  if (heldIdx === null) {
    heldIdx = currentIdx;
    currentIdx  = nextIdx;
    nextIdx     = nextNextIdx;
    nextNextIdx = randomDropIdx();
    drawNextMonster();
    drawNextNextMonster();
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
  if (panel) {
    panel.classList.toggle('disabled', !canHold);
    // まだ一度もホールドを使ったことがない場合、使えるタイミングでそっと目立たせる
    const everUsed = localStorage.getItem('monsterMergeHoldUsed');
    panel.classList.toggle('hold-hint-pulse', canHold && heldIdx === null && !everUsed);
  }
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

function dateKeyForOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

// ===== デイリーミッション連続達成日数（ストリーク） =====
function updateMissionStreak() {
  const today = getTodayKey();
  const yesterday = dateKeyForOffset(1);
  const lastDate = localStorage.getItem('monsterMergeStreakLastDate');
  let streak = parseInt(localStorage.getItem('monsterMergeStreak') || '0');

  if (lastDate === today) {
    // 同日内の再判定（通常は起こらないが念のため）
  } else if (lastDate === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }
  localStorage.setItem('monsterMergeStreak', String(streak));
  localStorage.setItem('monsterMergeStreakLastDate', today);
}

// 表示用：前回達成が「昨日」より前で途切れている場合は0として見せる
function getDisplayStreak() {
  const today = getTodayKey();
  const yesterday = dateKeyForOffset(1);
  const lastDate = localStorage.getItem('monsterMergeStreakLastDate');
  const streak = parseInt(localStorage.getItem('monsterMergeStreak') || '0');
  return (lastDate === today || lastDate === yesterday) ? streak : 0;
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

  const streakEl = document.getElementById('mission-streak');
  if (streakEl) {
    const streak = getDisplayStreak();
    if (streak > 0) {
      streakEl.textContent = `🔥 ${streak}日連続達成中`;
      streakEl.classList.remove('hidden');
    } else {
      streakEl.classList.add('hidden');
    }
  }
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

function checkMissionComplete() {
  if (!missionState.completed && missionState.progress >= missionState.target) {
    missionState.completed = true;
    // ミッション達成でゴールドボーナスを付与（プレイ中のみ。ショップで使える）
    if (typeof isGameOver !== 'undefined' && !isGameOver && typeof score === 'number') {
      addScore(300);
    }
    SoundManager.missionComplete();
    updateMissionStreak();
    showMissionComplete();
  }
  saveMissionState();
  renderMissionUI();
}

function showMissionComplete() {
  const ex = document.getElementById('mission-complete-popup'); if (ex) ex.remove();
  const el = document.createElement('div'); el.id = 'mission-complete-popup';
  el.innerHTML = '🎉 <span style="font-size:0.9rem">デイリーミッション達成！ +300 GOLD</span>';
  document.getElementById('app').appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

// ===== 難易度選択 =====
// ===== 自己ベスト表示を殿堂ランキングの実際の記録と同期 =====
// 端末のローカル保存値とランキングの記録がズレることがあるため、
// 起動時にFirestore側の値を正として取得し、表示・ローカル保存を上書きする。
function syncBestScoreFromRanking() {
  if (!window.loadMyBest) return;
  window.loadMyBest().then((record) => {
    if (!record) return;
    if (record.score !== bestScore) {
      bestScore = record.score;
      localStorage.setItem('monsterMergeBest', bestScore);
      const el = document.getElementById('best-display');
      if (el) el.textContent = bestScore;
    }
  }).catch(() => {});
}

function updateSoundToggleLabel() {
  const btn = document.getElementById('sound-toggle-btn');
  if (!btn) return;
  btn.textContent = SoundManager.muted ? '🔇' : '🔊';
  btn.title = SoundManager.muted ? 'サウンド: OFF（タップでON）' : 'サウンド: ON（タップでOFF）';
}

function initDifficultyUI() {
  const btn = document.getElementById('difficulty-btn');
  if (btn) btn.title = `難易度：${DIFFICULTIES[currentDifficulty].label}`;
}

function applyDifficulty(id) {
  currentDifficulty = id;
  localStorage.setItem('monsterMergeDifficulty', id);
  const btn = document.getElementById('difficulty-btn');
  if (btn) btn.title = `難易度：${DIFFICULTIES[id].label}`;
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

// ===== モンスターキャッチ =====
const CATCH_LIVES_START = 3;
const CATCH_TIME_LIMIT = 60000; // 60秒の制限時間

let catchCanvas, catchCtx;
let catchActive = false;
let catchAnimHandle = null;
let catchLastTs = 0;
let catchScore = 0;
let catchBest = parseInt(localStorage.getItem('monsterMergeCatchBest') || '0');
let catchLives = CATCH_LIVES_START;
let catchCombo = 0;
let catchElapsed = 0;
let catchTimeLeft = CATCH_TIME_LIMIT;
let catchSpawnTimer = 0;
let catchSpawnInterval = 1000;
let catchFallSpeed = 1.6;
let catchObjects = [];
let catchParticles = [];
let catcherX = 0;
const catcherW = 92;
let catcherTargetX = 0;
let catchWidth = 0, catchHeight = 0;
let catchMagnetUntil = 0;

function openMonsterCatch() {
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('catch-screen').classList.remove('hidden');
  document.getElementById('catch-result-screen').classList.add('hidden');
  document.getElementById('catch-ready-overlay').classList.remove('hidden');
  initCatchCanvas();
  resetCatchState();
  renderCatchFrame();
  syncCatchBestFromRanking();
}

function closeCatchToTitle() {
  stopCatchLoop();
  document.getElementById('catch-screen').classList.add('hidden');
  document.getElementById('catch-result-screen').classList.add('hidden');
  document.getElementById('title-screen').classList.remove('hidden');
}

function initCatchCanvas() {
  catchCanvas = document.getElementById('catch-canvas');
  catchCtx = catchCanvas.getContext('2d');
  const fieldEl = document.getElementById('catch-field');
  const cssW = fieldEl.clientWidth;
  const cssH = fieldEl.clientHeight;
  catchWidth = cssW; catchHeight = cssH;
  catchCanvas.width  = cssW * DPR;
  catchCanvas.height = cssH * DPR;
  catchCanvas.style.width  = cssW + 'px';
  catchCanvas.style.height = cssH + 'px';
  catchCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

  if (!catchCanvas.dataset.bound) {
    catchCanvas.addEventListener('pointerdown', onCatchPointerDown);
    catchCanvas.addEventListener('pointermove', onCatchPointerMove);
    catchCanvas.addEventListener('pointerup', onCatchPointerUp);
    catchCanvas.addEventListener('pointercancel', onCatchPointerUp);
    catchCanvas.addEventListener('pointerleave', onCatchPointerUp);
    catchCanvas.dataset.bound = '1';
  }
  catcherX = cssW / 2;
  catcherTargetX = catcherX;
}

// 指がカゴを覆い隠してしまう問題への対策：
// 触れた位置に直接カゴを合わせるのではなく、ドラッグした「移動量（相対値）」でカゴを動かす。
// これにより、画面のどこを触ってもカゴを操作でき、カゴの真上を触る必要がなくなる。
let catchDragActive = false;
let catchDragStartX = null;
let catchDragStartCatcherX = null;

function onCatchPointerDown(e) {
  const rect = catchCanvas.getBoundingClientRect();
  catchDragActive = true;
  catchDragStartX = e.clientX - rect.left;
  catchDragStartCatcherX = catcherTargetX;
}
function onCatchPointerMove(e) {
  if (!catchDragActive) return;
  const rect = catchCanvas.getBoundingClientRect();
  const curX = e.clientX - rect.left;
  catcherTargetX = catchDragStartCatcherX + (curX - catchDragStartX);
}
function onCatchPointerUp() {
  catchDragActive = false;
}

function resetCatchState() {
  catchScore = 0;
  catchLives = CATCH_LIVES_START;
  catchCombo = 0;
  catchElapsed = 0;
  catchTimeLeft = CATCH_TIME_LIMIT;
  catchSpawnTimer = 0;
  catchSpawnInterval = 1000;
  catchFallSpeed = 1.6;
  catchObjects = [];
  catchParticles = [];
  catchMagnetUntil = 0;
  updateCatchHud();
  renderCatchLives();
}

function startCatchGame() {
  document.getElementById('catch-ready-overlay').classList.add('hidden');
  resetCatchState();
  catchActive = true;
  catchLastTs = performance.now();
  if (catchAnimHandle) cancelAnimationFrame(catchAnimHandle);
  catchAnimHandle = requestAnimationFrame(catchGameLoop);
}

function stopCatchLoop() {
  catchActive = false;
  if (catchAnimHandle) cancelAnimationFrame(catchAnimHandle);
  catchAnimHandle = null;
}

function updateCatchHud() {
  document.getElementById('catch-score').textContent = catchScore;
  document.getElementById('catch-best').textContent = catchBest;
  const timeEl = document.getElementById('catch-time');
  if (timeEl) {
    const secs = Math.max(0, Math.ceil(catchTimeLeft / 1000));
    timeEl.textContent = secs + 's';
    timeEl.classList.toggle('catch-time-warning', secs <= 10);
  }
}

function renderCatchLives() {
  const el = document.getElementById('catch-lives');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < CATCH_LIVES_START; i++) {
    const span = document.createElement('span');
    span.textContent = '❤️';
    if (i >= catchLives) span.classList.add('life-lost');
    el.appendChild(span);
  }
}

// ---- 出現アイテムの重み付き抽選（階層が上がるほど出にくい／爆弾はスリルが出る程度の頻度）----
function randomCatchIdx() {
  const roll = Math.random();
  if (roll < 0.10) return 'bomb';
  if (roll < 0.15) return 'rainbow';
  const pool = 10;
  let total = 0;
  const weights = [];
  for (let i = 0; i < pool; i++) { const w = pool - i; weights.push(w); total += w; }
  let r = Math.random() * total;
  for (let i = 0; i < pool; i++) { if (r < weights[i]) return i; r -= weights[i]; }
  return 0;
}

function spawnCatchObject() {
  const idx = randomCatchIdx();
  const mon = monsterDef(idx);
  const r = Math.max(18, Math.min(34, mon.radius * 0.42));
  const x = r + Math.random() * (catchWidth - r * 2);
  catchObjects.push({
    idx, x, y: -r, r,
    vy: catchFallSpeed * (0.85 + Math.random() * 0.3),
    rot: 0,
    rotSpeed: (Math.random() - 0.5) * 0.04,
  });
}

function catchGameLoop(ts) {
  if (!catchActive) return;
  const dt = Math.min(50, ts - catchLastTs);
  catchLastTs = ts;
  catchElapsed += dt;
  catchTimeLeft -= dt;
  updateCatchHud();

  // 難易度上昇：10秒ごとに少しずつ速く・頻繁に（上限あり）
  const stage = Math.floor(catchElapsed / 10000);
  catchSpawnInterval = Math.max(360, 1000 - stage * 70);
  catchFallSpeed = Math.min(6.5, 1.6 + stage * 0.35);

  catchSpawnTimer += dt;
  if (catchSpawnTimer >= catchSpawnInterval) {
    catchSpawnTimer = 0;
    spawnCatchObject();
  }

  // キャッチャー位置をなめらかに追従
  catcherX += (catcherTargetX - catcherX) * 0.25;
  catcherX = Math.max(catcherW / 2, Math.min(catchWidth - catcherW / 2, catcherX));

  const effectiveCatcherW = Date.now() < catchMagnetUntil ? catcherW * 1.6 : catcherW;
  const basketDepth = 34; // drawCatcher()の高さhと一致させる
  const basketTopY = catchHeight - 54;
  const basketBottomY = basketTopY + basketDepth;

  for (let i = catchObjects.length - 1; i >= 0; i--) {
    const o = catchObjects[i];
    const f = dt / 16.6;
    o.y += o.vy * f;
    o.rot += o.rotSpeed * f;

    // カゴの実際の奥行き範囲に入っていて、かつカゴの開口部の内側に
    // ほぼ収まっている場合のみキャッチ成立（縁をかすっただけでは捕まえない）
    if (o.y + o.r >= basketTopY && o.y - o.r <= basketBottomY) {
      const withinX = Math.abs(o.x - catcherX) <= (effectiveCatcherW / 2 - o.r * 0.35);
      if (withinX) {
        onCatchObject(o);
        catchObjects.splice(i, 1);
        continue;
      }
    }
    if (o.y - o.r > basketBottomY) {
      if (typeof o.idx === 'number') {
        catchCombo = 0;
        SoundManager.catchMiss();
      }
      catchObjects.splice(i, 1);
    }
  }

  updateCatchParticles(dt);
  renderCatchFrame();

  if (catchLives <= 0 || catchTimeLeft <= 0) {
    endCatchGame();
    return;
  }
  catchAnimHandle = requestAnimationFrame(catchGameLoop);
}

function onCatchObject(o) {
  const mon = monsterDef(o.idx);
  const catchY = catchHeight - 54;

  if (o.idx === 'bomb') {
    catchLives--;
    catchCombo = 0;
    SoundManager.catchBomb();
    triggerScreenShake(1);
    triggerVibration([40, 30, 40]);
    spawnCatchBurst(o.x, catchY, '#ff5500', 16);
    renderCatchLives();
  } else if (o.idx === 'rainbow') {
    catchMagnetUntil = Date.now() + 6000;
    catchScore += 30;
    SoundManager.catchRainbow();
    spawnCatchBurst(o.x, catchY, '#ffffff', 20);
  } else {
    const gain = 5 + o.idx * 4;
    catchCombo++;
    const comboMult = 1 + Math.min(catchCombo, 10) * 0.08;
    catchScore += Math.round(gain * comboMult);
    if (catchCombo >= 3) {
      SoundManager.catchCombo(catchCombo);
      showCatchComboBadge(catchCombo);
    } else {
      SoundManager.catchGood(o.idx);
    }
    spawnCatchBurst(o.x, catchY, mon.magic, 10);
  }

  updateCatchHud();
  if (catchScore > catchBest) {
    catchBest = catchScore;
    localStorage.setItem('monsterMergeCatchBest', catchBest);
    document.getElementById('catch-best').textContent = catchBest;
  }
}

function showCatchComboBadge(combo) {
  const el = document.getElementById('catch-combo-badge');
  if (!el) return;
  el.textContent = `${combo}連続！`;
  el.classList.remove('hidden');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.add('hidden'), 900);
}

// ---- パーティクル ----
function spawnCatchBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    catchParticles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5,
      size: 2 + Math.random() * 3, color, life: 1, decay: 0.02 + Math.random() * 0.02,
    });
  }
}
function updateCatchParticles(dt) {
  const f = dt / 16.6;
  for (let i = catchParticles.length - 1; i >= 0; i--) {
    const p = catchParticles[i];
    p.x += p.vx * f; p.y += p.vy * f; p.vy += 0.08 * f;
    p.life -= p.decay * f;
    if (p.life <= 0) catchParticles.splice(i, 1);
  }
}

// ---- 描画 ----
function renderCatchFrame() {
  if (!catchCtx) return;
  catchCtx.clearRect(0, 0, catchWidth, catchHeight);
  catchObjects.forEach(o => drawCatchObject(o));
  drawCatcher();
  catchParticles.forEach(p => {
    catchCtx.save();
    catchCtx.globalAlpha = Math.max(0, p.life);
    catchCtx.beginPath(); catchCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    catchCtx.fillStyle = p.color; catchCtx.shadowColor = p.color; catchCtx.shadowBlur = 6;
    catchCtx.fill();
    catchCtx.restore();
  });
}

function drawCatchObject(o) {
  const mon = monsterDef(o.idx);
  catchCtx.save();
  catchCtx.translate(o.x, o.y);

  const glow = catchCtx.createRadialGradient(0, 0, o.r * 0.6, 0, 0, o.r * 1.3);
  glow.addColorStop(0, 'transparent'); glow.addColorStop(1, mon.magic + '44');
  catchCtx.beginPath(); catchCtx.arc(0, 0, o.r * 1.3, 0, Math.PI * 2);
  catchCtx.fillStyle = glow; catchCtx.fill();

  catchCtx.save();
  catchCtx.rotate(o.rot);
  catchCtx.beginPath(); catchCtx.arc(0, 0, o.r, 0, Math.PI * 2); catchCtx.clip();
  renderMonsterArt(catchCtx, mon, o.r);
  catchCtx.restore();

  catchCtx.beginPath(); catchCtx.arc(0, 0, o.r, 0, Math.PI * 2);
  catchCtx.strokeStyle = mon.magic + 'cc'; catchCtx.lineWidth = 1.5; catchCtx.stroke();
  catchCtx.restore();
}

function drawCatcher() {
  const y = catchHeight - 54;
  const bonus = Date.now() < catchMagnetUntil;
  const w = bonus ? catcherW * 1.6 : catcherW;
  const h = 34;
  catchCtx.save();
  catchCtx.translate(catcherX, y);

  if (bonus) {
    catchCtx.beginPath();
    catchCtx.ellipse(0, h * 0.1, w / 2 + 8, h * 0.55 + 6, 0, 0, Math.PI * 2);
    catchCtx.strokeStyle = 'rgba(255,255,255,0.6)'; catchCtx.lineWidth = 3;
    catchCtx.shadowColor = '#fff'; catchCtx.shadowBlur = 12;
    catchCtx.stroke();
    catchCtx.shadowBlur = 0;
  }

  catchCtx.beginPath();
  catchCtx.moveTo(-w / 2, 0);
  catchCtx.lineTo(w / 2, 0);
  catchCtx.lineTo(w / 2 - 10, h);
  catchCtx.lineTo(-w / 2 + 10, h);
  catchCtx.closePath();
  const grad = catchCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#8a5a2a'); grad.addColorStop(1, '#5a3616');
  catchCtx.fillStyle = grad; catchCtx.fill();
  catchCtx.strokeStyle = '#3a2410'; catchCtx.lineWidth = 2; catchCtx.stroke();

  catchCtx.strokeStyle = 'rgba(0,0,0,0.25)'; catchCtx.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    catchCtx.beginPath();
    catchCtx.moveTo(i * (w / 8), 2);
    catchCtx.lineTo(i * (w / 9), h - 2);
    catchCtx.stroke();
  }

  catchCtx.beginPath();
  catchCtx.ellipse(0, 0, w / 2, 7, 0, 0, Math.PI * 2);
  catchCtx.fillStyle = '#d4a012'; catchCtx.fill();
  catchCtx.strokeStyle = '#8a6a10'; catchCtx.lineWidth = 1.5; catchCtx.stroke();

  catchCtx.restore();
}

function endCatchGame() {
  stopCatchLoop();
  SoundManager.catchGameOver();
  triggerVibration([50, 40, 50, 40, 90]);
  document.getElementById('catch-screen').classList.add('hidden');
  document.getElementById('catch-result-screen').classList.remove('hidden');
  document.getElementById('catch-result-score').textContent = catchScore;
  document.getElementById('catch-result-best').textContent = catchBest;
  autoSubmitCatchScore();
}

// ===== モンスターキャッチ：スコア自動登録（MMQ本編と同じ保存名を使い回す） =====
function autoSubmitCatchScore() {
  const statusEl = document.getElementById('catch-result-status');
  const savedName = localStorage.getItem('monsterMergePlayerName');
  if (!savedName) {
    if (statusEl) statusEl.textContent = '（名前未設定：本編を1度プレイすると記録されます）';
    return;
  }
  if (!window.submitCatchScore) return;
  if (statusEl) statusEl.textContent = 'ランキングを確認中...';
  window.submitCatchScore(savedName, catchScore).then((result) => {
    if (!statusEl) return;
    if (result && result.updated) {
      statusEl.textContent = `🎉 ${savedName} さんの自己ベストを更新！`;
      SoundManager.rankUpdate();
    } else {
      statusEl.textContent = `✅ ${savedName} として記録済み`;
    }
  }).catch(() => {
    if (statusEl) statusEl.textContent = '登録に失敗しました';
  });
}

// ===== モンスターキャッチの自己ベストをランキングと同期 =====
function syncCatchBestFromRanking() {
  if (!window.loadMyCatchBest) return;
  window.loadMyCatchBest().then((record) => {
    if (!record) return;
    if (record.score !== catchBest) {
      catchBest = record.score;
      localStorage.setItem('monsterMergeCatchBest', catchBest);
      const el = document.getElementById('catch-best');
      if (el) el.textContent = catchBest;
    }
  }).catch(() => {});
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
  // 初回操作でオーディオのロックを解除（ブラウザの自動再生制限対策）
  const unlockOnce = () => { SoundManager.unlock(); document.removeEventListener('pointerdown', unlockOnce); };
  document.addEventListener('pointerdown', unlockOnce, { once: true });

  // ボタン全般に軽いクリック音（個別に専用音がある場合は上に重なる程度で自然に馴染む）
  document.addEventListener('click', (e) => {
    if (e.target.closest('button')) SoundManager.buttonClick();
  });

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
  isGameOver = false; score = 0; gold = 0; dangerAvoidUsesLeft = 3; dangerStartTime = null; mergeGraceEntries = []; resetHold();
  particles = []; mergeQueue = []; isTouching = false;
  document.getElementById('score-display').textContent = '0';
  document.getElementById('gold-display').textContent = '0';
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
  currentIdx = randomDropIdx(); nextIdx = randomDropIdx(); nextNextIdx = randomDropIdx(); drawNextNextMonster();
  drawNextMonster();
  maybeShowHoldTutorial();
}

// ===== HOLD機能の使い方案内（初回プレイ時のみ） =====
function maybeShowHoldTutorial() {
  if (localStorage.getItem('monsterMergeHoldTutorialShown')) return;
  localStorage.setItem('monsterMergeHoldTutorialShown', '1');

  setTimeout(() => {
    const panel = document.getElementById('hold-panel');
    if (!panel) return;
    const existing = document.getElementById('hold-tutorial-tip');
    if (existing) existing.remove();

    const tip = document.createElement('div');
    tip.id = 'hold-tutorial-tip';
    tip.innerHTML = `
      <div id="hold-tutorial-arrow"></div>
      <div id="hold-tutorial-box">
        <div id="hold-tutorial-title">💡 HOLDってなに？</div>
        <div id="hold-tutorial-text">今のモンスターを1体だけキープできます。タップして後で使いましょう！</div>
        <button id="hold-tutorial-close">わかった！</button>
      </div>
    `;
    document.getElementById('app').appendChild(tip);

    const dismiss = () => tip.remove();
    document.getElementById('hold-tutorial-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 6000);
  }, 600);
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
  SoundManager.gameOver();
  document.getElementById('final-score').textContent = score;
  document.getElementById('gameover-screen').classList.remove('hidden');
  autoSubmitScore();
}

function restartGame() {
  isGameOver = false; score = 0; gold = 0; dangerAvoidUsesLeft = 3; dangerStartTime = null; mergeGraceEntries = []; resetHold();
  particles = []; mergeQueue = []; isTouching = false;
  document.getElementById('score-display').textContent = '0';
  document.getElementById('gold-display').textContent = '0';
  document.getElementById('gameover-screen').classList.add('hidden');
  for (const m of bodies) World.remove(world, m.body);
  bodies = [];
  rebuildWalls();
  Runner.run(runner, engine);
  currentIdx = randomDropIdx(); nextIdx = randomDropIdx(); nextNextIdx = randomDropIdx(); drawNextNextMonster();
  drawNextMonster();
}

// ===== スコア自動登録 =====
// 手動での「殿堂入り」ボタン操作は不要。保存済みの名前で自動的に送信する。
// 初回のみ名前を尋ね、以降はその名前を使い回す（変更も可能）。
function autoSubmitScore() {
  const savedName = localStorage.getItem('monsterMergePlayerName');
  if (!savedName) {
    const section = document.getElementById('gameover-name-section');
    section.innerHTML = `
      <input id="player-name" type="text" placeholder="冒険者の名前..." maxlength="12">
      <button id="submit-score-btn">殿堂入り</button>
    `;
    document.getElementById('submit-score-btn').addEventListener('click', () => {
      const name = (document.getElementById('player-name').value.trim() || '名無し').slice(0, 12);
      localStorage.setItem('monsterMergePlayerName', name);
      doSubmitScore(name);
    });
    return;
  }
  doSubmitScore(savedName);
}

function doSubmitScore(name) {
  const section = document.getElementById('gameover-name-section');
  section.innerHTML = '<div style="color:var(--text-dim);font-size:0.75rem;">ランキングを確認中...</div>';
  if (!window.submitScore) return;
  window.submitScore(name, score).then((result) => {
    const updated = result && result.updated;
    if (updated) SoundManager.rankUpdate();
    const message = updated
      ? `🎉 ${name} さんの自己ベストを更新！`
      : `✅ ${name} として記録済み（自己ベスト: ${result ? result.best : score}）`;
    section.innerHTML = `
      <div style="color:#5fcf7a;font-size:0.85rem;">${message}</div>
      <button id="change-name-btn" style="margin-top:8px;font-size:0.62rem;">名前を変更する</button>
    `;
    document.getElementById('change-name-btn').addEventListener('click', () => {
      const current = localStorage.getItem('monsterMergePlayerName') || '';
      const input = prompt('冒険者の名前を入力してください（12文字まで）', current);
      if (input && input.trim()) {
        const trimmed = input.trim().slice(0, 12);
        localStorage.setItem('monsterMergePlayerName', trimmed);
        doSubmitScore(trimmed);
      }
    });
  }).catch(() => {
    section.innerHTML = '<div style="color:var(--accent-red);font-size:0.75rem;">登録に失敗しました</div>';
  });
}

// ===== ボタンバインドはDOMContentLoaded内で行う =====

let currentRankingBoard = 'mmq';

function showRanking(fromTitle = false, board = 'mmq') {
  if (fromTitle) document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('ranking-screen').classList.remove('hidden');
  loadRankingBoard(board);
}

function loadRankingBoard(board) {
  currentRankingBoard = board;
  document.querySelectorAll('.ranking-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.board === board);
  });
  document.getElementById('ranking-list').innerHTML =
    '<div style="color:#7a6040;text-align:center;padding:20px;">読み込み中...</div>';

  const loader = board === 'catch' ? window.loadCatchRanking : window.loadRanking;
  if (loader) { loader().then(entries => renderRanking(entries)); }
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

  document.querySelectorAll('.ranking-tab').forEach(tab => {
    tab.addEventListener('click', () => loadRankingBoard(tab.dataset.board));
  });

  document.getElementById('catch-result-ranking-btn').addEventListener('click', () => {
    document.getElementById('catch-result-screen').classList.add('hidden');
    document.getElementById('ranking-screen').classList.remove('hidden');
    loadRankingBoard('catch');
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

  // ===== モンスターキャッチ =====
  document.getElementById('catch-game-btn').addEventListener('click', openMonsterCatch);
  document.getElementById('catch-start-btn').addEventListener('click', startCatchGame);
  document.getElementById('catch-home-btn').addEventListener('click', () => {
    if (!catchActive) { closeCatchToTitle(); return; }
    showConfirm('モンスターキャッチを終了して<br>タイトルに戻りますか？', () => {
      closeCatchToTitle();
    });
  });
  document.getElementById('catch-retry-btn').addEventListener('click', () => {
    document.getElementById('catch-result-screen').classList.add('hidden');
    document.getElementById('catch-screen').classList.remove('hidden');
    startCatchGame();
  });
  document.getElementById('catch-result-close-btn').addEventListener('click', closeCatchToTitle);

  // ===== サウンド ON/OFF =====
  updateSoundToggleLabel();
  document.getElementById('sound-toggle-btn').addEventListener('click', () => {
    SoundManager.unlock(); // 未初期化ならここで初期化も兼ねる
    const muted = SoundManager.toggleMute();
    updateSoundToggleLabel();
    if (!muted) SoundManager.buttonClick();
  });

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

