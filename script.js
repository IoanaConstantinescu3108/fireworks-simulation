const canvas = document.getElementById("fireworksCanvas");
const videoBtn = document.getElementById("videoBtn");
const bgVideo = document.getElementById("bgVideo");
const ctx = canvas.getContext("2d");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext;
let explosionBuffer;

async function loadExplosionAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!explosionBuffer) {
        try {
            const response = await fetch("explosion.mp3"); 
            const arrayBuffer = await response.arrayBuffer();
            explosionBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log("Audio loaded successfully");
        } catch (err) {
            console.error("Failed to load audio:", err);
        }
    }
}

function playExplosionSound() {
    if (!audioContext || !explosionBuffer) return;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = explosionBuffer;
    source.playbackRate.value = 0.8 + Math.random() * 0.4;
    gainNode.gain.value = 0.1;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");
const bg3 = document.getElementById("bg3");
const customPhoto = document.getElementById("customPhoto");
const bgColorPicker = document.getElementById("bgColorPicker");
const canvasWrapper = document.querySelector(".canvas-wrapper");

bg1.addEventListener("click", () => {
    resetBackground();
    canvasWrapper.style.background = "radial-gradient(circle at bottom, #080038 0%, #000 100%)";
});
bg2.addEventListener("click", () => {
    resetBackground();
    canvasWrapper.style.background = "linear-gradient(to top, #6E00AD, #FF990D)";
});
bg3.addEventListener("click", () => {
    resetBackground();
    const url = "https://images.pexels.com/photos/27666757/pexels-photo-27666757.jpeg";
    canvasWrapper.style.background = `url(${url}) no-repeat center center / cover`;
});
customPhoto.addEventListener("click", () => {
    resetBackground();
    const url = prompt("Enter image URL:");
    if (url) canvasWrapper.style.background = `url(${url}) no-repeat center center / cover`;
});
bgColorPicker.addEventListener("input", () => {
    resetBackground();
    canvasWrapper.style.background = bgColorPicker.value;
});
videoBtn.addEventListener("click", async () => {
    canvasWrapper.style.background = "transparent";

    bgVideo.style.display = "block";
    try {
        await bgVideo.play(); 
        console.log("Video playing!");
    } catch (err) {
        console.error("Video play failed:", err);
    }
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4.9 + 1;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.color = color;
        this.life = 100;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }
    draw() {
        ctx.globalAlpha = this.life / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(x, y, this.color));
        }
    }
    update() {
        this.particles.forEach(p => {
            p.update();
            p.draw();
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
}

let fireworks = [];

canvas.addEventListener("click", async (e) => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    if (!explosionBuffer) {
        await loadExplosionAudio();
    }

    playExplosionSound();
    fireworks.push(new Firework(e.clientX, e.clientY));
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks.forEach((fw, i) => {
        fw.update();
        if (fw.particles.length === 0) fireworks.splice(i, 1);
    });
    requestAnimationFrame(animate);
}

animate();

function resetBackground() {
    bgVideo.style.display = "none";
    bgVideo.pause(); 
    
    canvasWrapper.style.background = ""; 
}