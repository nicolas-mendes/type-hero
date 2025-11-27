export class Preload extends Phaser.Scene {

    constructor() {
        super('Preload');
    }

    preload() {
        
        // Imagens do Sistema
        this.load.image('background', 'assets/summer.png');
        this.load.image('title', 'assets/title.png');
        this.load.image('button_bg', 'assets/button_bg.png');

        // Imagens do Jogo
        // this.load.spritesheet('hero', 'assets/hero_idle.png', { frameWidth: 64, frameHeight: 64 });
        // this.load.image('boss', 'assets/boss_monster.png');
        
        // HTML Templates
        this.load.html('form_login', 'assets/html/login.html');
        this.load.html('form_register', 'assets/html/register.html');
    }

    create() {
        this.scene.start('Menu');
    }
}