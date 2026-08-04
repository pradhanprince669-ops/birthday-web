/* ==========================================
   PAGE NAVIGATION
========================================== */

const totalPages = 6;

function goToPage(number) {

    if (number < 1 || number > totalPages) {
        return;
    }

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    document
        .getElementById("page" + number)
        .classList.add("active");

    /*
        Fireworks automatically start when
        Page 3 opens.
    */

    if (number === 3) {
        setTimeout(() => {
            startFireworks();
        }, 700);
    }
}


/* ==========================================
   STARS
========================================== */

const starsContainer =
    document.getElementById("stars");

for (let i = 0; i < 90; i++) {

    const star =
        document.createElement("div");

    star.className = "star";

    star.style.left =
        Math.random() * 100 + "%";

    star.style.top =
        Math.random() * 100 + "%";

    star.style.animationDelay =
        Math.random() * 3 + "s";

    starsContainer.appendChild(star);
}


/* ==========================================
   AUDIO
========================================== */

let audioContext = null;

let soundEnabled = false;


function getAudioContext() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        audioContext =
            new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}


function toggleSound() {

    soundEnabled =
        !soundEnabled;

    document
        .getElementById("soundControl")
        .textContent =
        soundEnabled
            ? "🔊"
            : "🔇";

    if (soundEnabled) {

        getAudioContext();

        softSound();
    }
}


function softSound() {

    if (!soundEnabled) {
        return;
    }

    const ctx =
        getAudioContext();

    if (!ctx) {
        return;
    }

    const osc =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    const now =
        ctx.currentTime;

    osc.type = "sine";

    osc.frequency.value = 620;

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        .035,
        now + .03
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        now + .25
    );

    osc
        .connect(gain)
        .connect(ctx.destination);

    osc.start(now);

    osc.stop(now + .3);
}


/* ==========================================
   FIREWORK CANVAS
========================================== */

const canvas =
    document.getElementById(
        "fireworksCanvas"
    );

const ctx =
    canvas.getContext("2d");

let W =
    window.innerWidth;

let H =
    window.innerHeight;


function resizeCanvas() {

    W =
        window.innerWidth;

    H =
        window.innerHeight;

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        W * dpr;

    canvas.height =
        H * dpr;

    canvas.style.width =
        W + "px";

    canvas.style.height =
        H + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


let rockets = [];

let particles = [];


const colors = [

    "#ffd166",
    "#ff6b6b",
    "#70d6ff",
    "#caffbf",
    "#e7c6ff",
    "#ff9fbc",
    "#ffffff"

];


/* ==========================================
   ROCKET
========================================== */

class Rocket {

    constructor() {

        this.x =
            W *
            (.1 + Math.random() * .8);

        this.y =
            H + 20;

        this.targetX =
            W *
            (.12 + Math.random() * .76);

        this.targetY =
            H *
            (.10 + Math.random() * .43);

        this.speed =
            6 + Math.random() * 2;

        this.color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        this.trail = [];

        this.exploded = false;
    }


    update() {

        this.trail.push({
            x: this.x,
            y: this.y
        });

        if (this.trail.length > 8) {
            this.trail.shift();
        }

        const dx =
            this.targetX - this.x;

        const dy =
            this.targetY - this.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance < 10) {

            explode(
                this.x,
                this.y,
                this.color
            );

            this.exploded = true;

            fireworkSound();

            return;
        }

        const angle =
            Math.atan2(dy, dx);

        this.x +=
            Math.cos(angle) *
            this.speed;

        this.y +=
            Math.sin(angle) *
            this.speed;
    }


    draw() {

        if (this.trail.length > 1) {

            ctx.beginPath();

            ctx.moveTo(
                this.trail[0].x,
                this.trail[0].y
            );

            for (
                let i = 1;
                i < this.trail.length;
                i++
            ) {

                ctx.lineTo(
                    this.trail[i].x,
                    this.trail[i].y
                );
            }

            ctx.strokeStyle =
                this.color;

            ctx.globalAlpha =
                .55;

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.globalAlpha = 1;
        }


        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            2.5,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#fff";

        ctx.fill();
    }
}


/* ==========================================
   PARTICLES
========================================== */

class FireParticle {

    constructor(
        x,
        y,
        angle,
        speed,
        color
    ) {

        this.x = x;

        this.y = y;

        this.vx =
            Math.cos(angle) *
            speed;

        this.vy =
            Math.sin(angle) *
            speed;

        this.color = color;

        this.life =
            55 +
            Math.random() * 65;

        this.maxLife =
            this.life;
    }


    update() {

        this.vx *= .985;

        this.vy *= .985;

        this.vy += .045;

        this.x += this.vx;

        this.y += this.vy;

        this.life--;
    }


    draw() {

        const alpha =
            Math.max(
                0,
                this.life /
                this.maxLife
            );

        ctx.globalAlpha =
            alpha;

        ctx.shadowBlur = 9;

        ctx.shadowColor =
            this.color;

        ctx.fillStyle =
            this.color;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            1.5 +
            alpha * 1.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1;
    }
}


/* ==========================================
   EXPLOSION
========================================== */

function explode(
    x,
    y,
    mainColor
) {

    const amount =
        90 +
        Math.floor(
            Math.random() * 40
        );

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.PI *
            2 *
            i /
            amount;

        const speed =
            1.7 +
            Math.random() * 4.5;

        const color =
            Math.random() < .4
                ? mainColor
                : colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];

        particles.push(
            new FireParticle(
                x,
                y,
                angle,
                speed,
                color
            )
        );
    }
}


/* ==========================================
   FIREWORK SOUND
========================================== */

function fireworkSound() {

    if (!soundEnabled) {
        return;
    }

    const ctx =
        getAudioContext();

    if (!ctx) {
        return;
    }

    const now =
        ctx.currentTime;

    const osc =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    osc.type = "sine";

    osc.frequency.setValueAtTime(
        100,
        now
    );

    osc.frequency.exponentialRampToValueAtTime(
        40,
        now + .7
    );

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        .25,
        now + .04
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        now + .8
    );

    osc
        .connect(gain)
        .connect(ctx.destination);

    osc.start(now);

    osc.stop(now + .85);
}


/* ==========================================
   LAUNCH FIREWORK
========================================== */

function launchFirework() {

    rockets.push(
        new Rocket()
    );
}


let fireworksRunning = false;


function startFireworks() {

    getAudioContext();

    soundEnabled = true;

    document
        .getElementById("soundControl")
        .textContent = "🔊";


    let count = 0;

    const timer =
        setInterval(() => {

            launchFirework();

            count++;

            if (count >= 10) {

                clearInterval(timer);

            }

        }, 550);
}


/* ==========================================
   ANIMATION LOOP

   clearRect() is intentionally used.
   So there is NO permanent blue
   transparent layer.
========================================== */

function animate() {

    requestAnimationFrame(
        animate
    );

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    rockets.forEach(
        rocket => {

            rocket.update();

            if (!rocket.exploded) {

                rocket.draw();

            }

        }
    );


    rockets =
        rockets.filter(
            rocket =>
                !rocket.exploded
        );


    particles.forEach(
        particle => {

            particle.update();

            if (particle.life > 0) {

                particle.draw();

            }

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );
}

animate();


/* ==========================================
   CANDLE
========================================== */

let candleBlown = false;


function blowCandle() {

    if (candleBlown) {
        return;
    }

    candleBlown = true;


    document
        .getElementById("flame")
        .classList.add("off");


    document
        .getElementById("blowButton")
        .textContent =
        "Wish Made! ✨";


    document
        .getElementById("cakeContinue")
        .classList.remove("hidden");


    cakeSound();

    confetti();


    setTimeout(() => {

        startFireworks();

    }, 500);
}


/* ==========================================
   CAKE SOUND
========================================== */

function cakeSound() {

    if (!soundEnabled) {
        return;
    }

    const ctx =
        getAudioContext();

    if (!ctx) {
        return;
    }

    const osc =
        ctx.createOscillator();

    const gain =
        ctx.createGain();

    const now =
        ctx.currentTime;

    osc.frequency.value =
        520;

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        .04,
        now + .03
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        now + .3
    );

    osc
        .connect(gain)
        .connect(ctx.destination);

    osc.start(now);

    osc.stop(now + .35);
}


/* ==========================================
   CONFETTI
========================================== */

function confetti() {

    const symbols = [
        "✨",
        "⭐",
        "🎉",
        "🎊",
        "❤️"
    ];


    for (let i = 0; i < 60; i++) {

        const item =
            document.createElement("div");

        item.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];

        item.style.position =
            "fixed";

        item.style.left =
            Math.random() * 100 +
            "vw";

        item.style.top =
            "-30px";

        item.style.fontSize =
            14 +
            Math.random() * 15 +
            "px";

        item.style.zIndex =
            "500";

        item.style.pointerEvents =
            "none";


        document.body.appendChild(item);


        const animation =
            item.animate(
                [
                    {
                        transform:
                            "translateY(0) rotate(0)",
                        opacity: 1
                    },

                    {
                        transform:
                            `translateY(${H + 100}px)
                             rotate(${500 + Math.random() * 800}deg)`,

                        opacity: 0
                    }
                ],

                {
                    duration:
                        2500 +
                        Math.random() * 2500,

                    easing:
                        "linear"
                }
            );


        animation.onfinish =
            () => item.remove();
    }
}


/* ==========================================
   GRAND FINALE
========================================== */

function grandFinale() {

    getAudioContext();

    soundEnabled = true;

    document
        .getElementById("soundControl")
        .textContent = "🔊";


    startFireworks();


    setTimeout(
        startFireworks,
        3500
    );


    setTimeout(
        startFireworks,
        7000
    );


    setTimeout(
        startFireworks,
        10500
    );


    confetti();
}