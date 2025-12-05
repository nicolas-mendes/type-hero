export class TypingInput extends Phaser.Events.EventEmitter {
    
    constructor(scene) {
        super();
        this.scene = scene;
        this.enabled = true;

        this.keyListener = (e) => this.handleKeyDown(e);
        window.addEventListener('keydown', this.keyListener);
    }

    handleKeyDown(event) {
        if (!this.enabled) return;

        const key = event.key;

        // 1. Backspace
        if (key === 'Backspace') {
            event.preventDefault(); 
            this.emit('backspace');
            return;
        }

        // 2. Barra de Espaço (NOVO)
        if (key === ' ') {
            event.preventDefault(); // Evita scroll da página
            this.emit('type', ' ');
            return;
        }

        // 3. Letras (A-Z, Ç)
        if (key.length === 1 && key.match(/[a-zA-ZçÇ]/)) {
            const char = key.toUpperCase();
            this.emit('type', char);
        }
    }

    // ... (restante igual: enable, disable, destroy)
    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
    destroy() {
        window.removeEventListener('keydown', this.keyListener);
        this.removeAllListeners();
    }
}