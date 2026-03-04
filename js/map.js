class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.obstacles = [];
        this.generate();
    }

    generate() {
        for (let i = 0; i < 150; i++) {
            this.obstacles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                type: Math.random() > 0.3 ? 'tree' : 'bush',
                radius: 40 + Math.random() * 40
            });
        }
    }

    draw(ctx, camera, viewport) {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        const gridSize = 100;

        const startX = Math.floor(camera.x / gridSize) * gridSize;
        const startY = Math.floor(camera.y / gridSize) * gridSize;

        for (let x = startX; x < camera.x + viewport.w + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, camera.y);
            ctx.lineTo(x, camera.y + viewport.h);
            ctx.stroke();
        }

        for (let y = startY; y < camera.y + viewport.h + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(camera.x, y);
            ctx.lineTo(camera.x + viewport.w, y);
            ctx.stroke();
        }

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, this.width, this.height);

        this.obstacles.forEach(obs => {
            if (obs.x + obs.radius < camera.x || obs.x - obs.radius > camera.x + viewport.w ||
                obs.y + obs.radius < camera.y || obs.y - obs.radius > camera.y + viewport.h) {
                return;
            }

            if (obs.type === 'tree') {
                ctx.fillStyle = '#15803d';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#14532d';
                ctx.lineWidth = 4;
                ctx.stroke();
            } else {
                ctx.fillStyle = '#16a34a';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}
