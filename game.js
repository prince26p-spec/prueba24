
// --- CONFIGURACIÓN SUPABASE (Misma que script.js) ---
const supabaseUrl = 'https://fcckmkdgldgpypitcuko.supabase.co';
const supabaseKey = 'sb_publishable_E3O82jTp9UvqAVMLtP0S5w_1rzf7gB3'; // NOTE: Usually secrets, but client-side public key is fine for read if configured.
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- ASSETS ---
const ASSETS = {
    sprites: new Image(),
    bg: 'assets/bg.png', // Llevado por CSS
    // Mario Assets
    mario: {
        walk: { src: 'assets/mario/spr_mario_big_walkNes_strip4.png', frames: 4, img: null },
        run: { src: 'assets/mario/spr_mario_big_runNes_strip3.png', frames: 3, img: null },
        jump: { src: 'assets/mario/spr_mario_big_jumpNes.png', frames: 1, img: null },
        duck: { src: 'assets/mario/spr_mario_big_duckNes.png', frames: 1, img: null },
        skid: { src: 'assets/mario/spr_mario_big_skidNes.png', frames: 1, img: null },
        idle: { src: 'assets/mario/spr_mario_big_goalNes.png', frames: 1, img: null } // Placeholder for idle if no specific idle
    },
    tiles: {
        bg_classic: 'assets/objetos/bg_classic.png',
        castle: { src: 'assets/objetos/spr_incastle.png', img: null },
        coin: { src: 'assets/objetos/spr_coin_strip4.png', frames: 4, img: null },
        paragoomba: { src: 'assets/objetos/spr_paragoomba2_strip4.png', frames: 4, img: null },
        piranha: { src: 'assets/objetos/spr_firepiranha_strip8.png', frames: 8, img: null },
        pipe: { src: 'assets/objetos/bg_pipe.png', img: null },
        block_q: { src: 'assets/objetos/spr_qblock_winged_strip4.png', frames: 4, img: null },
        brick: { src: 'assets/objetos/spr_brick_strip4.png', frames: 4, img: null },
        qblock_base: { src: 'assets/objetos/spr_qblock_winged_strip4.png', frames: 4, img: null },
        desactivado: { src: 'assets/objetos/desactivado.png', img: null }, // Deactivated block
        fireflower: { src: 'assets/objetos/spr_fireflower_strip4.png', frames: 4, img: null }
    }
};
// Preload Mario & Object Assets
const preloadList = [
    ...Object.values(ASSETS.mario),
    ASSETS.tiles.castle,
    ASSETS.tiles.coin,
    ASSETS.tiles.paragoomba,
    ASSETS.tiles.piranha,
    ASSETS.tiles.pipe,
    ASSETS.tiles.block_q,
    ASSETS.tiles.brick,
    ASSETS.tiles.qblock_base,
    ASSETS.tiles.desactivado,
    ASSETS.tiles.fireflower
];
preloadList.forEach(obj => {
    if (obj && obj.src) {
        obj.img = new Image();
        obj.img.src = obj.src;
    }
});
ASSETS.sprites.src = 'assets/sprites.png';

// --- GAME CONSTANTS ---
const GRAVITY = 0.6;
const JUMP_FORCE = -16; // Increased from -12 to reach higher platforms
const SPEED = 6;
const TILE_SIZE = 48;

// Sprite Mapping - Assumes 4 rows in generated image
// Row 1: Player [Idle, Run1, Run2, Jump] (Approx)
// Row 2: Enemy [Walk1, Walk2, Dead, ...]
// Row 3: Ground, Brick, Question, Empty
// Row 4: Coin, Flower
const SPRITE_Sheet_W = 1024;
const CELL_SIZE = 256;

const SPRITES = {
    player: {
        idle: { x: 0, y: 0 },
        run: [{ x: 256, y: 0 }, { x: 512, y: 0 }],
        jump: { x: 512, y: 0 } // Re-using run frame for jump as it looks dynamic
    },
    enemy: {
        walk: [{ x: 0, y: 256 }, { x: 256, y: 256 }],
        dead: { x: 512, y: 256 }
    },
    ground: { x: 0, y: 512, w: 256, h: 256 },
    brick: { x: 256, y: 512, w: 256, h: 256 },
    question: { x: 512, y: 512, w: 256, h: 256 },
    empty: { x: 768, y: 512, w: 256, h: 256 },
    coin: { x: 0, y: 768, w: 256, h: 256 },
    flower: { x: 256, y: 768, w: 256, h: 256 }
};

// --- AUDIO SYSTEM (Html5 + Synth) ---
const GameAudio = {
    ctx: null,
    bgmAudio: new Audio('Sound/FondoMusica.mp3'),
    romanticAudio: null, // Will be created when needed
    brickBreak: new Audio('Sound/brick_break.mp3'),
    volume: 0.4,

    init: () => {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        GameAudio.ctx = new AudioContext();

        // Configure BGM
        GameAudio.bgmAudio.loop = true;
        GameAudio.bgmAudio.volume = GameAudio.volume;
        GameAudio.brickBreak.volume = GameAudio.volume;
    },

    setVolume: (val) => {
        GameAudio.volume = parseFloat(val);
        if (GameAudio.bgmAudio) {
            GameAudio.bgmAudio.volume = GameAudio.volume;
        }
    },

    playTone: (freq, type, duration) => {
        if (!GameAudio.ctx) return;
        const osc = GameAudio.ctx.createOscillator();
        const gain = GameAudio.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, GameAudio.ctx.currentTime);

        // Scale sound effects volume relative to master volume (slightly louder)
        const sfxVol = Math.min(1, GameAudio.volume + 0.1);

        gain.gain.setValueAtTime(0.1 * sfxVol, GameAudio.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, GameAudio.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(GameAudio.ctx.destination);
        osc.start();
        osc.stop(GameAudio.ctx.currentTime + duration);
    },
    jump: () => GameAudio.playTone(400, 'square', 0.1),
    coin: () => {
        GameAudio.playTone(600, 'sine', 0.1);
        setTimeout(() => GameAudio.playTone(900, 'sine', 0.2), 100);
    },
    bump: () => GameAudio.playTone(150, 'sawtooth', 0.1),
    breakBrick: () => GameAudio.playTone(200, 'square', 0.15),
    powerup: () => {
        let now = GameAudio.ctx.currentTime;
        [500, 600, 700, 800, 1000].forEach((f, i) => {
            const osc = GameAudio.ctx.createOscillator();
            const gain = GameAudio.ctx.createGain();
            osc.frequency.value = f;
            gain.gain.value = 0.05 * GameAudio.volume; // Adjust with volume
            gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
            osc.connect(gain);
            gain.connect(GameAudio.ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    },
    startBGM: () => {
        if (GameAudio.muted) return;
        // User interaction check safe
        GameAudio.bgmAudio.play().catch(e => console.log('Audio play failed (waiting for interaction):', e));
    },
    stopBGM: () => {
        GameAudio.bgmAudio.pause();
        GameAudio.bgmAudio.currentTime = 0;
    },
    muted: false,
    toggleBGM: () => {
        GameAudio.muted = !GameAudio.muted;
        const icon = document.getElementById('music-icon');
        if (GameAudio.muted) {
            GameAudio.bgmAudio.pause();
            if (icon) icon.innerText = '🔇';
        } else {
            GameAudio.bgmAudio.play().catch(e => console.log(e));
            if (icon) icon.innerText = '🔊';
        }
    },
    playRomanticMusic: () => {
        if (!GameAudio.romanticAudio) {
            GameAudio.romanticAudio = new Audio('Sound/FondoMusica.mp3'); // Using same music for now
            GameAudio.romanticAudio.volume = GameAudio.volume * 0.7;
        }
        GameAudio.bgmAudio.pause();
        GameAudio.romanticAudio.currentTime = 0;
        GameAudio.romanticAudio.play().catch(e => console.log(e));

        // Return to normal music after 10 seconds
        setTimeout(() => {
            if (GameAudio.romanticAudio) {
                GameAudio.romanticAudio.pause();
                GameAudio.romanticAudio.currentTime = 0;
            }
            if (!GameAudio.muted) {
                GameAudio.bgmAudio.play().catch(e => console.log(e));
            }
        }, 10000);
    }
};

// --- GAME STATE ---
let canvas, ctx;
let gameLoopId;
let gameState = 'START'; // START, PLAYING, WIN
let messageData = { nombre: 'Alguien Especial', mensaje: 'Default Message' };
// Stats
let gameTime = 300; // 5 minutes in seconds
let gameTimerInterval;
let coinsCollected = 0;

// Entities
// Entities (Fixed)
let player;
let enemies = [];
let particles = [];
let items = [];
let platforms = []; // surfaces (invisible barriers or rendered ground)
let blocks = []; // Interactables and Tiled Ground
let decorations = [];

// Input
const keys = { right: false, left: false, up: false, down: false };

// --- INITIALIZATION ---
window.onload = async () => {
    // 1. Load Data
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        try {
            const { data, error } = await _supabase.from('mensajes').select('*').eq('id', id).single();
            if (data) {
                messageData = data;
            } else {
                console.warn('ID not found, using default');
            }
        } catch (e) { console.error(e); }
    }

    // 2. Setup Canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // 3. Setup Input
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
        if (e.code === 'ArrowUp' || e.code === 'Space') {
            if (!keys.up) player?.jump();
            keys.up = true;
        }
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
        if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = false;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
    });

    // Mobile Inputs
    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('touchend', () => { keys.left = false; keys.right = false; }); // Simple reset

    // 4. Setup Start Button
    document.getElementById('btn-start').addEventListener('click', () => {
        document.getElementById('start-overlay').classList.add('hidden');
        GameAudio.init();
        GameAudio.startBGM();
        initGame();
    });

    // 5. Hide Loader to show Start Screen
    document.getElementById('loader').classList.add('hidden');

    // 6. Music Toggle & Volume
    document.getElementById('btn-music').addEventListener('click', () => {
        GameAudio.toggleBGM();
    });

    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            GameAudio.setVolume(e.target.value);
        });
    }
};

function handleTouch(e) {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];
    if (touch.clientX > window.innerWidth / 2) {
        keys.right = true;
        keys.left = false;
    } else {
        keys.left = true;
        keys.right = false;
    }
    // Simple jump on tap anywhere upper
    if (touch.clientY < window.innerHeight / 2) {
        player.jump();
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- GAME LOGIC ---

// Camera
let camera = { x: 0, y: 0 };

function initGame() {
    gameState = 'PLAYING';

    // Reset Entity Lists
    enemies = [];
    items = [];
    particles = [];
    blocks = [];
    decorations = []; // Photos, Clouds

    const floorY = canvas.height - 100;

    // Reset Stats
    coinsCollected = 0;
    gameTime = 300;
    updateUI();

    // Timer
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        if (gameState !== 'PLAYING') return;
        gameTime--;
        if (gameTime <= 0) {
            alert('¡Se acabó el tiempo!');
            location.reload();
        }
        updateUI();
    }, 1000);

    // --- WORLD BUILDING ---
    // Ground: Use Bricks/Blocks tiles instead of generic rect
    // We create a helper to build rows of blocks
    const createPlatform = (startX, y, width, type = 'brick') => {
        const cols = Math.ceil(width / TILE_SIZE);
        for (let i = 0; i < cols; i++) {
            blocks.push({
                x: startX + i * TILE_SIZE,
                y: y,
                w: TILE_SIZE,
                h: TILE_SIZE,
                type: type,
                hit: false,
                content: 'none'
            });
        }
    };

    // Main Ground (Start)
    createPlatform(0, floorY, canvas.width, 'brick');

    // Ends CASTLE (Replaces House)
    const houseX = canvas.width + 900;
    decorations.push({ type: 'castle', x: houseX, y: floorY - 180, w: 180, h: 180 });

    // SPECIAL BLOCKS NEAR CASTLE
    // 1. Coins Block (5 coins)
    blocks.push({ x: houseX - 150, y: floorY - 150, w: TILE_SIZE, h: TILE_SIZE, type: 'qblock', hit: false, content: 'multi_coin', coinsLeft: 5 });
    // 2. Win Block (Flower/Message)
    blocks.push({ x: houseX - 50, y: floorY - 150, w: TILE_SIZE, h: TILE_SIZE, type: 'qblock', hit: false, content: 'flower' });


    // Piranha Plant Area with SOLID PIPE
    const pipeX = canvas.width * 0.5;
    const pipeW = 60;
    const pipeH = 80;

    // Add pipe as a solid block (collidable)
    blocks.push({
        x: pipeX,
        y: floorY - pipeH,
        w: pipeW,
        h: pipeH,
        type: 'pipe',
        hit: false,
        content: 'none',
        breakable: false
    });

    enemies.push(new Enemy(pipeX + 10, floorY - pipeH - 40, 0, false, 'piranha'));

    // Floating Platforms - RAISED HIGHER for easier enemy stomping
    createPlatform(canvas.width * 0.2, floorY - 220, 200, 'brick');
    createPlatform(canvas.width * 0.6, floorY - 280, 250, 'brick');

    // --- LETTER BLOCKS (Dynamic based on name) ---
    // Create blocks that spell out the player's name when hit
    const playerName = (messageData.nombre || 'PLAYER').toUpperCase().substring(0, 12); // Max 12 letters
    const nameLength = playerName.length;

    // Calculate starting position for centered letter blocks
    const letterBlockStartX = canvas.width * 0.4;
    const letterBlockY = floorY - 400; // Moved higher up
    const letterBlockSpacing = TILE_SIZE + 10; // Small gap between blocks

    // Create letter blocks
    for (let i = 0; i < nameLength; i++) {
        blocks.push({
            x: letterBlockStartX + (i * letterBlockSpacing),
            y: letterBlockY,
            w: TILE_SIZE,
            h: TILE_SIZE,
            type: 'qblock',
            hit: false,
            content: 'letter',
            letter: playerName[i],
            letterIndex: i,
            revealed: false,
            breakable: false
        });
    }

    // Add ONE fire flower in the center above the letter blocks
    const centerX = letterBlockStartX + (nameLength * letterBlockSpacing) / 2 - 16;
    items.push(new Item(centerX, letterBlockY - 60, 'fireflower'));


    // More Coins (Mario style lines)
    for (let i = 0; i < 5; i++) {
        items.push(new Item(letterBlockStartX + 200 + i * 40, letterBlockY - 100, 'coin'));
    }
    for (let i = 0; i < 5; i++) {
        items.push(new Item(canvas.width + 100 + i * 40, floorY - 150, 'coin'));
    }

    // Enemies (Initial) - Fixed Y position for 60px height
    enemies.push(new Enemy(canvas.width * 0.3, floorY - 60, 100));

    // --- RIGHT EXPANSION ( > CanvasWidth) ---
    // Floor Continues
    createPlatform(canvas.width, floorY, canvas.width * 1.5, 'brick');

    // Photos Area
    const photoX1 = canvas.width + 300;
    const photoX2 = canvas.width + 700;
    // Special Cloud
    decorations.push({
        type: 'cloud',
        x: (photoX1 + photoX2) / 2,
        y: floorY - 500,
        text: "Con mucho cariño para ti",
        w: 300,
        h: 100,
        floatOffset: 0
    });
    // Photos with Float Animation
    decorations.push({ type: 'photo', img: 'assets/photo1.png', x: photoX1, y: floorY - 250, w: 200, h: 200, floatOffset: 0 });
    decorations.push({ type: 'photo', img: 'assets/photo2.png', x: photoX2, y: floorY - 250, w: 200, h: 200, floatOffset: Math.PI });

    // --- LEFT EXPANSION ( < 0 ) ---
    // Floor Extended Left
    createPlatform(-canvas.width * 1.5, floorY, canvas.width * 1.5, 'brick');

    // Special Enemy Area (approx -600) - Fixed Y position
    enemies.push(new Enemy(-600, floorY - 60, 300, true, 'paragoomba')); // true = special, 'paragoomba' type

    // Rain Zone (approx -1000)
    // Balloon at -1200
    decorations.push({ type: 'balloon', x: -1200, y: floorY - 300, w: 40, h: 50 });


    // Player Start
    player = new Player(100, floorY - 100);
    document.getElementById('lives-display').innerText = player.lives;

    loop();
}

function loop() {
    if (gameState !== 'PLAYING' && gameState !== 'WIN') return;

    // Update Camera
    // Camera follows player but clamps to rough world bounds or just smooth follows
    let targetCamX = player.x + player.w / 2 - canvas.width / 2;
    // Lerp
    camera.x += (targetCamX - camera.x) * 0.1;

    // Draw Background
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset for BG
    ctx.clearRect(0, 0, canvas.width, canvas.height); // BG is CSS

    // Weather Effect: Rain if player is far left
    if (player.x < -800) {
        drawRain();
    }

    ctx.save();
    ctx.translate(-camera.x, 0); // Apply Camera

    // Draw Platforms (Now handled by blocks layer mostly, but keep explicit Platforms if needed)
    // In this refactor, most platforms are now blocks.
    platforms.forEach(p => {
        // Fallback for any old platforms not converted (none in current flow)
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(p.x, p.y, p.w, p.h);
    });

    // Draw Decorations
    decorations.forEach(d => {
        // Animation
        let dy = 0;
        if (d.floatOffset !== undefined) {
            dy = Math.sin(Date.now() / 500 + d.floatOffset) * 10;
        }

        if (d.type === 'photo') {
            // Frame
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(d.x - 10, d.y - 10 + dy, d.w + 20, d.h + 50); // Polaroid style
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            // Image (or placeholder)
            if (!d.imageObj) {
                d.imageObj = new Image();
                d.imageObj.src = d.img;
            }
            try {
                ctx.drawImage(d.imageObj, d.x, d.y + dy, d.w, d.h);
            } catch (e) {
                ctx.fillStyle = '#000';
                ctx.fillRect(d.x, d.y + dy, d.w, d.h);
            }
            ctx.shadowBlur = 0;
            // Text
            ctx.fillStyle = '#4b5563';
            ctx.font = '20px Caveat, cursive';
            ctx.textAlign = 'center';
            ctx.fillText('Recuerdo Especial', d.x + d.w / 2, d.y + d.h + 30 + dy);
        }
        else if (d.type === 'cloud') {
            const cy = d.y + dy;
            // Draw Cloud Image if available, else shapes
            if (!ASSETS.cloud) { ASSETS.cloud = new Image(); ASSETS.cloud.src = 'assets/cloud.png'; }

            if (ASSETS.cloud.complete && ASSETS.cloud.naturalHeight !== 0) {
                try {
                    ctx.drawImage(ASSETS.cloud, d.x - d.w / 2, cy, d.w, d.h);
                } catch (e) {
                    // Fallback if draw fails
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.beginPath();
                    ctx.ellipse(d.x, cy + 20, d.w / 2, d.h / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Loading/Fallback
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath();
                ctx.ellipse(d.x, cy + 20, d.w / 2, d.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Text with glow
            ctx.save();
            ctx.shadowColor = '#d946ef';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#d946ef';
            ctx.font = 'bold 24px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(d.text, d.x, cy + 120);
            ctx.restore();
        }
        else if (d.type === 'balloon') {
            // String
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y + 40);
            ctx.lineTo(d.x, d.y + 100);
            ctx.stroke();
            // Balloon
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, 25, 35, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (d.type === 'flag') {
            if (!ASSETS.flag) { ASSETS.flag = new Image(); ASSETS.flag.src = 'assets/start_flag.png'; }
            if (ASSETS.flag.complete && ASSETS.flag.naturalHeight !== 0) {
                try {
                    ctx.drawImage(ASSETS.flag, d.x, d.y, d.w, d.h);
                } catch (e) { }
            } else {
                ctx.fillStyle = '#22c55e'; // Green fallback
                ctx.fillRect(d.x, d.y, d.w, d.h);
            }
        }
        else if (d.type === 'castle') {
            // Draw Castle Image
            const img = ASSETS.tiles.castle.img;
            if (img && img.complete) {
                ctx.drawImage(img, d.x, d.y, d.w, d.h);
            } else {
                // Fallback
                ctx.fillStyle = '#fce7f3';
                ctx.fillRect(d.x, d.y, d.w, d.h);
            }
        }
        else if (d.type === 'pipe') {
            const img = ASSETS.tiles.pipe.img;
            if (img && img.complete) {
                ctx.drawImage(img, d.x, d.y, d.w, d.h);
            } else {
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(d.x, d.y, d.w, d.h);
            }
        }
    });

    // Draw Blocks (and Ground)
    blocks.forEach((b, index) => {
        // Skip rendering broken bricks
        if (b.broken) return;

        let spriteData = null;
        if (b.type === 'brick') {
            spriteData = ASSETS.tiles.brick;
        } else if (b.type === 'qblock') {
            spriteData = ASSETS.tiles.qblock_base;
        } else if (b.type === 'pipe') {
            spriteData = ASSETS.tiles.pipe;
        }

        const bX = b.x;
        const bY = b.y;

        // Draw
        if (b.type === 'pipe') {
            // Special rendering for pipe
            const pipeImg = ASSETS.tiles.pipe.img;
            if (pipeImg && pipeImg.complete) {
                ctx.drawImage(pipeImg, bX, bY, b.w, b.h);
            } else {
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(bX, bY, b.w, b.h);
            }
        } else if (spriteData && spriteData.img && spriteData.img.complete) {
            if (b.hit && b.type === 'qblock') {
                // Use desactivado sprite for hit blocks
                const desactivadoImg = ASSETS.tiles.desactivado.img;
                if (desactivadoImg && desactivadoImg.complete) {
                    ctx.drawImage(desactivadoImg, bX, bY, b.w, b.h);
                } else {
                    // Fallback to old sprite
                    ctx.drawImage(ASSETS.sprites, SPRITES.empty.x, SPRITES.empty.y, SPRITES.empty.w, SPRITES.empty.h, bX, bY, b.w, b.h);
                }

                // If it's a letter block and revealed, show the letter with animation
                if (b.content === 'letter' && b.revealed) {
                    ctx.save();

                    // Subtle up-down animation
                    const floatOffset = Math.sin(Date.now() / 300) * 3; // 3px movement

                    // Letter background glow
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 20;

                    // Draw letter
                    ctx.font = 'bold 32px Outfit, sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Add gradient to letter
                    const gradient = ctx.createLinearGradient(bX, bY, bX, bY + b.h);
                    gradient.addColorStop(0, '#fef3c7');
                    gradient.addColorStop(1, '#fbbf24');
                    ctx.fillStyle = gradient;

                    ctx.fillText(b.letter, bX + b.w / 2, bY + b.h / 2 + floatOffset);
                    ctx.restore();
                }
            } else {
                // Animated
                let frame = 0;
                if (spriteData.frames > 1) {
                    frame = Math.floor(Date.now() / 250) % spriteData.frames;
                }
                const fw = spriteData.img.naturalWidth / spriteData.frames;
                const fh = spriteData.img.naturalHeight;
                ctx.drawImage(spriteData.img, frame * fw, 0, fw, fh, bX, bY, b.w, b.h);
            }
        } else {
            // Fallback
            ctx.fillStyle = b.type === 'brick' ? '#b45309' : '#fbbf24';
            ctx.fillRect(bX, bY, b.w, b.h);
        }
    });

    // Items
    items.forEach((item, i) => {
        item.update();
        item.draw();
        if (checkRectCollide(player, item)) {
            if (item.type === 'pet') {
                // Pet Logic: Interaction
                if (!item.interacted) {
                    item.say("¡Eres increíble!");
                    item.interacted = true;
                }
            }
            else if (item.type === 'coin') {
                GameAudio.coin();
                coinsCollected++;
                updateUI();
                items.splice(i, 1);
            }
            else if (item.type === 'fireflower') {
                GameAudio.powerup();
                // Romantic effect!
                spawnRomanticEffect();
                items.splice(i, 1);
            }
            else if (item.type === 'flower') {
                GameAudio.powerup();
                winGame();
                items.splice(i, 1); // Remover flor después de cogerla
            }
        }
    });


    // Update Enemies
    enemies.forEach(e => {
        e.update();
        e.draw();

        // Collsion with Player
        if (checkRectCollide(player, e) && !e.dead) {
            const playerBottom = player.y + player.h;
            if (player.vy > 0 && playerBottom < e.y + e.h * 0.8) {
                // Bounce
                player.vy = -8;
                e.die();
                GameAudio.bump();
            } else {
                player.takeDamage();
            }
        }
    });

    // Update and draw particles (floating letters and hearts)
    particles.forEach((p, i) => {
        if (p.type === 'floatingLetter') {
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life--;
            p.alpha = p.life / 60;

            if (p.life <= 0) {
                particles.splice(i, 1);
                return;
            }

            // Draw floating letter
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.font = 'bold 48px Outfit, sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Outline
            ctx.strokeText(p.letter, p.x, p.y);
            // Fill
            ctx.fillText(p.letter, p.x, p.y);
            ctx.restore();
        } else if (p.type === 'heart') {
            // Update heart physics
            p.y += p.vy;
            p.x += p.vx;
            p.vy += 0.1; // Gravity
            p.life--;
            p.alpha = Math.min(1, p.life / 60);

            if (p.life <= 0) {
                particles.splice(i, 1);
                return;
            }

            // Draw heart emoji
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.emoji, p.x, p.y);
            ctx.restore();
        }
    });

    // Update Player
    player.update();
    player.draw();

    ctx.restore(); // End Camera Xform

    requestAnimationFrame(loop);
}

// --- CLASSES ---

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 50;
        this.h = 70; // Slightly larger hit box
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.dir = 1;

        // Lives
        this.lives = 5;
        this.invulnerable = false;

        // Animation
        this.state = 'idle'; // idle, run, jump
        this.frameTimer = 0;
        this.frameIndex = 0;
    }

    jump() {
        if (this.onGround && this.state !== 'duck') {
            this.vy = JUMP_FORCE;
            this.onGround = false;
            GameAudio.jump();
        }
    }

    update() {
        // Horizontal
        if (keys.right) {
            this.vx = SPEED;
            this.dir = 1;
            this.state = 'run';
        }
        else if (keys.left) {
            this.vx = -SPEED;
            this.dir = -1;
            this.state = 'run';
        }
        else {
            this.vx = 0;
            this.state = 'idle';
        }

        // Crouching (Duck)
        if (keys.down && this.onGround) {
            this.state = 'duck';
            this.vx = 0; // Stop moving when ducking
        }

        this.x += this.vx;

        // Remove Screen Bounds Clamping for Infinite World (Or clamp to new world bounds if needed)
        // For now, let's just limit not falling off too far left
        if (this.x < -2000) this.x = -2000;

        // Vertical
        this.vy += GRAVITY;
        this.y += this.vy;

        // Air state
        if (!this.onGround) this.state = 'jump';

        // Platform Collisions (Removed mostly, now using blocks)
        // Adapt platform physics for BLOCKS
        blocks.forEach((b, idx) => {
            if (checkRectCollide(this, b)) {

                // Top Collision (Standing on top)
                if (this.y + this.h > b.y && this.y + this.h < b.y + b.h * 0.5 && this.vy >= 0) {
                    this.y = b.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Bottom Collision (Headbonk / Break Brick)
                else if (this.y < b.y + b.h && this.y > b.y + b.h * 0.5 && this.vy < 0) {
                    this.y = b.y + b.h;
                    this.vy = 0;

                    // Break bricks when hit from below
                    if (b.type === 'brick' && b.breakable !== false) {
                        GameAudio.breakBrick();
                        b.broken = true;

                        // Create brick particles
                        for (let i = 0; i < 4; i++) {
                            particles.push({
                                type: 'brickPiece',
                                x: b.x + b.w / 2,
                                y: b.y + b.h / 2,
                                vx: (Math.random() - 0.5) * 6,
                                vy: -4 - Math.random() * 3,
                                life: 60,
                                alpha: 1
                            });
                        }
                    }
                    // Hit Q-blocks
                    else if (!b.hit && b.type === 'qblock') {
                        hitBlock(b);
                    } else {
                        GameAudio.bump();
                    }
                }
                // Side Collision (approximate)
                else {
                    if (this.x + this.w / 2 < b.x) {
                        this.x = b.x - this.w;
                    } else {
                        this.x = b.x + b.w;
                    }
                    this.vx = 0;
                }
            }
        });

        // Die check
        if (this.y > canvas.height + 200) this.takeDamage(true); // Lower kill floor

        // Animation Tick
        this.frameTimer++;
        if (this.frameTimer > 10) {
            this.frameTimer = 0;
            this.frameIndex = (this.frameIndex + 1) % 2; // 2 frames for run
        }
    }

    draw() {
        ctx.save();

        // Blink if invulnerable
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Determine Sprite
        let sx, sy;
        if (this.state === 'idle') {
            sx = SPRITES.player.idle.x; sy = SPRITES.player.idle.y;
        } else if (this.state === 'jump') {
            sx = SPRITES.player.jump.x; sy = SPRITES.player.jump.y;
        } else {
            // Run
            sx = SPRITES.player.run[this.frameIndex].x;
            sy = SPRITES.player.run[this.frameIndex].y;
        }

        // Determine Sprite Data
        let spriteData = ASSETS.mario.idle;
        let framesToLoop = 1;

        if (this.state === 'duck') {
            spriteData = ASSETS.mario.duck;
        } else if (this.state === 'jump') {
            spriteData = ASSETS.mario.jump;
        } else if (this.state === 'run') {
            // Skid check: if moving opposite to facing direction (simplified logic here)
            // For now just Run
            spriteData = ASSETS.mario.walk; // Default to walk
            if (Math.abs(this.vx) > SPEED - 1) spriteData = ASSETS.mario.run; // Run if fast
            framesToLoop = spriteData.frames;
        } else {
            // IDLE
            // If we want a specific idle, we can use goal or frame 0 of walk.
            // Let's use walk frame 0 for idle if goal isn't good.
            // But user asked for specific assets. Let's stick to idle defaults or walk frame 0.
            // Actually, ASSETS.mario.idle is set to goalNes.
            spriteData = ASSETS.mario.walk;
            framesToLoop = 1; // Freeze on first frame
        }

        const img = spriteData.img;

        // FLOATING NAME
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(messageData.nombre || 'Jugador', this.x + this.w / 2, this.y - 15);
        ctx.shadowBlur = 0; // Reset

        // Draw Player
        if (img && img.complete) {
            const frameW = img.naturalWidth / spriteData.frames;
            const frameH = img.naturalHeight;
            const currentFrame = (this.state === 'idle') ? 0 : Math.floor(this.frameTimer / 5) % spriteData.frames;

            ctx.save();
            // Adjust width based on state
            // User feedback: Run looks good wide (1.4x), Idle/Jump slightly thinner (0.8x)
            let widthMultiplier = 0.8;
            if (this.state === 'run') {
                widthMultiplier = 1.4;
            }
            const drawW = this.w * widthMultiplier;
            const drawXOffset = (drawW - this.w) / 2;

            if (this.dir === -1) {
                ctx.translate(this.x + this.w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, currentFrame * frameW, 0, frameW, frameH, -drawXOffset, 0, drawW, this.h);
            } else {
                ctx.drawImage(img, currentFrame * frameW, 0, frameW, frameH, this.x - drawXOffset, this.y, drawW, this.h);
            }
            ctx.restore();
        } else {
            // Fallback
            if (this.dir === -1) {
                ctx.scale(-1, 1);
                // Draw relative to flipped axis
                ctx.drawImage(ASSETS.sprites, sx, sy, 200, 256, -this.x - this.w - 10, this.y - 10, this.w + 20, this.h + 10);
            } else {
                ctx.drawImage(ASSETS.sprites, sx, sy, 200, 256, this.x - 10, this.y - 10, this.w + 20, this.h + 10);
            }
        }

        ctx.restore();
        ctx.restore();
    } // End Draw

    takeDamage(instantKill = false) {
        if (this.invulnerable && !instantKill) return;

        this.lives--;
        // Update UI logic is now central
        updateUI();

        if (this.lives <= 0) {
            // Game Over
            alert('¡Oh no! Inténtalo de nuevo.');
            location.reload();
        } else {
            // Respawn
            this.x = 100;
            this.y = 200; // Reset to start
            this.vy = 0;
            this.invulnerable = true;
            setTimeout(() => this.invulnerable = false, 2000);
            GameAudio.bump();
        }
    }
} // End Class Player

function updateUI() {
    document.getElementById('lives-display').innerText = player ? player.lives : 5;
    document.getElementById('coin-display').innerText = coinsCollected;
    const m = Math.floor(gameTime / 60);
    const s = gameTime % 60;
    document.getElementById('timer-display').innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

class Enemy {
    constructor(x, y, range, special = false, type = 'goomba') {
        this.startX = x;
        this.x = x;
        this.y = y;
        this.startY = y; // For piranha animation
        this.range = range;
        this.w = 60;
        this.h = 60;
        this.dir = 1;
        this.dead = false;
        this.special = special; // Transforms into Pet
        this.type = type; // 'goomba', 'paragoomba', 'piranha'

        // Piranha specific
        if (this.type === 'piranha') {
            this.piranhaState = 'hidden'; // hidden, rising, showing, lowering
            this.piranhaTimer = 0;
            this.piranhaHiddenY = y;
            this.piranhaShowY = y - 40;
        }
    }

    update() {
        if (this.dead) return;

        if (this.type === 'piranha') {
            // Static piranha - no movement
            return;
        }

        this.x += 2 * this.dir;
        if (Math.abs(this.x - this.startX) > this.range) {
            this.dir *= -1;
        }
    }

    draw() {
        if (this.dead) return;

        let spriteData = null;
        let speed = 200;

        if (this.type === 'piranha') {
            spriteData = ASSETS.tiles.piranha; // 8 frames
            speed = 100;
        } else {
            // Default to paragoomba for all other enemies (including standard 'goomba')
            spriteData = ASSETS.tiles.paragoomba; // 4 frames
        }

        if (spriteData && spriteData.img && spriteData.img.complete) {
            const frameIndex = Math.floor(Date.now() / speed) % spriteData.frames;
            const frameW = spriteData.img.naturalWidth / spriteData.frames;
            const frameH = spriteData.img.naturalHeight;

            ctx.save();
            if (this.special) ctx.filter = 'hue-rotate(90deg) brightness(1.2)';
            if (this.dir === -1 && this.type === 'paragoomba') {
                // Flip for left
                ctx.translate(this.x + this.w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(spriteData.img, frameIndex * frameW, 0, frameW, frameH, 0, 0, this.w, this.h);
            } else {
                ctx.drawImage(spriteData.img, frameIndex * frameW, 0, frameW, frameH, this.x, this.y, this.w, this.h);
            }
            ctx.restore();
        }
    }

    die() {
        this.dead = true;
        if (this.special) {
            // Spawn Pet
            items.push(new Pet(this.x, this.y));
        }
    }
}

class Pet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 40;
        this.h = 40;
        this.type = 'pet';
        this.targetY = y - 30;
        this.interacted = false;
    }
    update() {
        if (this.y > this.targetY) this.y -= 1;
    }
    draw() {
        ctx.font = '40px sans-serif';
        ctx.fillText('🐶', this.x, this.y + 40); // Dog emoji as pet
    }
    say(text) {
        // Create UI Bubble
        const ui = document.getElementById('game-ui-layer');
        if (!ui) return;

        const bubble = document.createElement('div');
        bubble.className = 'dialogue-bubble dialogue-visible';
        bubble.innerText = text;
        bubble.style.left = (this.x + 20 - camera.x) + 'px'; // Screen Space X? No, we need sync.
        // Screen space sync issues: Easier to use absolute formatting within game loop if using DOM, 
        // but DOM on top of Canvas needs sync.

        // Let's rely on Canvas text/bubble for sync
        this.bubbleText = text;
        this.bubbleTimer = 200; // frames
    }
}

// Override Item update/draw for general items helper
// Note: Code above had Item class which is fine, but Pet is special.
// We'll keep generic Item for Coin/Flower
class Item {
    constructor(x, y, type, autoCollect = false) {
        this.x = x; this.y = y; this.type = type;
        this.w = 32; this.h = 32;
        this.targetY = y - 60;
        this.autoCollect = autoCollect; // For coin blocks (popping effect)
        this.timer = autoCollect ? 20 : 0;
    }
    update() {
        if (this.autoCollect) {
            this.y -= 3;
            this.timer--;
            if (this.timer <= 0) {
                // Disappear
                this.y = -1000; // Poof
            }
            return;
        }
        if (this.y > this.targetY && this.type === 'flower') this.y -= 1;
    }
    draw() {
        if (this.type === 'coin' && ASSETS.tiles.coin.img && ASSETS.tiles.coin.img.complete) {
            const frames = ASSETS.tiles.coin.frames;
            const frameIndex = Math.floor(Date.now() / 150) % frames;
            const frameW = ASSETS.tiles.coin.img.naturalWidth / frames;
            const frameH = ASSETS.tiles.coin.img.naturalHeight;
            ctx.drawImage(ASSETS.tiles.coin.img, frameIndex * frameW, 0, frameW, frameH, this.x, this.y, this.w, this.h);
        } else if (this.type === 'fireflower' && ASSETS.tiles.fireflower.img && ASSETS.tiles.fireflower.img.complete) {
            const frames = ASSETS.tiles.fireflower.frames;
            const frameIndex = Math.floor(Date.now() / 150) % frames;
            const frameW = ASSETS.tiles.fireflower.img.naturalWidth / frames;
            const frameH = ASSETS.tiles.fireflower.img.naturalHeight;
            ctx.drawImage(ASSETS.tiles.fireflower.img, frameIndex * frameW, 0, frameW, frameH, this.x, this.y, this.w, this.h);
        } else {
            // Fallback
            const sprite = this.type === 'coin' ? SPRITES.coin : SPRITES.flower;
            ctx.drawImage(ASSETS.sprites, sprite.x, sprite.y, sprite.w, sprite.h, this.x, this.y, this.w, this.h);
        }
    }
}

// Override Pet Draw to support bubble inside Canvas
Pet.prototype.draw = function () {
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🐶', this.x, this.y + 40);

    // Draw Heart
    ctx.font = '20px sans-serif';
    ctx.fillText('❤️', this.x + 30, this.y + 10);

    if (this.bubbleText && this.bubbleTimer > 0) {
        this.bubbleTimer--;
        ctx.save();
        ctx.font = '16px Outfit, sans-serif';
        const w = ctx.measureText(this.bubbleText).width + 20;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(this.x - w / 2 + 20, this.y - 40, w, 30, 10);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(this.bubbleText, this.x + 20, this.y - 20);
        ctx.restore();
    }
}


// --- RAIN ---
let rainDrops = [];
function drawRain() {
    if (rainDrops.length < 100) {
        rainDrops.push({
            x: Math.random() * canvas.width,
            y: -10,
            l: Math.random() * 20 + 10,
            v: Math.random() * 5 + 10
        });
    }
    ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    rainDrops.forEach((r, i) => {
        r.y += r.v;
        if (r.y > canvas.height) rainDrops.splice(i, 1);
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + r.l);
    });
    ctx.stroke();
}

// --- HELPERS ---

function checkRectCollide(r1, r2) {
    return (r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y);
}

function hitBlock(b) {
    GameAudio.bump();

    if (b.type !== 'qblock') return; // Only QBlocks trigger items

    // Handle letter blocks
    if (b.content === 'letter') {
        if (!b.revealed) {
            b.revealed = true;
            b.hit = true;

            // Create floating letter particle
            createFloatingLetter(b.letter, b.x + b.w / 2, b.y);

            // Play special sound for letter reveal
            GameAudio.powerup();

            // Check if all letters are revealed
            const allLettersRevealed = blocks
                .filter(block => block.content === 'letter')
                .every(block => block.revealed);

            if (allLettersRevealed) {
                // Show special message or bonus
                setTimeout(() => {
                    GameAudio.coin();
                    coinsCollected += 10; // Bonus coins
                    updateUI();
                }, 500);
            }
        }
        return;
    }

    // Original block logic
    b.hit = true;

    if (!b.hit || b.content === 'multi_coin') { // Allow re-hit for multi-coin
        if (b.content === 'coin') {
            b.hit = true;
            spawnItem(b, 'coin');
        } else if (b.content === 'multi_coin') {
            spawnItem(b, 'coin');
            if (b.coinsLeft) {
                b.coinsLeft--;
                if (b.coinsLeft <= 0) b.hit = true;
                else b.hit = false; // Keep active
            }
        } else if (b.content === 'flower') {
            b.hit = true;
            spawnItem(b, 'flower');
        } else {
            b.hit = true;
        }
    }
}

// Helper function to create floating letter effect
function createFloatingLetter(letter, x, y) {
    const floatingLetter = {
        letter: letter,
        x: x,
        y: y,
        vy: -3,
        alpha: 1,
        life: 60,
        type: 'floatingLetter'
    };
    particles.push(floatingLetter);
}

function spawnItem(block, type) {
    if (type === 'coin') {
        GameAudio.coin();
        items.push(new Item(block.x + (block.w - 32) / 2, block.y - 40, 'coin', true));
        const scoreEl = document.getElementById('coin-display');
        coinsCollected++;
        updateUI();
    } else {
        items.push(new Item(block.x + (block.w - 32) / 2, block.y - 32, 'flower'));
    }
}

// Romantic effect: Many hearts falling
function spawnRomanticEffect() {
    // Play romantic music
    GameAudio.playRomanticMusic();

    // Spawn MANY hearts in all directions
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 2 + Math.random() * 3;

            particles.push({
                type: 'heart',
                x: player.x + player.w / 2,
                y: player.y + player.h / 2,
                vy: Math.sin(angle) * speed - 1,
                vx: Math.cos(angle) * speed,
                life: 120 + Math.random() * 60,
                alpha: 1,
                size: 20 + Math.random() * 20,
                emoji: ['❤️', '💖', '💕', '💗', '💝', '💓', '💞', '✨'][Math.floor(Math.random() * 8)]
            });
        }, i * 30);
    }
}

function winGame() {
    if (gameState === 'WIN') return; // Prevent double trigger

    gameState = 'WIN';
    GameAudio.stopBGM();
    GameAudio.playWinTheme();

    // Show Overlay
    const overlay = document.getElementById('dedication-overlay');
    document.getElementById('dedication-name').innerText = `¡${messageData.nombre}!`;
    document.getElementById('dedication-msg').innerText = messageData.mensaje;
    overlay.classList.remove('hidden');

    spawnConfetti();

    // Setup Continue Button
    document.getElementById('btn-continue').onclick = () => {
        overlay.classList.add('hidden');
        gameState = 'PLAYING';
        GameAudio.startBGM(); // Resume BGM
    };
}

function spawnConfetti() {
    const container = document.getElementById('emoji-container');
    if (!container) return;

    const emojis = ['💖', '✨', '🎉', '🌟', '🥰', '🎁'];

    // Spawn 20 floating emojis
    for (let i = 0; i < 20; i++) {
        const el = document.createElement('div');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        el.className = 'absolute animate-float';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.bottom = '-50px';
        el.style.animationDuration = (3 + Math.random() * 4) + 's';
        el.style.animationDelay = (Math.random() * 2) + 's';
        el.style.fontSize = (20 + Math.random() * 30) + 'px';
        container.appendChild(el);

        // Cleanup
        setTimeout(() => el.remove(), 7000);
    }
}

// Add Win Theme to Audio
GameAudio.playWinTheme = () => {
    if (!GameAudio.ctx) return;
    // Arpeggio C Major -> F Major -> G Major -> C Major
    const sequence = [
        // C
        { f: 523.25, t: 0 }, { f: 659.25, t: 0.2 }, { f: 783.99, t: 0.4 },
        // F
        { f: 698.46, t: 0.8 }, { f: 880.00, t: 1.0 }, { f: 1046.50, t: 1.2 },
        // G
        { f: 783.99, t: 1.6 }, { f: 987.77, t: 1.8 }, { f: 1174.66, t: 2.0 },
        // C high
        { f: 1046.50, t: 2.4 }, { f: 1318.51, t: 2.8 }, { f: 1567.98, t: 3.2 },
    ];

    const now = GameAudio.ctx.currentTime;

    sequence.forEach(note => {
        const osc = GameAudio.ctx.createOscillator();
        const gain = GameAudio.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0, now + note.t);
        gain.gain.linearRampToValueAtTime(0.1, now + note.t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + 0.6);

        osc.connect(gain);
        gain.connect(GameAudio.ctx.destination);
        osc.start(now + note.t);
        osc.stop(now + note.t + 0.6);
    });
};
