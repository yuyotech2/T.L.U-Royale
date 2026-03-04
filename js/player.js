class Player {
    constructor(nickname, x, y, isBot = false) {
        this.nickname = nickname;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 300;
        this.health = 100;
        this.alive = true;
        this.angle = 0;
        this.kills = 0;
        this.isBot = isBot;
        this.fireCooldown = 0;
        this.weapon = {
            damage: 20,
            cooldown: 0.2,
            speed: 800
        };
    }

    update(dt, keys, mouse, camera, map, engine) {
        if (!this.alive) return;

        let mx = 0;
        let my = 0;

        if (keys['w'] || keys['arrowup']) my -= 1;
        if (keys['s'] || keys['arrowdown']) my += 1;
        if (keys['a'] || keys['arrowleft']) mx -= 1;
        if (keys['d'] || keys['arrowright']) mx += 1;

        if (mx !== 0 || my !== 0) {
            const mag = Math.sqrt(mx * mx + my * my);
            this.x += (mx / mag) * this.speed * dt;
            this.y += (my / mag) * this.speed * dt;
        }

        this.x = Math.max(this.radius, Math.min(this.x, map.width - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, map.height - this.radius));

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        this.angle = Math.atan2(mouse.y - screenY, mouse.x - screenX);

        if (this.fireCooldown > 0) this.fireCooldown -= dt;
        if (mouse.left && this.fireCooldown <= 0) {
            this.shoot(engine);
            this.fireCooldown = this.weapon.cooldown;
        }
    }

    shoot(engine) {
        const vx = Math.cos(this.angle) * this.weapon.speed;
        const vy = Math.sin(this.angle) * this.weapon.speed;
        engine.bullets.push({
            x: this.x + Math.cos(this.angle) * 30,
            y: this.y + Math.sin(this.angle) * 30,
            vx, vy,
            damage: this.weapon.damage,
            life: 2.0,
            owner: this
        });
    }

    takeDamage(amount, source) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            if (source) source.kills++;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = '#fdbb2d';
        ctx.fillRect(15, -25, 10, 10);
        ctx.fillRect(15, 15, 10, 10);

        ctx.fillStyle = '#333';
        ctx.fillRect(10, -5, 30, 10);

        ctx.fillStyle = this.isBot ? '#ef4444' : '#3b82f6';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(this.nickname, this.x, this.y - 30);
    }
}

class Bot extends Player {
    constructor(nickname, x, y) {
        super(nickname, x, y, true);
        this.target = null;
        this.state = 'idle';
        this.stateTimer = 0;
        this.moveAngle = Math.random() * Math.PI * 2;
        this.reactionDelay = 0.5;
        this.targetInSightTime = 0;
    }

    update(dt, player, entities, map, engine) {
        if (!this.alive) return;

        const distToPlayer = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);

        if (player.alive && distToPlayer < 600) {
            this.targetInSightTime += dt;
            this.state = 'shooting';

            const actualAngle = Math.atan2(player.y - this.y, player.x - this.x);
            this.angle += (actualAngle - this.angle) * 5 * dt;

            this.x += Math.cos(this.angle) * this.speed * 0.4 * dt;
            this.y += Math.sin(this.angle) * this.speed * 0.4 * dt;

            if (this.fireCooldown > 0) this.fireCooldown -= dt;
            if (this.fireCooldown <= 0 && this.targetInSightTime > this.reactionDelay) {
                const originalAngle = this.angle;
                this.angle += (Math.random() - 0.5) * 0.2;
                this.shoot(engine);
                this.angle = originalAngle;
                this.fireCooldown = this.weapon.cooldown * 1.5;
            }
        } else {
            this.targetInSightTime = 0;
            this.state = 'roaming';
            this.stateTimer -= dt;
            if (this.stateTimer <= 0) {
                this.moveAngle = Math.random() * Math.PI * 2;
                this.stateTimer = 2 + Math.random() * 3;
            }

            this.x += Math.cos(this.moveAngle) * this.speed * 0.6 * dt;
            this.y += Math.sin(this.moveAngle) * this.speed * 0.6 * dt;
            this.angle = this.moveAngle;
        }

        this.x = Math.max(this.radius, Math.min(this.x, map.width - this.radius));
        this.y = Math.max(this.radius, Math.min(this.y, map.height - this.radius));
    }
}
