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
        // element.on('click', async (event) => {
        //     if (event.target.name === 'loginBtn') {
        //         const userInput = element.getChildByName('user');
        //         const passInput = element.getChildByName('pass');

        //         // Chama o PHP
        //         const resposta = await GameAPI.login(userInput.value, passInput.value);

        //         if (resposta.status === 'sucesso') {
        //             // Salva ID e vai pro jogo
        //             this.registry.set('user_id', resposta.user_id);
        //             // this.scene.start('Menu'); // Futuramente vai pro Menu
        //             console.log("LOGADO COM SUCESSO!");
        //         } else {
        //             alert('Erro: ' + resposta.msg);
        //         }
        //     }
        // });
    }
}