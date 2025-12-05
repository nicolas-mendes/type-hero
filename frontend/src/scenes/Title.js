import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";

export class Title extends Phaser.Scene {

    constructor() {
        super('Title');
    }

    create() {
        const { width, height } = this.scale;

        const ghostText = this.add.text(0, 0, "Gatilho", {
            fontFamily: 'Tektur',
            fontSize: '26px',
            fontStyle: 'bold'
        }).setVisible(false);
        const ghostText2 = this.add.text(0, 0, "Gatilho", {
            fontFamily: 'Orbitron',
            fontSize: '26px',
            fontStyle: 'bold'
        }).setVisible(false);

        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        const title = this.add.image(width / 2, height / 3, 'title');
        title.setDisplaySize(width / 2, height / 2);


        document.fonts.load('bold 26px "Tektur"').then(() => {
            ghostText.destroy();
            this.createUI(width, height);

        }).catch((err) => {
            console.error("Fonte demorou demais, criando assim mesmo...", err);
            this.createUI(width, height);
        });
    }

    createUI(width, height) {
        new Button(this, 640, 500, "BEM VINDO!", 190, 65, async () => {

            const token = localStorage.getItem('game_token');

            if (!token) {
                this.scene.start('Login');
                return;
            }

            console.log("Validando sessão...");

            try {
                const response = await GameAPI.validateSession();
                if (response.status === 'sucesso') {
                    this.registry.set('user_id', response.user_id);
                    this.registry.set('user_name', response.nome);
                    window.gameIsActive = true;
                    this.scene.start('MainMenu');
                    console.log("Usuário Autenticado!");
                } else {
                    localStorage.removeItem('game_token');
                    this.scene.start('Login');
                    console.log("Usuário Não Autenticado!");
                }
            } catch (e) {
                this.scene.start('Login');
            }
        },0x7a6fb0,28);
    }
}