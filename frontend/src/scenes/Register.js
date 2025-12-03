import { GameAPI } from "../api_client.js";

export class Register extends Phaser.Scene {
    constructor() {
        super('Register');
    }

    create() {
        function resetButtonState(btn) {
            btn.innerText = "ENTRAR";
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.style.opacity = "1";
        }

        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        const element = this.add.dom(width / 2, height / 2).createFromCache('form_register');
        element.setOrigin(0.5);
        element.addListener('click');

        const btnRegister = element.node.querySelector('#registerBtn');

        element.on('click', async (event) => {
            if (event.target.id === 'registerBtn') {

                const userInput = element.getChildByName('user');
                const passInput = element.getChildByName('password');
                const passConfirmInput = element.getChildByName('password_confirm');

                if (!userInput || !passInput || !passConfirmInput || userInput.value === "" || passInput.value === "" || passConfirmInput.value === "") {
                    alert("Por favor, preencha todos os Campos.");
                    return;
                }

                const user = userInput.value;
                const password = passInput.value;
                const password_confirm = passConfirmInput.value;

                btnRegister.innerText = "Carregando...";
                btnRegister.disabled = true;
                btnRegister.style.cursor = "wait";
                btnRegister.style.opacity = "0.7";

                console.log("Verificando credenciais...");

                try {
                    const response = await GameAPI.register(user, password, password_confirm);

                    if (response.status === 'sucesso') {
                        btnRegister.innerText = "Bem-vindo!";
                        btnRegister.style.backgroundColor = "#00ff00";

                        this.registry.set('user_id', response.user_id);
                        this.registry.set('user_name', response.username);

                        localStorage.setItem('game_token', response.token);

                        window.gameIsActive = true;
                        this.time.delayedCall(1000, () => {
                            this.scene.start('MainMenu');
                        });

                    } else {
                        alert(`Erro: ${response.msg}`);
                        this.cameras.main.shake(200, 0.01);
                        resetButtonState(btnRegister);
                    }
                } catch (error) {
                    console.error("Erro de conexão:", error);
                    resetButtonState(btnRegister);
                }
            }

            if (event.target.id === 'previousLink') {
                this.scene.start('Login');
            }
        });

    }
}