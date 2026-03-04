class App {
    constructor() {
        this.engine = new GameEngine('game-canvas');
        this.initUI();
    }

    initUI() {
        const playBtns = document.querySelectorAll('.mode-btn');
        const nicknameInput = document.getElementById('player-nickname');

        playBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.classList.contains('solo') ? 'solo' :
                    btn.classList.contains('duo') ? 'duo' : 'squad';

                const nickname = nicknameInput.value || 'Player_' + Math.floor(Math.random() * 9999);

                this.startMatch(mode, nickname);
            });
        });
    }

    startMatch(mode, nickname) {
        console.log(`Starting ${mode} match for ${nickname}`);
        document.getElementById('main-menu').style.display = 'none';
        this.engine.start(mode, nickname);
    }
}

window.addEventListener('load', () => {
    new App();
});
