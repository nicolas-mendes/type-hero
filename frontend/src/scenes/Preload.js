export class Preload extends Phaser.Scene {

    constructor() {
        super('Preload');
    }

    preload() {
        
        // Imagens do Sistema
        this.load.image('background', 'assets/summer.png');

        // Imagens do Jogo
        // this.load.spritesheet('hero', 'assets/hero_idle.png', { frameWidth: 64, frameHeight: 64 });
        // this.load.image('boss', 'assets/boss_monster.png');
        
        // HTML Templates
        this.load.html('form_login', 'assets/html/login.html');
    }

    create() {
        this.scene.start('Login');
    }
}