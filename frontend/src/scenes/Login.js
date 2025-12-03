import { GameAPI } from "../api_client.js";

export class Login extends Phaser.Scene {
    constructor() { super('Login'); }

    create() {
        function resetButtonState(btn) {
            btn.innerText = "ENTRAR";
            btn.disabled = false;         
            btn.style.cursor = "pointer";
            btn.style.opacity = "1";        
        }

        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        const element = this.add.dom(width / 2, height / 2).createFromCache('form_login');
        element.setOrigin(0.5);
        element.addListener('click');

        const btnLogin = element.node.querySelector('#loginBtn');
        element.on('click', async (event) => {
            if (event.target.id === 'loginBtn') {

                const userInput = element.getChildByName('user');
                const passInput = element.getChildByName('password');

                if (!userInput || !passInput || userInput.value === "" || passInput.value === "") {
                    alert("Por favor, preencha usuário e senha.");
                    return;
                }

                const user = userInput.value;
                const password = passInput.value;

                btnLogin.innerText = "Carregando...";
                btnLogin.disabled = true;
                btnLogin.style.cursor = "wait";
                btnLogin.style.opacity = "0.7";

                console.log("Verificando credenciais...");

                try {
                    const response = await GameAPI.login(user, password);

                    if (response.status === 'sucesso') {
                        console.log('Login autorizado!');
                        btnLogin.innerText = "Sucesso!";
                        btnLogin.style.backgroundColor = "#00ff00";

                        this.registry.set('user_id', response.user_id);
                        this.registry.set('user_name', response.username);

                        localStorage.setItem('game_token', response.token);

                        window.gameIsActive = true;
                        this.scene.start('MainMenu');
                    } else {
                        alert(`Erro: ${response.msg}`);
                        this.cameras.main.shake(200, 0.01);
                        resetButtonState(btnLogin);
                    }
                } catch (error) {
                    console.error("Erro de conexão:", error);
                    resetButtonState(btnLogin);
                }
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