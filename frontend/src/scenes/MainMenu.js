import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";
import { Window } from "../components/Window.js";

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setTint(0x555555);

        //JANELA DE PROGRESSO
        const winProgress = new Window(this, width / 2, height / 2, 590, 475, "PROGRESSO ATUAL");
        const btnPlay = new Button(this, 0, 200, "CONTINUAR CAMPANHA", 300, 60, () => {
            this.scene.start('WorldSelect');
        });
        winProgress.add([btnPlay]);

        //JANELA DE PERFIL
        const winAccount = new Window(this, width * 0.15, height / 2, 250, 400, "PERFIL");
        const avatar = this.add.circle(0, -50, 50, 0xbd00ff);
        const userName = this.registry.get('user_name');
        const userNameTxt = this.add.text(0, 20, `${userName}`, { fontSize: '20px' }).setOrigin(0.5);
        const btnLogout = new Button(this, 0, 100, "SAIR", 150, 40, () => {
            if (window.confirm("Tem certeza que deseja sair?")) {
                localStorage.removeItem('game_token');
                this.registry.set('user_id', null);
                window.gameIsActive = false;
                this.scene.start('Title');
            }
        });
        const btnEdit = new Button(this, 0, 150, "EDITAR PERFIL", 150, 40, () => {
            console.log("Editar Dados de Usuário!");
        });
        winAccount.add([avatar, userNameTxt, btnLogout, btnEdit]);

        //JANELA DE LIGAS
        const winLeagues = new Window(this, width * 0.85, height / 2, 250, 400, "LIGAS");
        const txtLigaInfo = this.add.text(0, -50, "Liga: Turma DS\nRank: #4", { align: 'center' }).setOrigin(0.5);
        const btnLeagues = new Button(this, 0, 100, "VER LIGAS", 200, 40, () => {
            this.scene.start('Leagues');
        });
        winLeagues.add([txtLigaInfo,btnLeagues]);

        //ANIMAÇÃO DE JANELAS
        [winProgress, winAccount, winLeagues].forEach(win => {
            win.setScale(0);

            this.tweens.add({
                targets: win,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                ease: 'Back.out'
            });
        });
    }
}