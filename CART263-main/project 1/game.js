// Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Background
const bgParticles = [];
for (let i = 0; i < 150; i++) {
  bgParticles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 1,
    speed: 0.2 + Math.random() * 0.3,
    alpha: 0.2 + Math.random() * 0.3
  });
}

function interpolateColor(c1, c2, f) {
  const hexToRgb = c => {
    const num = parseInt(c.replace("#", ""), 16);
    return [num >> 16, (num >> 8) & 255, num & 255];
  };
  const [r1, g1, b1] = hexToRgb(c1), [r2, g2, b2] = hexToRgb(c2);
  const r = Math.round(r1 * (1 - f) + r2 * f), g = Math.round(g1 * (1 - f) + g2 * f), b = Math.round(b1 * (1 - f) + b2 * f);
  return `rgb(${r},${g},${b})`;
}

function drawBackground() {
  let waveFactor = Math.min(waveNumber / 10, 1);
  let darkFactor = darkTransition;
  const topColor = interpolateColor("#87CEEB", "#001f33", waveFactor + darkFactor);
  const midColor = interpolateColor("#4ecdc4", "#005577", waveFactor + darkFactor);
  const bottomColor = interpolateColor("#87CEEB", "#003366", waveFactor + darkFactor);
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, topColor);
  grad.addColorStop(0.5, midColor);
  grad.addColorStop(1, bottomColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Overlay for darkness transition
  if (darkTransition > 0) {
    ctx.save();
    ctx.globalAlpha = darkTransition;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Draw animated waves
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.globalAlpha = 0.15 + 0.05 * i;
    ctx.beginPath();
    let waveHeight = 30 + 20 * i;
    let waveY = canvas.height * (0.2 + 0.2 * i);
    for (let x = 0; x <= canvas.width; x += 10) {
      let y = waveY + Math.sin((x / 120) + performance.now() / (1200 + 300 * i)) * waveHeight;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = i === 0 ? '#aaf6ff' : i === 1 ? '#4ecdc4' : '#0077be';
    ctx.fill();
    ctx.restore();
  }

  // Draw sea plants
  for (let i = 0; i < 18; i++) {
    // Attach base to exact bottom border
    let baseX = (canvas.width / 18) * i + Math.sin(performance.now() / 1200 + i) * 10;
    let baseY = canvas.height; // Attach to bottom border
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    for (let j = 0; j < 6; j++) {
      let angle = Math.PI / 2 + Math.sin(performance.now() / 800 + i + j) * 0.2;
      let len = 18 + 6 * j;
      let x = baseX + Math.cos(angle) * len;
      let y = baseY - j * 18;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 3 === 0 ? '#2e8b57' : i % 3 === 1 ? '#228b22' : '#3cb371';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // Draw bubbles and sparkles
  bgParticles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.fill();
    // Add sparkle effect
    if (Math.random() < 0.05) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,200,0.3)';
      ctx.fill();
    }
    ctx.restore();
    p.y -= p.speed;
    if (p.y < -p.radius) p.y = canvas.height + p.radius;
  });
  // Optionally, add some fish silhouettes for extra vibrancy
  for (let i = 0; i < 6; i++) {
    let fishX = (canvas.width / 6) * i + Math.sin(performance.now() / 900 + i) * 40;
    let fishY = canvas.height * (0.3 + 0.1 * Math.sin(performance.now() / 1200 + i));
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.ellipse(fishX, fishY, 32, 12, Math.sin(performance.now() / 1500 + i), 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#003366' : '#005577';
    ctx.fill();
    ctx.restore();
  }
}

// Player (Worm)
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  color: "#ffcc00",
  segments: 10,
  segmentLength: 12,
  wiggleOffset: 0,
  segmentPositions: [] // For following effect
};

// Projectiles (Bubbles)
const projectiles = [];
const shootSpeed = 5;
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

// Particles
const particles = [];

// Game Stats
let enemiesDestroyed = 0;
let waveNumber = 1;

// Game State
let isGameOver = false;
let wavePaused = false;
const wavePauseTime = 5000;
let wavePauseStart = 0;

// Intro State
let showIntro = true;

// Intro Overlay
function drawIntro() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.font = '48px sans-serif';
  ctx.fillText('Survive the Depths!', canvas.width / 2, canvas.height / 2 - 60);
  ctx.font = '28px sans-serif';
  ctx.fillText('Objective: Avoid fish and hazards.', canvas.width / 2, canvas.height / 2);
  ctx.fillText('Left click shoots bubbles.', canvas.width / 2, canvas.height / 2 + 40);
  ctx.font = '22px sans-serif';
  ctx.fillText('Click anywhere to start.', canvas.width / 2, canvas.height / 2 + 90);
}

canvas.addEventListener('click', function introClick() {
  if (showIntro) {
    showIntro = false;
    canvas.removeEventListener('click', introClick);
  }
});

// Mouse Tracking
canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('click', () => { if (!isGameOver && !wavePaused) shootProjectile(); });

// Shoot Bubble
function shootProjectile() {
  const headX = player.x;
  const headY = player.y + Math.sin(player.wiggleOffset) * 10;
  const baseAngle = Math.atan2(mouse.y - headY, mouse.x - headX);

  // Create main projectile bubble
  projectiles.push({
    x: headX, y: headY, radius: 12, color: "#99ffff", // Main bubble, slightly bigger
    dx: Math.cos(baseAngle) * shootSpeed, dy: Math.sin(baseAngle) * shootSpeed,
    alpha: 1, decay: 0, isMain: true // No fade, marks as main projectile
  });

  // Create burst of 8 effect bubbles
  for (let i = 0; i < 8; i++) {
    const spread = (Math.random() - 0.5) * 0.5; // Small random spread
    const angle = baseAngle + spread;
    projectiles.push({
      x: headX, y: headY, radius: 10, color: "#99ffff", // Effect bubbles
      dx: Math.cos(angle) * shootSpeed, dy: Math.sin(angle) * shootSpeed,
      alpha: 1, decay: 0.08, isMain: false // Quick fade, not main
    });
  }

  // Add some extra particles for effect
  for (let i = 0; i < 12; i++) {
    const spread = (Math.random() - 0.5) * 0.8;
    const angle = baseAngle + spread;
    particles.push({
      x: headX, y: headY, radius: 3 + Math.random() * 3,
      color: "#66ffff",
      dx: (Math.cos(angle) * shootSpeed) + (Math.random() - 0.5),
      dy: (Math.sin(angle) * shootSpeed) + (Math.random() - 0.5),
      alpha: 1, decay: 0.05
    });
  }
}

// Draw Worm + Hook
function drawPlayer() {
  player.color = document.getElementById("playerColor").value;
  let headX = player.x;
  let headY = player.y + Math.sin(player.wiggleOffset) * 10;

  // Update segment positions for following effect
  if (!player.segmentPositions.length) {
    // Initialize segment positions
    for (let i = 0; i < player.segments; i++) {
      player.segmentPositions.push({ x: headX, y: headY + i * player.segmentLength });
    }
  }

  if (wormAtBottom) {
    // Move worm with arrow keys
    player.x += wormSwimDir.x * wormSwimSpeed;
    player.y += wormSwimDir.y * wormSwimSpeed;
    // Clamp to canvas (allow worm to swim up the y axis)
    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
    player.y = Math.max(20, Math.min(canvas.height - 20, player.y));
    headX = player.x;
    headY = player.y;
    // Move head segment
    player.segmentPositions[0] = { x: headX, y: headY };
    // Move each segment to follow the previous
    for (let i = 1; i < player.segments; i++) {
      let prev = player.segmentPositions[i - 1];
      let curr = player.segmentPositions[i];
      let dx = prev.x - curr.x;
      let dy = prev.y - curr.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      let targetDist = player.segmentLength;
      if (dist > 0) {
        let moveX = dx * 0.2;
        let moveY = dy * 0.2;
        curr.x += moveX;
        curr.y += moveY;
        // Add wiggle when moving
        curr.x += Math.sin(performance.now() / 120 + i * 0.5) * 2 * (wormSwimDir.x !== 0 ? 1 : 0);
        curr.y += Math.cos(performance.now() / 120 + i * 0.5) * 2 * (wormSwimDir.y !== 0 ? 1 : 0);
      }
      // Clamp segment to canvas (allow segments to follow past y axis)
      curr.x = Math.max(20, Math.min(canvas.width - 20, curr.x));
      curr.y = Math.max(20, Math.min(canvas.height - 20, curr.y));
      player.segmentPositions[i] = curr;
    }
  } else if (wormJumpTriggered && !wormAtBottom) {
    let elapsed = performance.now() - wormJumpStart;
    wormJumpProgress = Math.min(elapsed / wormJumpDuration, 1);
    darkTransition = Math.min(wormJumpProgress * 1.2, 1);
    headY = player.y + (wormSinkY - player.y) * wormJumpProgress;
    ctx.save();
    ctx.strokeStyle = `rgba(153,153,153,${1 - wormJumpProgress})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, 0);
    ctx.lineTo(headX, headY - 5);
    ctx.stroke();
    ctx.restore();
    // Animate segments falling
    for (let i = 0; i < player.segments; i++) {
      player.segmentPositions[i] = {
        x: headX,
        y: headY + i * player.segmentLength
      };
    }
    if (wormJumpProgress >= 1) {
      headY = wormSinkY;
      wormAtBottom = true;
      player.y = wormSinkY;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.font = '32px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('The worm can now swim!', canvas.width / 2, canvas.height / 2);
      ctx.restore();
    }
  } else {
    player.wiggleOffset += 0.1;
    headX = player.x;
    headY = player.y + Math.sin(player.wiggleOffset) * 10;
    player.segmentPositions[0] = { x: headX, y: headY };
    for (let i = 1; i < player.segments; i++) {
      let prev = player.segmentPositions[i - 1];
      let curr = player.segmentPositions[i];
      let dx = prev.x - curr.x;
      let dy = prev.y - curr.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      let targetDist = player.segmentLength;
      if (dist > 0) {
        let moveX = dx * 0.2;
        let moveY = dy * 0.2;
        curr.x += moveX;
        curr.y += moveY;
        // Idle wiggle
        curr.x += Math.sin(player.wiggleOffset + i * 0.5) * 2;
      }
      curr.x = Math.max(20, Math.min(canvas.width - 20, curr.x));
      curr.y = Math.max(0, Math.min(canvas.height - 20, curr.y));
      player.segmentPositions[i] = curr;
    }
    // Hook line
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, 0);
    ctx.lineTo(headX, headY - 5);
    ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(headX, headY - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Draw worm segments
  for (let i = 0; i < player.segments; i++) {
    const x = player.segmentPositions[i].x;
    const y = player.segmentPositions[i].y;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.ellipse(x, y, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, 4, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Draw worm head (larger ellipse)
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.ellipse(player.segmentPositions[0].x, player.segmentPositions[0].y, 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(player.segmentPositions[0].x, player.segmentPositions[0].y, 5, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.segmentPositions[0].x - 2, player.segmentPositions[0].y - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.segmentPositions[0].x + 2, player.segmentPositions[0].y - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(player.segmentPositions[0].x - 2, player.segmentPositions[0].y - 4, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.segmentPositions[0].x + 2, player.segmentPositions[0].y - 4, 1, 0, Math.PI * 2);
  ctx.fill();
}

// Draw Projectiles
function drawProjectiles() {
  projectiles.forEach((p, i) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;

    // Create radial gradient for realistic bubble effect
    const gradient = ctx.createRadialGradient(p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0, p.x, p.y, p.radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)'); // Bright center
    gradient.addColorStop(0.7, p.color); // Main color
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)'); // Dark edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Add highlight
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(p.x - p.radius * 0.4, p.y - p.radius * 0.4, p.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    p.x += p.dx; p.y += p.dy;
    p.alpha -= p.decay;

    // Only check collisions for main projectiles
    if (p.isMain) {
      // Check collision with barrels
      let hitBarrel = false;
      barrels.forEach((barrel, bIndex) => {
        if (Math.hypot(p.x - barrel.x, p.y - barrel.y) < barrel.radius + p.radius) {
          explodeBarrel(barrel);
          hitBarrel = true;
        }
      });

      // Check collision with mines
      let hitMine = false;
      seaMines.forEach((mine, mIndex) => {
        if (Math.hypot(p.x - mine.x, p.y - mine.y) < mine.radius + p.radius) {
          explodeMine(mine);
          hitMine = true;
        }
      });

      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || hitBarrel || hitMine) projectiles.splice(i, 1);
    } else {
      // Effect bubbles just fade out
      if (p.alpha <= 0) projectiles.splice(i, 1);
    }
  });
}

// Draw Particles
function drawParticles() {
  particles.forEach((part, i) => {
    ctx.save(); ctx.globalAlpha = part.alpha;
    ctx.fillStyle = part.color;
    ctx.beginPath(); ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2); ctx.fill();
    part.x += part.dx; part.y += part.dy;
    part.alpha -= part.decay;
    if (part.alpha <= 0) particles.splice(i, 1);
    ctx.restore();
  });
}

// Enemies (Fish)
const enemies = [];
let enemiesPerWave = 5;
let enemyBaseSpeed = 0.8;
const enemyColorInput = document.getElementById("enemyColor");
const enemySpeedInput = document.getElementById("enemySpeed");
const ENEMY_TYPES = ['smallFish', 'mediumFish', 'bigFish']
// Spawn Enemy
function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if (side === 0) { x = Math.random() * canvas.width; y = -30; }
  if (side === 1) { x = Math.random() * canvas.width; y = canvas.height + 30; }
  if (side === 2) { x = -30; y = Math.random() * canvas.height; }
  if (side === 3) { x = canvas.width + 30; y = Math.random() * canvas.height; }

  let typeIndex = Math.min(waveNumber - 1, ENEMY_TYPES.length - 1);
  let type = ENEMY_TYPES[Math.floor(Math.random() * (typeIndex + 1))];
  let health = type === 'smallFish' ? 1 : type === 'mediumFish' ? 2 : 3;
  enemies.push({
    x, y, type,
    radius: type === 'smallFish' ? 12 : type === 'mediumFish' ? 20 : 30,
    color: enemyColorInput.value,
    health, maxHealth: health,
    baseSpeed: type === 'bigFish' ? enemyBaseSpeed * 0.6 : enemyBaseSpeed
  });
}

// Initial wave
for (let i = 0; i < enemiesPerWave; i++) spawnEnemy();

// Enemy Death Particles
function spawnDeathParticles(enemy) {
  const x = enemy.x, y = enemy.y;
  const colors = { 'smallFish': '#66ff66', 'mediumFish': '#ff9966', 'bigFish': '#ff66ff' };
  const count = enemy.type === 'mediumFish' ? 20 : (enemy.type === 'bigFish' ? 15 : 12);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({ x, y, radius: 3 + Math.random() * 2, color: colors[enemy.type], dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed, alpha: 1, decay: 0.02 });
  }
}

// Draw Enemies & Collision
function drawEnemies() {
  const deadEnemies = [];
  enemies.forEach(enemy => {
    const healthFactor = enemy.health / enemy.maxHealth;
    const speed = enemy.baseSpeed * healthFactor * (enemySpeedInput.value / 2);

    const targetX = player.x;
    const targetY = player.y + Math.sin(player.wiggleOffset) * 10; // worm head
    const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
    enemy.x += Math.cos(angle) * speed;
    enemy.y += Math.sin(angle) * speed;

    // Save context and rotate to face the worm
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(angle);

    // Draw fish - visually distinct types
    ctx.fillStyle = enemy.color;

    if (enemy.type === 'smallFish') {
      // Small fish - oval body with tail
      ctx.beginPath();
      ctx.ellipse(0, 0, enemy.radius * 1.2, enemy.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-enemy.radius * 1.2, -enemy.radius * 0.6);
      ctx.lineTo(-enemy.radius * 2, -enemy.radius * 0.8);
      ctx.lineTo(-enemy.radius * 2, enemy.radius * 0.8);
      ctx.lineTo(-enemy.radius * 1.2, enemy.radius * 0.6);
      ctx.closePath();
      ctx.fill();

      // Add eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(enemy.radius * 0.6, -enemy.radius * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(enemy.radius * 0.6, -enemy.radius * 0.3, 1.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (enemy.type === 'mediumFish') {
      // Medium fish - pointed head with body and tail fins
      ctx.beginPath();
      ctx.moveTo(enemy.radius * 1.2, 0); // pointed head
      ctx.lineTo(enemy.radius * 0.3, -enemy.radius * 0.8);
      ctx.lineTo(-enemy.radius * 0.5, -enemy.radius * 0.6);
      ctx.lineTo(-enemy.radius * 1.2, 0);
      ctx.lineTo(-enemy.radius * 0.5, enemy.radius * 0.6);
      ctx.lineTo(enemy.radius * 0.3, enemy.radius * 0.8);
      ctx.closePath();
      ctx.fill();

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-enemy.radius * 1.2, -enemy.radius * 0.4);
      ctx.lineTo(-enemy.radius * 2, -enemy.radius * 0.9);
      ctx.lineTo(-enemy.radius * 2, enemy.radius * 0.9);
      ctx.lineTo(-enemy.radius * 1.2, enemy.radius * 0.4);
      ctx.closePath();
      ctx.fill();

      // Add eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(enemy.radius * 0.5, -enemy.radius * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(enemy.radius * 0.5, -enemy.radius * 0.3, 1.5, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Big fish - large body with pronounced features
      const halfSize = enemy.radius;

      // Main body
      ctx.beginPath();
      ctx.moveTo(halfSize * 1.3, 0); // pointed head
      ctx.lineTo(halfSize * 0.5, -halfSize * 0.9);
      ctx.lineTo(-halfSize * 0.7, -halfSize * 0.9);
      ctx.lineTo(-halfSize * 1.2, 0);
      ctx.lineTo(-halfSize * 0.7, halfSize * 0.9);
      ctx.lineTo(halfSize * 0.5, halfSize * 0.9);
      ctx.closePath();
      ctx.fill();

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-halfSize * 1.2, -halfSize * 0.5);
      ctx.lineTo(-halfSize * 2, -halfSize * 1.1);
      ctx.lineTo(-halfSize * 2, halfSize * 1.1);
      ctx.lineTo(-halfSize * 1.2, halfSize * 0.5);
      ctx.closePath();
      ctx.fill();

      // Add dorsal fin
      ctx.beginPath();
      ctx.moveTo(-halfSize * 0.2, -halfSize * 0.9);
      ctx.lineTo(0, -halfSize * 1.4);
      ctx.lineTo(halfSize * 0.2, -halfSize * 0.9);
      ctx.closePath();
      ctx.fill();

      // Add gills (lines)
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(halfSize * 0.3, -halfSize * 0.6);
      ctx.lineTo(halfSize * 0.3, halfSize * 0.6);
      ctx.stroke();

      // Add big eyes
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(halfSize * 0.6, -halfSize * 0.5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(halfSize * 0.6, halfSize * 0.5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(halfSize * 0.6, -halfSize * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(halfSize * 0.6, halfSize * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // COLLISION with small head hitbox
    const headHitRadius = 8;
    if (Math.hypot(targetX - enemy.x, targetY - enemy.y) < headHitRadius + enemy.radius) {
      isGameOver = true;
    }

    // Projectile collision
    projectiles.forEach((p, pIndex) => {
      if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < enemy.radius + p.radius) {
        enemy.health--; projectiles.splice(pIndex, 1);
      }
    });

    if (enemy.health <= 0) {
      spawnDeathParticles(enemy);
      deadEnemies.push(enemy);
    }
  });
  deadEnemies.forEach(e => {
    const idx = enemies.indexOf(e);
    if (idx > -1) { enemies.splice(idx, 1); enemiesDestroyed++; }
  });
}

// Wave System
function checkWave() {
  if (enemies.length === 0 && !isGameOver && !wavePaused) {
    wavePaused = true; wavePauseStart = performance.now();
  }
  if (wavePaused) {
    const elapsed = performance.now() - wavePauseStart;
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '36px sans-serif';
    ctx.fillText(`Next Wave in ${Math.ceil((wavePauseTime - elapsed) / 1000)}`, canvas.width / 2, canvas.height / 2);
    if (elapsed >= wavePauseTime) {
      waveNumber++; enemiesPerWave += 2; enemyBaseSpeed += 0.2;
      for (let i = 0; i < enemiesPerWave; i++) spawnEnemy();
      wavePaused = false;
    }
  }
}

// Game Over
function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '48px sans-serif'; ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = '24px sans-serif'; ctx.fillText(`Wave Reached: ${waveNumber}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`Enemies Destroyed: ${enemiesDestroyed}`, canvas.width / 2, canvas.height / 2 + 40);
  ctx.fillStyle = '#00ffcc'; ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 80, 150, 50);
  ctx.fillStyle = 'black'; ctx.fillText("RESTART", canvas.width / 2, canvas.height / 2 + 115);
  canvas.addEventListener('click', handleRestartClick);
}
function handleRestartClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
  if (mouseX >= canvas.width / 2 - 75 && mouseX <= canvas.width / 2 + 75 &&
    mouseY >= canvas.height / 2 + 80 && mouseY <= canvas.height / 2 + 130) { resetGame(); canvas.removeEventListener('click', handleRestartClick); }
}
function resetGame() {
  window.location.reload();
}

// Barrels
const barrels = [];
let lastBarrelSpawn = performance.now();

function spawnBarrel() {
  const barrelCount = 2 + Math.floor(Math.random() * 2); // 2-3 barrels per spawn

  for (let i = 0; i < barrelCount; i++) {
    barrels.push({
      x: Math.random() * canvas.width,
      y: -30 - (Math.random() * 200), // Random vertical spread instead of fixed stagger
      radius: 15,
      color: "#8B4513",
      sinkSpeed: 0.3 + Math.random() * 0.4, // Random speed between 0.3-0.7
      health: 1,
      maxHealth: 1
    });
  }

  lastBarrelSpawn = performance.now();
}

function drawBarrels() {
  barrels.forEach((barrel, i) => {
    // Move barrel down
    barrel.y += barrel.sinkSpeed;

    // Draw barrel
    ctx.fillStyle = barrel.color;
    ctx.beginPath();
    ctx.ellipse(barrel.x, barrel.y, barrel.radius, barrel.radius * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Add barrel bands
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(barrel.x, barrel.y - barrel.radius * 0.6, barrel.radius, barrel.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(barrel.x, barrel.y + barrel.radius * 0.6, barrel.radius, barrel.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Remove if off screen
    if (barrel.y > canvas.height + 30) barrels.splice(i, 1);
  });
}

function checkBarrelSpawn() {
  const now = performance.now();
  const barrelSpawnInterval = 10000 + Math.random() * 5000; // 10-15 seconds
  if (now - lastBarrelSpawn > barrelSpawnInterval) {
    spawnBarrel();
  }
}

function explodeBarrel(barrel) {
  // Create explosion particles
  const explosionCount = 40;
  const colors = ["#FF4500", "#FFD700", "#FFA500"];

  for (let i = 0; i < explosionCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 6;
    particles.push({
      x: barrel.x,
      y: barrel.y,
      radius: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.015
    });
  }

  // Damage nearby enemies
  const explosionRadius = 150;
  enemies.forEach(enemy => {
    if (Math.hypot(enemy.x - barrel.x, enemy.y - barrel.y) < explosionRadius) {
      enemy.health -= 2;
    }
  });

  // Remove barrel
  const idx = barrels.indexOf(barrel);
  if (idx > -1) barrels.splice(idx, 1);
}

// Sea Mines
const seaMines = [];
let lastMineSpawn = performance.now();

function spawnMine() {
  // Only spawn if we have less than 2 mines
  if (seaMines.length >= 2) return;

  seaMines.push({
    x: Math.random() * canvas.width,
    y: canvas.height + 30 + (Math.random() * 200), // Start below screen
    radius: 20,
    color: "#2C2C2C",
    floatSpeed: 0.3 + Math.random() * 0.2, // Faster: 0.3-0.5
    health: 1,
    maxHealth: 1
  });

  lastMineSpawn = performance.now();
}

function drawSeaMines() {
  seaMines.forEach((mine, i) => {
    // Move mine up
    mine.y -= mine.floatSpeed;

    // Draw mine body
    ctx.fillStyle = mine.color;
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, mine.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw spikes around mine
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const spikeLength = mine.radius * 1.5;
      const x1 = mine.x + Math.cos(angle) * mine.radius;
      const y1 = mine.y + Math.sin(angle) * mine.radius;
      const x2 = mine.x + Math.cos(angle) * spikeLength;
      const y2 = mine.y + Math.sin(angle) * spikeLength;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Remove if off screen
    if (mine.y < -50) seaMines.splice(i, 1);
  });
}

function checkMineSpawn() {
  const now = performance.now();
  const mineSpawnInterval = 20000 + Math.random() * 10000; // 20-30 seconds
  if (seaMines.length < 2 && now - lastMineSpawn > mineSpawnInterval) {
    spawnMine();
  }
}

function explodeMine(mine) {
  // Create large explosion particles
  const explosionCount = 30;
  const colors = ["#FF6347", "#FF4500", "#FFD700", "#FFA500"];

  for (let i = 0; i < explosionCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    particles.push({
      x: mine.x,
      y: mine.y,
      radius: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.02
    });
  }

  // Kill the player no matter where they are
  isGameOver = true;

  // Remove mine
  const idx = seaMines.indexOf(mine);
  if (idx > -1) seaMines.splice(idx, 1);
}

// Worm Jump Sequence State
let wormSequence = '';
let wormJumpTriggered = false;
let wormJumpProgress = 0; // 0 to 1 for animation
let wormJumpStart = 0;
let wormJumpDuration = 2000; // ms for transition
let wormSinkY = null;
let darkTransition = 0; // 0 to 1
let wormAtBottom = false;
let wormSwimSpeed = 2.5;
let wormSwimDir = { x: 0, y: 0 };

// Listen for key sequence
window.addEventListener('keydown', function (e) {
  if (wormJumpTriggered || isGameOver) return;
  const key = e.key.toLowerCase();
  if ('worm'.includes(key)) {
    wormSequence += key;
    if (wormSequence.length > 4) wormSequence = wormSequence.slice(-4);
    if (wormSequence === 'worm') {
      wormJumpTriggered = true;
      wormJumpStart = performance.now();
      wormSinkY = canvas.height - 40;
    }
  } else {
    wormSequence = '';
  }
});

// Listen for arrow keys when worm is at bottom
window.addEventListener('keydown', function (e) {
  if (!wormAtBottom) return;
  if (e.key === 'ArrowLeft') wormSwimDir.x = -1;
  if (e.key === 'ArrowRight') wormSwimDir.x = 1;
  if (e.key === 'ArrowUp') wormSwimDir.y = -1;
  if (e.key === 'ArrowDown') wormSwimDir.y = 1;
});
window.addEventListener('keyup', function (e) {
  if (!wormAtBottom) return;
  if (e.key === 'ArrowLeft' && wormSwimDir.x === -1) wormSwimDir.x = 0;
  if (e.key === 'ArrowRight' && wormSwimDir.x === 1) wormSwimDir.x = 0;
  if (e.key === 'ArrowUp' && wormSwimDir.y === -1) wormSwimDir.y = 0;
  if (e.key === 'ArrowDown' && wormSwimDir.y === 1) wormSwimDir.y = 0;
});

// Update Game Loop
function gameLoop() {
  drawBackground();
  if (showIntro) {
    drawIntro();
  } else if (!isGameOver) {
    drawPlayer();
    if (!wormJumpTriggered || wormAtBottom) {
      drawProjectiles(); drawParticles();
      checkBarrelSpawn(); drawBarrels();
      checkMineSpawn(); drawSeaMines();
      if (!wavePaused) drawEnemies();
      checkWave();
    }
  } else {
    drawGameOver();
  }
  requestAnimationFrame(gameLoop);
}
gameLoop(); op();