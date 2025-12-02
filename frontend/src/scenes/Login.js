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

        element.on('click', async (event) => {
            if (event.target.id === 'loginBtn') {
                const userInput = element.getChildByName('user');
                const passInput = element.getChildByName('pass');
                if (userInput && passInput) {
                const usuario = userInput.value;
                const senha = passInput.value;}
                const resultado = await GameAPI.login(usuario, senha);
                this.scene.start('MainMenu');
                // 4. Processa a Resposta da API
                if (resultado.status === 'sucesso') {
                    console.log('Login bem-sucedido:', resultado.msg);
                    alert('Login bem-sucedido!');
                    this.scene.start('MainMenu'); // Navega para a próxima cena
                } else {
                    console.error('Falha no Login:', resultado.msg);
                    alert(`Falha no Login: ${resultado.msg}`);
                }

            } else {
                console.error("Campos de usuário/senha não encontrados no DOM.");
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