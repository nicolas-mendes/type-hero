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

        if (key === 'Backspace') {
            event.preventDefault(); 
            this.emit('backspace');
            return;
        }

        if (key === ' ') {
            event.preventDefault();
            this.emit('type', ' ');
            return;
        }

        if (key.length === 1 && key.match(/[a-zA-ZçÇ]/)) {
            const char = key.toUpperCase();
            this.emit('type', char);
        }
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
    destroy() {
        window.removeEventListener('keydown', this.keyListener);
        this.removeAllListeners();
    }
}