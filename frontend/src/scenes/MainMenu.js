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
        const winProgress = new Window(this, width / 2, height / 2, 590, 550, "INICIAR JORNADA",
            "Escolha uma Liga para competir, enfrentar monstros e subir no ranking.\n\nSua pontuação é salva automaticamente a cada vitória.", {
            titleMargin: 140,
            fontSize: '24px'
        });
        const PlayLogo = this.add.image(0, -115, 'avatar_play');
        PlayLogo.setDisplaySize(150, 150);
        const btnPlay = new Button(this, 0, 200, "SELECIONAR LIGA", 250, 60, () => {
            this.scene.start('SelectLeague');
        }, 0x78e08f, 26);
        winProgress.add([btnPlay, PlayLogo]);

        //JANELA DE PERFIL
        const userName = this.registry.get('user_name');
        const winAccount = new Window(this, width * 0.15, height / 2, 300, 400, "PERFIL", `${userName}`, {
            titleMargin: 140,
            fontSize: '24px'
        });

        const avatar = this.add.image(0, -40, 'avatar_player');
        avatar.setDisplaySize(150, 150);
        const btnLogout = new Button(this, 0, 130, "SAIR", 100, 40, () => {
            if (window.confirm("Tem certeza que deseja sair?")) {
                localStorage.removeItem('game_token');
                this.registry.set('user_id', null);
                window.gameIsActive = false;
                this.scene.start('Title');
            }
        }, 0xef4444, 20);

        winAccount.add([avatar, btnLogout]);

        //JANELA DE LIGAS
        const winLeagues = new Window(this, width * 0.85, height / 2, 300, 400, "LIGAS", "Encontre Novas Ligas para Competir!", {
            titleMargin: 140,
        });

        const avatarLeague = this.add.image(0, -40, 'avatar_leagues');
        avatarLeague.setDisplaySize(150, 150);
        const btnLeagues = new Button(this, 0, 130, "VER LIGAS", 140, 40, () => {
            this.scene.start('Leagues');
        }, 0X4a69bd, 20);
        winLeagues.add([avatarLeague, btnLeagues]);


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