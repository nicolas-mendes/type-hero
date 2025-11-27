import { GameAPI } from "../api_client.js";

export class Register extends Phaser.Scene {
    constructor() {
        super('Register');
    }

    create() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        const element = this.add.dom(width / 2, height / 2).createFromCache('form_register');
        element.setOrigin(0.5);
        element.addListener('click');

        element.on('click', (event) => {
            if (event.target.id === 'registerBtn') {
                console.log('Cadastro Realizado');
            }

            if (event.target.id === 'previousLink') {
                this.scene.start('Login');
            }
        });

    }
}