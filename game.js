
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
        fireflower: { src: 'assets/objetos/spr_fireflower_strip4.png', frames: 4, img: null },
        // Custom Assets
        gean: { src: 'assets/artistas/gean.png', frames: 4, img: null },
        radio: { src: 'assets/artistas/radio.png', img: null },
        nota: { src: 'assets/artistas/nota.png', img: null },
        bluecoin: { src: 'assets/objetos/spr_coinblue_strip4.png', frames: 4, img: null },
        firework: { src: 'assets/artistas/fuego.gif', img: null }
    }
};
// Preload Mario & Object Assets
const preloadList = [
    ...Object.values(ASSETS.mario),
    ASSETS.tiles.castle,
    ASSETS.tiles.coin,
    ASSETS.tiles.bluecoin, // Load blue coin
    ASSETS.tiles.paragoomba,
    ASSETS.tiles.piranha,
    ASSETS.tiles.pipe,
    ASSETS.tiles.block_q,
    ASSETS.tiles.brick,
    ASSETS.tiles.qblock_base,
    ASSETS.tiles.desactivado,
    ASSETS.tiles.desactivado,
    ASSETS.tiles.fireflower,
    ASSETS.tiles.gean,
    ASSETS.tiles.radio,
    ASSETS.tiles.nota,
    ASSETS.tiles.firework
];
preloadList.forEach(obj => {
    if (obj && obj.src) {
        obj.img = new Image();
        obj.img.src = obj.src;
    }
});
ASSETS.sprites.src = 'assets/sprites.png';

ASSETS.sprites.src = 'assets/sprites.png';

// --- EMOJI MASTER ---
const EMOJI_MASTER = {
    'corazon1': '❤️',
    'corazon_rosa': '💖',
    'estrella1': '⭐',
    'fuego': '🔥',
    'musica': '🎵',
    'destello': '✨',
    'fiesta': '🎉',
    'risa': '😂',
    'beso': '😘',
    'lluvia': '🌧️',
    'gota': '💧',
    'hamburguesa': '🍔',
    'pizza': '🍕',
    'donas': '🍩',
    'manzana': '🍎',
    'torta': '🍰'
};

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
    geanAudio: new Audio('assets/artistas/musicagean.mp3'), // New Music
    brickBreak: new Audio('assets/mario/sounds/romper_ladrillo.mp3'),
    jumpAudio: new Audio('assets/mario/sounds/mario-bros-jump.mp3'),
    coinAudio: new Audio('assets/mario/sounds/mario-coin.mp3'),
    gameOverAudio: new Audio('assets/mario/sounds/mario-bros game over.mp3'),
    volume: 0.4,

    init: () => {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        GameAudio.ctx = new AudioContext();

        // Configure BGM
        GameAudio.bgmAudio.loop = true;
        GameAudio.bgmAudio.volume = GameAudio.volume;
        GameAudio.brickBreak.volume = GameAudio.volume;
        GameAudio.jumpAudio.volume = GameAudio.volume;
        GameAudio.coinAudio.volume = GameAudio.volume;
        GameAudio.gameOverAudio.volume = GameAudio.volume;
    },

    setVolume: (val) => {
        GameAudio.volume = parseFloat(val);
        if (GameAudio.bgmAudio) GameAudio.bgmAudio.volume = GameAudio.volume;
        if (GameAudio.brickBreak) GameAudio.brickBreak.volume = GameAudio.volume;
        if (GameAudio.jumpAudio) GameAudio.jumpAudio.volume = GameAudio.volume;
        if (GameAudio.coinAudio) GameAudio.coinAudio.volume = GameAudio.volume;
        if (GameAudio.gameOverAudio) GameAudio.gameOverAudio.volume = GameAudio.volume;
    },

    playTone: (freq, type, duration) => {
        if (!GameAudio.ctx || GameAudio.muted) return; // Respect mute
        const osc = GameAudio.ctx.createOscillator();
        const gain = GameAudio.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, GameAudio.ctx.currentTime);

        // Scale sound effects volume relative to master volume
        // If volume is 0, sfx should be 0.
        // We use GameAudio.volume as base.
        const sfxVol = Math.max(0, GameAudio.volume);

        gain.gain.setValueAtTime(0.1 * sfxVol, GameAudio.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * (sfxVol > 0 ? 1 : 0), GameAudio.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(GameAudio.ctx.destination);
        osc.start();
        osc.stop(GameAudio.ctx.currentTime + duration);
    },
    jump: () => {
        if (GameAudio.muted) return;
        GameAudio.jumpAudio.currentTime = 0;
        GameAudio.jumpAudio.play().catch(e => console.log(e));
    },
    coin: () => {
        if (GameAudio.muted) return;
        GameAudio.coinAudio.currentTime = 0;
        GameAudio.coinAudio.play().catch(e => console.log(e));
    },
    bump: () => GameAudio.playTone(150, 'sawtooth', 0.1),
    breakBrick: () => {
        if (GameAudio.muted) return;
        GameAudio.brickBreak.currentTime = 0;
        GameAudio.brickBreak.play().catch(e => console.log(e));
    },
    gameOver: (reason = 'lives') => {
        GameAudio.stopBGM();
        if (GameAudio.geanAudio) GameAudio.geanAudio.pause();
        if (!GameAudio.muted) {
            GameAudio.gameOverAudio.play().catch(e => console.log(e));
        }

        const overlay = document.getElementById('gameover-overlay');
        const title = document.getElementById('gameover-title');
        const message = document.getElementById('gameover-message');

        if (overlay) {
            if (reason === 'time') {
                if (title) title.innerText = '¡TIEMPO AGOTADO!';
                if (message) message.innerText = '¡El tiempo se ha terminado! Inténtalo de nuevo.';
            } else {
                if (title) title.innerText = '¡GAME OVER!';
                if (message) message.innerText = 'No te rindas, ¡vuelve a intentarlo!';
            }
            overlay.classList.remove('hidden');
        }
    },
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
        // Stop BGM
        GameAudio.bgmAudio.pause();

        // Stop Game Timer (Infinite Time for Song)
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            // Update time display to infinity symbol or max
            const timerEl = document.getElementById('timer-display');
            if (timerEl) timerEl.innerText = "∞";
        }

        // Play Artista Music
        if (GameAudio.geanAudio) {
            if (GameAudio.muted) {
                GameAudio.geanAudio.volume = 0; // Muted
                // Still play so it can be unmuted later? Or just set state.
                // Let's play but volume 0 so loop starts.
            } else {
                GameAudio.geanAudio.volume = GameAudio.volume;
            }
            GameAudio.geanAudio.loop = true;
            GameAudio.geanAudio.play().catch(e => console.log('Music play error:', e));
        }

        // Notes visual effect is handled in game loop
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

    // --- DYNAMIC ASSET LOADING (Personalization) ---
    if (messageData) {
        // 1. Artist Handling (Gean default)
        if (messageData.nombre_artista) {
            const artista = messageData.nombre_artista.toLowerCase();
            // Update Asset Source
            ASSETS.tiles.gean.src = `assets/artistas/${artista}.png`;
            // Update Audio Source (Assuming format: musica[nombre].mp3)
            GameAudio.geanAudio = new Audio(`assets/artistas/musica${artista}.mp3`);
        }

        // Reload Gean Image with new source
        ASSETS.tiles.gean.img = new Image();
        ASSETS.tiles.gean.img.src = ASSETS.tiles.gean.src;
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
    // REMOVED global touch handler to prevent conflict with dedicated buttons

    // 4. Setup Start Button
    document.getElementById('btn-start').addEventListener('click', () => {
        document.getElementById('start-overlay').classList.add('hidden');
        GameAudio.init();
        GameAudio.startBGM();
        initGame();
    });

    // Handle Orientation Change
    window.addEventListener('orientationchange', () => {
        setTimeout(resize, 100);
        setTimeout(resize, 500); // Double check for laggy browsers
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

    // 7. Mobile Controls
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');

    if (btnLeft) {
        const handleLeftStart = (e) => { e.preventDefault(); keys.left = true; };
        const handleLeftEnd = (e) => { e.preventDefault(); keys.left = false; };

        btnLeft.addEventListener('touchstart', handleLeftStart);
        btnLeft.addEventListener('touchend', handleLeftEnd);
        btnLeft.addEventListener('mousedown', handleLeftStart);
        btnLeft.addEventListener('mouseup', handleLeftEnd);
        btnLeft.addEventListener('mouseleave', handleLeftEnd);
    }

    if (btnRight) {
        const handleRightStart = (e) => { e.preventDefault(); keys.right = true; };
        const handleRightEnd = (e) => { e.preventDefault(); keys.right = false; };

        btnRight.addEventListener('touchstart', handleRightStart);
        btnRight.addEventListener('touchend', handleRightEnd);
        btnRight.addEventListener('mousedown', handleRightStart);
        btnRight.addEventListener('mouseup', handleRightEnd);
        btnRight.addEventListener('mouseleave', handleRightEnd);
    }

    if (btnJump) {
        const handleJump = (e) => {
            e.preventDefault();
            if (player) player.jump();
        };
        btnJump.addEventListener('touchstart', handleJump);
        btnJump.addEventListener('mousedown', handleJump);
    }
};

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
            GameAudio.gameOver('time');
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

    // Main Ground (Start) - COMPACT WORLD (60 Blocks)
    const WORLD_COLS = 60;
    const worldWidth = WORLD_COLS * TILE_SIZE;
    createPlatform(-1000, floorY, worldWidth + 2000, 'brick'); // Extra floor left/right

    // Ends CASTLE (Replaces House) - At the end of the fixed world
    const houseX = worldWidth - 200;
    decorations.push({ type: 'castle', x: houseX, y: floorY - 180, w: 180, h: 180 });

    // SPECIAL BLOCKS NEAR CASTLE
    // 1. Coins Block (5 coins)
    blocks.push({ x: houseX - 150, y: floorY - 150, w: TILE_SIZE, h: TILE_SIZE, type: 'qblock', hit: false, content: 'multi_coin', coinsLeft: 5 });
    // 2. Win Block (Blue Coin Surprise)
    blocks.push({ x: houseX - 50, y: floorY - 150, w: TILE_SIZE, h: TILE_SIZE, type: 'qblock', hit: false, content: 'blue_coin' });


    const pipeX = 700; // Moved pipe further
    const pipeW = 60;
    const pipeH = 80;

    // Add pipe 1
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

    // Add pipe 2 (Next to pipe 1)
    const pipe2X = pipeX + 65;
    blocks.push({
        x: pipe2X,
        y: floorY - pipeH,
        w: pipeW,
        h: pipeH,
        type: 'pipe',
        hit: false,
        content: 'none',
        breakable: false
    });

    // Piranha Plant on pipe
    const piranha = new Enemy(pipeX + 5, floorY - pipeH, 0, false, 'piranha');
    piranha.w = 50;
    piranha.h = 60;
    piranha.piranhaHiddenY = floorY - pipeH;
    piranha.piranhaShowY = floorY - pipeH - 50;
    enemies.push(piranha);

    // MOVE QUESTION BLOCKS NEAR PIPES
    // Block 1 (Radio trigger) - Spaced out from platform
    blocks.push({
        x: pipeX - 100,
        y: floorY - 180,
        w: TILE_SIZE,
        h: TILE_SIZE,
        type: 'qblock',
        hit: false,
        content: 'radio_trigger',
        hitsLeft: 5,
        breakable: false
    });
    // Block 2 (Cake trigger)
    blocks.push({
        x: pipe2X + 80,
        y: floorY - 180,
        w: TILE_SIZE,
        h: TILE_SIZE,
        type: 'qblock',
        hit: false,
        content: 'cake_trigger',
        breakable: false
    });

    // Floating Platforms - Fixed Position
    // Platform User mentioned (5 bricks)
    createPlatform(300, floorY - 200, 200, 'brick');

    // Another platform higher up
    createPlatform(900, floorY - 280, 200, 'brick');

    // --- LETTER BLOCKS (Dynamic based on name) ---
    const playerName = (messageData.nombre || 'PLAYER').toUpperCase().substring(0, 12);
    const nameLength = playerName.length;

    // Fixed Start Position closer
    const letterBlockStartX = 1200;
    const letterBlockY = floorY - 250;
    const letterBlockSpacing = TILE_SIZE + 10;

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


    // More Coins 
    for (let i = 0; i < 5; i++) {
        items.push(new Item(letterBlockStartX + 200 + i * 40, letterBlockY - 100, 'coin'));
    }
    // Coins near end
    for (let i = 0; i < 5; i++) {
        items.push(new Item(houseX - 500 + i * 40, floorY - 150, 'coin'));
    }

    // Enemies (Initial) - Fixed positions Compacted
    enemies.push(new Enemy(600, floorY - 60, 100)); // Near pipe
    enemies.push(new Enemy(1400, floorY - 60, 150)); // After letters
    enemies.push(new Enemy(2000, floorY - 60, 150)); // Near end

    // Photo Area - Uses houseX (world end)
    const photoX1 = houseX - 350;
    // Special Cloud
    decorations.push({
        type: 'cloud',
        x: photoX1,
        y: floorY - 400,
        text: `✨ El mundo de ${messageData.nombre || 'TI'} ✨`,
        w: 300,
        h: 100,
        floatOffset: 0,
        sparkle: true
    });
    // One Photo with Float Animation (Custom Image Support)
    const photoUrl = messageData.url_imagen || 'assets/artistas/chancho.jpg';
    // Center photo below cloud
    decorations.push({ type: 'photo', img: photoUrl, x: photoX1 - 100, y: floorY - 250, w: 200, h: 200, floatOffset: 0 });

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
            if (!ASSETS.cloud) { ASSETS.cloud = new Image(); ASSETS.cloud.src = 'assets/nube.png'; }

            if (ASSETS.cloud.complete && ASSETS.cloud.naturalHeight !== 0) {
                try {
                    ctx.drawImage(ASSETS.cloud, d.x - d.w / 2, cy, d.w, d.h);
                } catch (e) {
                    // Fallback removed to ensure image is used
                }
            } else {
                // Loading/Fallback
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath();
                ctx.ellipse(d.x, cy + 20, d.w / 2, d.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Text with glow AND white border
            ctx.save();
            ctx.shadowColor = '#d946ef';
            ctx.shadowBlur = 15;
            ctx.font = 'bold 24px Outfit';
            ctx.textAlign = 'center';

            // White Border (Stroke)
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeText(d.text, d.x, cy + 120);

            // Inner Text
            ctx.fillStyle = messageData.color || '#d946ef';
            ctx.fillText(d.text, d.x, cy + 120);

            // Sparkles Effect
            if (d.sparkle) {
                const now = Date.now();
                if (!d.sparkles) d.sparkles = [];

                // Add new sparkles randomly
                if (Math.random() < 0.1) {
                    // Start with defaults
                    let possibleEmojis = ['✨', '⭐', '🌟'];

                    // Check for personalized emojis
                    if (messageData.emoji_1 || messageData.emoji_2) {
                        const customEmojis = [];
                        if (messageData.emoji_1 && EMOJI_MASTER[messageData.emoji_1]) customEmojis.push(EMOJI_MASTER[messageData.emoji_1]);
                        if (messageData.emoji_2 && EMOJI_MASTER[messageData.emoji_2]) customEmojis.push(EMOJI_MASTER[messageData.emoji_2]);

                        if (customEmojis.length > 0) possibleEmojis = customEmojis;
                    }

                    d.sparkles.push({
                        x: d.x + (Math.random() - 0.5) * 300, // Width of text area
                        y: cy + 120 + (Math.random() - 0.5) * 40,
                        life: 1,
                        emoji: possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)]
                    });
                }

                // Draw and update sparkles
                d.sparkles.forEach((s, si) => {
                    ctx.save();
                    ctx.globalAlpha = s.life;
                    ctx.font = '16px serif';
                    ctx.fillText(s.emoji, s.x, s.y);
                    ctx.restore();
                    s.life -= 0.05;
                    if (s.life <= 0) d.sparkles.splice(si, 1);
                });
            }
            ctx.restore();
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

    // Update Enemies (Drawn before blocks so piranhas are behind pipes)
    enemies.forEach(e => {
        e.update();
        e.draw();

        // Collision with Player
        if (checkRectCollide(player, e) && !e.dead) {
            const playerBottom = player.y + player.h;

            // Special handling for Gean - always bounce, no damage from any direction
            if (e.type === 'gean') {
                // Bounce from top ONLY
                if (player.vy > 0 && playerBottom < e.y + e.h * 0.8) {
                    player.vy = -8;
                    GameAudio.bump();
                }
                // Side collision - Do NOTHING (pass through, no sound, no bounce)
            }
            // Piranha plants CAN be stomped now
            else if (e.type === 'piranha') {
                if (player.vy > 0 && playerBottom < e.y + e.h * 0.5) {
                    // Stomp Piranha
                    player.vy = -8;
                    e.die();
                    GameAudio.bump();
                } else {
                    player.takeDamage();
                }
            }
            // Check stomp (Goombas and other enemies)
            else if (player.vy > 0 && playerBottom < e.y + e.h * 0.8) {
                // Bounce
                player.vy = -8;
                e.die();
                GameAudio.bump();
            } else {
                player.takeDamage();
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
        if (b.type === 'cake') {
            if (b.emoji) {
                ctx.save();
                ctx.font = `${b.w - 10}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.emoji, bX + b.w / 2, bY + b.h / 2);
                ctx.restore();
            } else {
                ctx.fillStyle = b.color;
                ctx.fillRect(bX, bY, b.w, b.h);
            }
        } else if (b.type === 'pipe') {
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
                if (!item.autoCollect) { // Don't double collect auto-counted coins
                    GameAudio.coin();
                    coinsCollected++;
                    updateUI();
                }
                items.splice(i, 1);
            }
            else if (item.type === 'fireflower') {
                GameAudio.powerup();
                // Romantic effect!
                spawnRomanticEffect();
                items.splice(i, 1);
            }
            else if (item.type === 'radio') {
                GameAudio.powerup();
                GameAudio.playRomanticMusic(); // Play a nice song
                spawnMariachis();
                items.splice(i, 1);
            }
            else if (item.type === 'flower') {
                GameAudio.powerup();
                winGame();
                items.splice(i, 1);
            }
            else if (item.type === 'blue_coin') {
                GameAudio.powerup();
                winGame();
                items.splice(i, 1);
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
        } else if (p.type === 'note') {
            p.y += p.vy;
            p.x += (p.vx || 0);
            p.life--;
            p.alpha = Math.min(1, p.life / 60);
            if (p.life <= 0) { particles.splice(i, 1); return; }

            const noteImg = ASSETS.tiles.nota.img;
            if (noteImg && noteImg.complete) {
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(noteImg, p.x, p.y, 24, 24);
                ctx.globalAlpha = 1;
            }
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
        } else if (p.type === 'firework') {
            p.life--;
            if (p.life <= 0) {
                particles.splice(i, 1);
                return;
            }

            const img = ASSETS.tiles.firework.img;
            if (img && img.complete) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(p.scale, p.scale);
                ctx.globalAlpha = Math.min(1, p.life / 30);
                if (p.filter) ctx.filter = p.filter;
                ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
        } else if (p.type === 'text') {
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                particles.splice(i, 1);
                return;
            }
            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life / 10);
            ctx.fillStyle = p.color || 'white';
            ctx.font = 'bold 20px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();
        } else if (p.type === 'rain_emoji') {
            p.y += p.vy;
            p.x += p.vx;
            p.life--;
            p.alpha = Math.min(1, p.life / 20);
            if (p.life <= 0) { particles.splice(i, 1); return; }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.font = `${p.size}px sans-serif`;
            ctx.textAlign = 'center';
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
        this.w = 40;
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

        // No World Limits - Infinite falling/running allowed
        // Only gravity and floor stop you


        // Vertical
        this.vy += GRAVITY;
        this.y += this.vy;

        // Air state
        if (!this.onGround) this.state = 'jump';

        // Platform Collisions (Removed mostly, now using blocks)
        // Adapt platform physics for BLOCKS
        blocks.forEach((b, idx) => {
            if (b.broken) return;
            if (checkRectCollide(this, b)) {
                // Eatable Cake Blocks
                if (b.type === 'cake') {
                    b.broken = true;
                    // Nom effect
                    spawnNamEffect(b.x + b.w / 2, b.y + b.h / 2);
                    GameAudio.coin();
                    return; // Don't process solid physics for eaten block
                }

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
            if (this.state === 'run' && Math.abs(this.vx) > 0.1) {
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
            GameAudio.gameOver();
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
            const playerDist = Math.abs((player.x + player.w / 2) - (this.x + this.w / 2));

            // State Machine
            if (this.piranhaState === 'hidden') {
                this.piranhaTimer++;
                // Wait 2 seconds, then rise if player is not too close (safe zone)
                if (this.piranhaTimer > 120) {
                    if (playerDist > 80) { // Don't come out if player is standing on pipe
                        this.piranhaState = 'rising';
                    }
                }
            } else if (this.piranhaState === 'rising') {
                this.y -= 1;
                // Using startY which we will treat as the "hidden" Y (pipe top level)
                // We want to rise to showY.
                if (this.y <= this.piranhaShowY) {
                    this.y = this.piranhaShowY;
                    this.piranhaState = 'showing';
                    this.piranhaTimer = 0;
                }
            } else if (this.piranhaState === 'showing') {
                this.piranhaTimer++;
                if (this.piranhaTimer > 120) { // Stay up for 2 seconds
                    this.piranhaState = 'lowering';
                }
            } else if (this.piranhaState === 'lowering') {
                this.y += 1;
                if (this.y >= this.piranhaHiddenY) {
                    this.y = this.piranhaHiddenY;
                    this.piranhaState = 'hidden';
                    this.piranhaTimer = 0;
                }
            }
            return;
        }

        // Regular enemy movement
        this.x += 2 * this.dir;

        // Check collision with pipes and blocks
        blocks.forEach(b => {
            if (b.type === 'pipe' && checkRectCollide(this, b)) {
                // Hit a pipe - reverse direction
                this.dir *= -1;
                // Move back to prevent getting stuck
                this.x += 4 * this.dir;
            }
        });

        // Check range boundary
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

            // Flip sprite based on direction for ALL enemies (not just paragoomba)
            // dir = 1 means moving right (default sprite faces left, so flip it)
            // dir = -1 means moving left (keep original)
            if (this.dir === 1 && this.type !== 'piranha') {
                // Moving right - flip the sprite
                ctx.translate(this.x + this.w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(spriteData.img, frameIndex * frameW, 0, frameW, frameH, 0, 0, this.w, this.h);
            } else {
                // Moving left or piranha - normal orientation
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
        // Rise animation for Flower AND Blue Coin
        if (this.y > this.targetY && (this.type === 'flower' || this.type === 'blue_coin')) {
            this.y -= 1;
        }
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
        } else if (this.type === 'blue_coin' && ASSETS.tiles.bluecoin.img && ASSETS.tiles.bluecoin.img.complete) {
            const frames = ASSETS.tiles.bluecoin.frames;
            const frameIndex = Math.floor(Date.now() / 150) % frames;
            const frameW = ASSETS.tiles.bluecoin.img.naturalWidth / frames;
            const frameH = ASSETS.tiles.bluecoin.img.naturalHeight;
            ctx.drawImage(ASSETS.tiles.bluecoin.img, frameIndex * frameW, 0, frameW, frameH, this.x, this.y, this.w, this.h);
        } else if (this.type === 'radio') {
            // Draw Radio Image
            const img = ASSETS.tiles.radio.img;
            if (img && img.complete) {
                ctx.drawImage(img, this.x, this.y, this.w, this.h);
            } else {
                // Fallback Balloon config
                ctx.save();
                ctx.fillText('📻', this.x + this.w / 2, this.y + this.h);
                ctx.restore();
            }

            // Spawn notes if music is playing (Checked via global state or just visual effect here)
            // We'll spawn notes stored in 'particles' from the main loop, but here is a good place to initiate if active.
            // Actually, let's just make the radio emit notes constantly if it exists? 
            // The user said notes appear "simulando que esta sonando la musca" (when music plays).
            // Music plays after collection. But wait, if collected, the item is removed!
            // So we need a persistent "Radio Active" state or entity.

            // Re-reading: "mario se debe hacercar a la radio y tocar par aque recien muestere eal animacion de que se esta sonando la cacion"
            // "Mario approaches radio, touches it -> Music starts -> Animation shows"
            // If item is spliced, we can't show notes above it. 
            // Logic: Radio turns into a non-collidable "Active Radio" decoration or we keep it and disable collision.
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
                spawnRomanticEffect();

                // Spawn Fireworks over the name blocks
                const nameBlocks = blocks.filter(block => block.content === 'letter');
                if (nameBlocks.length > 0) {
                    const minX = Math.min(...nameBlocks.map(b => b.x));
                    const maxX = Math.max(...nameBlocks.map(b => b.x + b.w));
                    const centerX = (minX + maxX) / 2;
                    const topY = nameBlocks[0].y;
                    spawnFireworks(centerX, topY);
                }

                setTimeout(() => {
                    GameAudio.coin();
                    coinsCollected += 10; // Bonus coins
                    updateUI();
                }, 500);
            }
        }
        return;
    }

    // Handle radio_trigger BEFORE marking as hit
    if (b.content === 'radio_trigger') {
        if (b.hitsLeft > 0) {
            b.hitsLeft--;
            console.log('Hits left:', b.hitsLeft);

            // Coin effect for first 4 hits
            if (b.hitsLeft > 0) {
                spawnItem(b, 'coin');
                b.hit = false; // Keep block active
            } else {
                // Fifth hit - spawn radio
                b.hit = true;
                spawnRadioDrop(b);
            }

            // Pop effect
            b.y -= 10;
            setTimeout(() => b.y += 10, 100);
        }
        return;
    }

    // Handle multi_coin blocks
    if (b.content === 'multi_coin') {
        spawnItem(b, 'coin');
        if (b.coinsLeft) {
            b.coinsLeft--;
            if (b.coinsLeft <= 0) {
                b.hit = true;
            } else {
                b.hit = false; // Keep active
            }
        }
        return;
    }

    // Handle other block types
    if (b.content === 'coin') {
        b.hit = true;
        spawnItem(b, 'coin');
    } else if (b.content === 'flower') {
        b.hit = true;
        spawnItem(b, 'flower');
    } else if (b.content === 'blue_coin') {
        b.hit = true;
        spawnItem(b, 'blue_coin');
    } else if (b.content === 'cake_trigger') {
        b.hit = true;
        // 1. Spawn rain of emojis for 15 seconds
        spawnEmojiRainEffect(['💧'], 2500);
        // 2. Spawn food pile instead of heart
        spawnFoodPile(-400, canvas.height - 100);
    } else {
        b.hit = true;
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
        coinsCollected++;
        updateUI();
    } else if (type === 'blue_coin') {
        // Blue Coin = WIN TRIGGER
        // Stays in place, waiting for collection
        GameAudio.coin();
        const item = new Item(block.x + (block.w - 32) / 2, block.y - 32, 'blue_coin', false);
        item.targetY = block.y - 64;
        items.push(item);
    } else {
        items.push(new Item(block.x + (block.w - 32) / 2, block.y - 32, 'flower'));
    }
}

// Romantic effect: Many hearts falling
function spawnRomanticEffect() {
    // NO music - only visual effect (music is only for radio)

    // Spawn MANY hearts in all directions
    // Spawn MANY hearts in all directions
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 2 + Math.random() * 3;

            // Determine emojis (Personalized)
            let possibleEmojis = ['❤️', '💖', '💕', '💗', '💝', '💓', '💞', '✨'];
            if (messageData.emoji_1 || messageData.emoji_2) {
                const custom = [];
                if (messageData.emoji_1 && EMOJI_MASTER[messageData.emoji_1]) custom.push(EMOJI_MASTER[messageData.emoji_1]);
                if (messageData.emoji_2 && EMOJI_MASTER[messageData.emoji_2]) custom.push(EMOJI_MASTER[messageData.emoji_2]);
                if (custom.length > 0) possibleEmojis = custom;
            }

            particles.push({
                type: 'heart',
                x: player.x + player.w / 2,
                y: player.y + player.h / 2,
                vy: Math.sin(angle) * speed - 1,
                vx: Math.cos(angle) * speed,
                life: 120 + Math.random() * 60,
                alpha: 1,
                size: 20 + Math.random() * 20,
                emoji: possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)]
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
// Helper to spawn radio from sky
function spawnRadioDrop(block) {
    // Position Radio Drop - More to the left between pipes
    const dropX = block.x - 20; // Position more to the left
    const radio = new Item(dropX, -100, 'radio');
    radio.vy = 4; // Faster fall
    radio.w = 50; radio.h = 50; // radio size
    radio.groundX = dropX; // Store final position
    radio.update = function () {
        this.y += this.vy;
        const groundY = canvas.height - 100 - this.h;
        if (this.y > groundY) {
            this.y = groundY;
            this.vy = 0;
        }
    };
    items.push(radio);
}

function spawnMariachis() {
    // 1. Audio is already started in Item collision.

    // 2. Spawn the "Gean" character - More to the left
    // Position relative to player but more to the left
    const floorY = canvas.height - 100;
    const gean = new Enemy(player.x - 120, floorY - 80, 0, false, 'gean'); // Moved further left (was -50)
    gean.startY = floorY - 80; // Ensure reference for animation is grounded

    gean.w = 64; gean.h = 80; // Adjust size
    gean.update = function () {
        // Dance / Idle
        // Simple bobbing to music
        this.y = this.startY + Math.sin(Date.now() / 150) * 5;
    };
    gean.draw = function () {
        const sprite = ASSETS.tiles.gean;
        if (sprite && sprite.img && sprite.img.complete) {
            const speed = 150;
            const frameIndex = Math.floor(Date.now() / speed) % sprite.frames;
            const frameW = sprite.img.naturalWidth / sprite.frames;
            const frameH = sprite.img.naturalHeight;

            // Draw Gean
            ctx.drawImage(sprite.img, frameIndex * frameW, 0, frameW, frameH, this.x, this.y, this.w, this.h);
        } else {
            // Fallback
            ctx.font = '50px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('👨‍🎤', this.x, this.y + 40);
        }
    };
    gean.die = function () { }; // Invincible
    enemies.push(gean);

    // 3. Spawn floating Notes (Simulation)
    const noteInterval = setInterval(() => {
        if (gameState !== 'PLAYING') return;
        // Check if gean still exists
        if (!enemies.includes(gean)) {
            clearInterval(noteInterval);
            return;
        }
        particles.push({
            type: 'note',
            x: gean.x + Math.random() * 60, // Near Mariachi/Radio
            y: gean.y - 20,
            vy: -1.5,
            vx: Math.random() * 2 - 1,
            life: 120,
            alpha: 1
        });
    }, 800);

    // 4. Auto-remove after 90 seconds (1.5 minutes)
    setTimeout(() => {
        // Stop music
        if (GameAudio.geanAudio) {
            GameAudio.geanAudio.pause();
            GameAudio.geanAudio.currentTime = 0;
        }

        // Resume background music
        if (!GameAudio.muted) {
            GameAudio.bgmAudio.play().catch(e => console.log(e));
        }

        // Remove Gean
        const geanIndex = enemies.indexOf(gean);
        if (geanIndex > -1) {
            enemies.splice(geanIndex, 1);
        }

        // Clear note interval
        clearInterval(noteInterval);
    }, 90000); // 90 seconds = 1.5 minutes
}
// --- FIREWORKS ---
function spawnFireworks(centerX, y) {
    let count = 0;
    const interval = setInterval(() => {
        if (count >= 100) { // Approx 20 seconds (100 * 200ms)
            clearInterval(interval);
            return;
        }

        const offsetX = (Math.random() - 0.5) * 600;
        const offsetY = -50 - Math.random() * 300;
        const size = 80 + Math.random() * 120;
        const hue = Math.floor(Math.random() * 360);

        particles.push({
            type: 'firework',
            x: centerX + offsetX,
            y: y + offsetY,
            size: size,
            scale: 0.6 + Math.random() * 1.8,
            filter: `hue-rotate(${hue}deg) brightness(1.6)`,
            life: 80 + Math.random() * 40
        });

        // Firework visual, NO coin sound (User feedback: sounds like too many coins without stopping)
        count++;
    }, 200);
}

// --- FOOD PILE ---
function spawnFoodPile(startX, baseY) {
    const pSize = 40;
    const foodEmojis = ['🍔', '🍕', '🍩', '🍎', '🍰', '🍫', '🍦', '🌮', '🍗', '🍉', '🥨', '🥞'];

    // Create a 7x5 pile of food (35 blocks approx)
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
            // Add some randomness and shape
            const distFromCenter = Math.abs(c - 3);
            if (Math.random() > (distFromCenter * 0.2)) {
                blocks.push({
                    x: startX + c * (pSize + 5),
                    y: baseY - (5 - r) * (pSize + 2),
                    w: pSize,
                    h: pSize,
                    type: 'cake',
                    emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
                    hit: false,
                    broken: false
                });
            }
        }
    }
}

// --- EMOJI RAIN ---
function spawnEmojiRainEffect(emojis, duration) {
    const startGameTime = Date.now();
    const rainInterval = setInterval(() => {
        if (Date.now() - startGameTime > duration || gameState !== 'PLAYING') {
            clearInterval(rainInterval);
            return;
        }

        // Spawn drops across the screen relative to camera
        for (let i = 0; i < 5; i++) {
            particles.push({
                type: 'rain_emoji',
                x: camera.x + Math.random() * canvas.width,
                y: -50,
                vy: 6 + Math.random() * 6,
                vx: (Math.random() - 0.5) * 2,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                life: 150,
                alpha: 1,
                size: 20 + Math.random() * 25
            });
        }
    }, 100);
}

function spawnNamEffect(x, y) {
    particles.push({
        type: 'text',
        text: '¡ÑAM!',
        x: x,
        y: y,
        vy: -2,
        life: 40,
        color: '#ffeb3b'
    });
}
