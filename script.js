const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const toggleBtn = document.getElementById('tog');
const lC = document.getElementById('lC');
const lT = document.getElementById('lT');

const C = 10;
const W = canvas.width;

let s = [{x:200,y:200},{x:190,y:200},{x:180,y:200},{x:170,y:200},{x:160,y:200}];
let dx = C, dy = 0, score = 0, changing = false, over = false, started = false;
let speed = 80, speedUp = false, teleport = true, fx, fy;

function clear() {
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, W, W);
  for (let i = 0; i < W/C; i++) for (let j = 0; j < W/C; j++) {
    if ((i+j)%2===0) { ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fillRect(i*C, j*C, C, C); }
  }
  ctx.strokeStyle = teleport ? 'rgba(255,215,0,.3)' : 'rgba(233,69,96,.3)';
  ctx.lineWidth = teleport ? 2 : 3;
  if (teleport) ctx.setLineDash([5,5]);
  ctx.strokeRect(0, 0, W, W);
  ctx.setLineDash([]);
}

function rand(mn,mx) { return Math.round((Math.random()*(mx-mn)+mn)/C)*C; }

function food() {
  do { fx = rand(0,W-C); fy = rand(0,W-C); } while (s.some(p => p.x===fx && p.y===fy));
}

function drawFood() {
  let g = ctx.createRadialGradient(fx+5,fy+5,1,fx+5,fy+5,7);
  g.addColorStop(0,'#ff6b6b'); g.addColorStop(1,'#c0392b');
  ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 10;
  ctx.fillStyle = g; ctx.fillRect(fx+1,fy+1,C-2,C-2);
  ctx.shadowBlur = 0;
}

function drawPart(p,i) {
  let x = p.x, y = p.y;
  if (i===0) {
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 15;
    ctx.fillStyle = '#00ff88'; ctx.fillRect(x+1,y+1,C-2,C-2);
    ctx.fillStyle = '#00cc77'; ctx.fillRect(x+3,y+3,2,2); ctx.fillRect(x+5,y+3,2,2);
    ctx.shadowBlur = 0;
  } else {
    let g = ctx.createLinearGradient(x,y,x+C,y+C);
    let b = .7 + (i/s.length)*.3;
    g.addColorStop(0,`rgba(46,204,113,${b})`); g.addColorStop(1,`rgba(39,174,96,${b})`);
    ctx.fillStyle = g; ctx.fillRect(x+1,y+1,C-2,C-2);
  }
}

function draw() { s.forEach((p,i) => drawPart(p,i)); }

function teleportSnake() {
  if (!teleport) return;
  if (s[0].x < 0) s[0].x = W-C;
  if (s[0].x >= W) s[0].x = 0;
  if (s[0].y < 0) s[0].y = W-C;
  if (s[0].y >= W) s[0].y = 0;
}

function move() {
  s.unshift({x:s[0].x+dx, y:s[0].y+dy});
  teleportSnake();
  if (s[0].x===fx && s[0].y===fy) {
    score += 10;
    document.getElementById('score').textContent = score;
    food();
  } else s.pop();
}

function end() {
  for (let i=4; i<s.length; i++) if (s[i].x===s[0].x && s[i].y===s[0].y) return 1;
  if (!teleport) {
    let l = s[0].x<0, r = s[0].x>W-C, t = s[0].y<0, b = s[0].y>W-C;
    return l||r||t||b;
  }
  return 0;
}

function dir(e) {
  let k = e.keyCode;
  if (!started || changing) return;
  let up = dy===-C, down = dy===C, right = dx===C, left = dx===-C;
  let ndx=dx, ndy=dy;
  if (k===37 && !right) { ndx=-C; ndy=0; }
  else if (k===38 && !down) { ndx=0; ndy=-C; }
  else if (k===39 && !left) { ndx=C; ndy=0; }
  else if (k===40 && !up) { ndx=0; ndy=C; }
  else if (k===32) { speedUp=1; return; }
  else return;
  dx=ndx; dy=ndy; changing=1;
}

function reset() {
  s = [{x:200,y:200},{x:190,y:200},{x:180,y:200},{x:170,y:200},{x:160,y:200}];
  dx=C; dy=0; score=0; over=false; started=false; changing=false; speedUp=false; speed=80;
  document.getElementById('score').textContent = '0';
  startBtn.classList.remove('hidden');
  startBtn.textContent = 'START';
  food(); clear(); drawFood(); draw();
}

function startGame() {
  if (started) return;
  started = true; over = false;
  startBtn.classList.add('hidden');
  food();
  loop();
}

function toggle() {
  if (started) return;
  teleport = !teleport;
  toggleBtn.classList.toggle('active');
  lC.classList.toggle('active');
  lT.classList.toggle('active');
  toggleBtn.setAttribute('aria-checked', teleport ? 'true' : 'false');
  reset();
}

function loop() {
  if (!started) return;
  if (over) {
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(0,0,W,W);
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', W/2, W/2);
    started = false;
    return;
  }
  if (end()) { over = true; loop(); return; }
  let sp = speedUp ? 30 : speed - Math.min(score/10, 50);
  setTimeout(() => {
    changing = false;
    clear();
    drawFood();
    move();
    draw();
    loop();
  }, sp);
}

document.addEventListener('keydown', e => {
  if (e.keyCode === 82) reset();
  if (e.keyCode === 32) { speedUp = true; e.preventDefault(); }
  dir(e);
});
document.addEventListener('keyup', e => { if (e.keyCode === 32) { speedUp = false; e.preventDefault(); } });

startBtn.addEventListener('click', () => { if (!started) startGame(); });
toggleBtn.addEventListener('click', toggle);

food(); clear(); drawFood(); draw();
