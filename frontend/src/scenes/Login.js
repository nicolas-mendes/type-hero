import { GameAPI } from "../api_client.js";

export class Login extends Phaser.Scene {
    constructor() {
        super('Login');
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        const element = this.add.dom(width / 2, height / 2).createFromCache('form_login');
        element.setOrigin(0.5);
        element.addListener('click');

        element.on('click', (event) => {
            if (event.target.id === 'loginBtn') {
                this.scene.start('MainMenu');
            }

            if (event.target.id === 'registerLink') {
                this.scene.start('Register');
            }

            if (event.target.id === 'previousLink') {
                this.scene.start('Title');
            }
        });

    }
}