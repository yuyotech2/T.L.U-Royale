class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.entities = [];
        this.bullets = [];
        this.player = null;
        this.map = null;
        this.running = false;
        this.lastTime = 0;

        this.camera = { x: 0, y: 0 };
        this.viewport = { w: 0, h: 0 };

        window.addEventListener('resize', () => this.resize());
        this.resize();

        this.keys = {};
        this.mouse = { x: 0, y: 0, left: false };

        window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', e => this.mouse.left = true);
        window.addEventListener('mouseup', e => this.mouse.left = false);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.viewport.w = this.canvas.width;
        this.viewport.h = this.canvas.height;
    }

    start(mode, nickname) {
        this.running = true;
        this.entities = [];
        this.bullets = [];
        this.map = new GameMap(4000, 4000);

        this.player = new Player(nickname, 2000, 2000, false);
        this.entities.push(this.player);

        const botCount = 15;
        for (let i = 0; i < botCount; i++) {
            const rx = Math.random() * 3800 + 100;
            const ry = Math.random() * 3800 + 100;
            const bot = new Bot(`Bot_${i}`, rx, ry);
            this.entities.push(bot);
        }

        requestAnimationFrame(t => this.loop(t));
    }

    loop(timestamp) {
        if (!this.running) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        if (isNaN(dt) || dt > 0.1) dt = 0.016;

        this.entities.forEach(ent => {
            if (ent === this.player) {
                ent.update(dt, this.keys, this.mouse, this.camera, this.map, this);
            } else {
                ent.update(dt, this.player, this.entities, this.map, this);
            }
        });

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;

            this.entities.forEach(ent => {
                if (ent !== b.owner && ent.alive) {
                    const dx = b.x - ent.x;
                    const dy = b.y - ent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < ent.radius) {
                        ent.takeDamage(b.damage, b.owner);
                        b.life = 0;
                    }
                }
            });

            if (b.life <= 0) this.bullets.splice(i, 1);
        }

        this.camera.x = this.player.x - this.viewport.w / 2;
        this.camera.y = this.player.y - this.viewport.h / 2;

        this.camera.x = Math.max(0, Math.min(this.camera.x, this.map.width - this.viewport.w));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.map.height - this.viewport.h));
    }

    draw() {
        const { ctx, camera, viewport } = this;
        ctx.clearRect(0, 0, viewport.w, viewport.h);

        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        this.map.draw(ctx, camera, viewport);

        this.entities.forEach(ent => {
            if (!ent.alive) return;
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.arc(ent.x, ent.y + 5, ent.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        this.entities.forEach(ent => ent.draw(ctx));

        this.bullets.forEach(b => {
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();

        this.drawHUD();
    }

    drawHUD() {
        const { ctx, player, viewport } = this;

        const hbW = 200;
        const hbH = 20;
        const hX = 20;
        const hY = viewport.h - 40;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(hX, hY, hbW, hbH);

        const healthPct = Math.max(0, player.health / 100);
        ctx.fillStyle = healthPct > 0.3 ? '#4ade80' : '#ef4444';
        ctx.fillRect(hX, hY, hbW * healthPct, hbH);

        ctx.strokeStyle = '#fff';
        ctx.strokeRect(hX, hY, hbW, hbH);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Outfit';
        ctx.fillText(`${player.nickname} | Kills: ${player.kills}`, 20, hY - 10);

        const remaining = this.entities.filter(e => e.alive).length;
        ctx.textAlign = 'right';
        ctx.fillText(`PLAYERS ALIVE: ${remaining}`, viewport.w - 20, 40);
        ctx.textAlign = 'left';

        if (!player.alive) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, viewport.w, viewport.h);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 48px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', viewport.w / 2, viewport.h / 2);
            ctx.font = '24px Outfit';
            ctx.fillText('Press F5 to Restart', viewport.w / 2, viewport.h / 2 + 50);
        }
    }
}
