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

        const winProgress = new Window(this, width / 2, height / 2, 590, 475, "PROGRESSO ATUAL");

        const txtNivel = this.add.text(0, -100, "NÍVEL 5", { fontSize: '60px', color: '#fff' }).setOrigin(0.5);
        const txtXp = this.add.text(0, 0, "XP: 4500 / 5000", { fontSize: '24px', color: '#aaa' }).setOrigin(0.5);

        const barBg = this.add.rectangle(0, 50, 400, 30, 0x000000).setStrokeStyle(2, 0xffffff);
        const barFill = this.add.rectangle(-200, 50, 360, 20, 0x00ff00).setOrigin(0, 0.5);

        const btnJogar = new Button(this, 0, 200, "CONTINUAR CAMPANHA", 300, 60, () => {
            this.scene.start('WorldSelect');
        });

        winProgress.add([txtNivel, txtXp, barBg, barFill, btnJogar]);


        const winAccount = new Window(this, width * 0.15, height / 2, 250, 400, "PERFIL");

        const avatar = this.add.circle(0, -50, 50, 0xbd00ff);
        const userName = this.add.text(0, 20, "Aluno UFPR", { fontSize: '20px' }).setOrigin(0.5);
        const id= "";
        const btnLogout = new Button(this, 0, 120, "SAIR", 150, 40, () => {
            this.scene.start('Login');
        });

        winAccount.add([avatar, userName, btnLogout]);


        const winLeagues = new Window(this, width * 0.85, height / 2, 250, 400, "LIGAS");

        const txtLigaInfo = this.add.text(0, -50, "Liga: Turma DS\nRank: #4", { align: 'center' }).setOrigin(0.5);

        const btnRanking = new Button(this, 0, 50, "VER RANKING", 200, 40, () => {
            console.log("Abrir Ranking Completo");
        });

        const btnNovaLiga = new Button(this, 0, 110, "CRIAR LIGA", 200, 40, () => {
            console.log("Criar Nova Liga");
              
            winLeagues.remove([txtLigaInfo, btnRanking,btnNovaLiga], false);
            txtLigaInfo.setVisible(false);
            btnRanking.setVisible(false);
            btnNovaLiga.setVisible(false);
            const inputNomeLiga = this.add.dom(0, -70).createFromHTML(`
                <input type="text" id="inputLiga" style="width:180px; padding:5px;" placeholder="Nome da Liga">
            `);
            const inputPalavraChave = this.add.dom(0, -20).createFromHTML(`
                <input type="text" id="inputPalavraChave" style="width:180px; padding:5px;" placeholder="Palavra chave para liga">
            `);

            const btnCriar = new Button(this, 0, 40, "CONFIRMAR", 200, 40, async () => {
                const nomeLiga = document.getElementById("inputLiga").value;
                const palavraLiga = document.getElementById("inputLiga").value;
                const resultado = await GameAPI.CriarLiga(nomeLiga,palavraLiga,id);
                console.log("Criou liga:", nomeLiga);
            });
            const btnVoltar = new Button(this, 0, 100, "Voltar", 200, 40, () =>{
                winLeagues.remove([inputNomeLiga, btnCriar, btnVoltar,inputPalavraChave], true)
                winLeagues.add([txtLigaInfo, btnRanking, btnNovaLiga]);
                txtLigaInfo.setVisible(true);
                btnRanking.setVisible(true);
                btnNovaLiga.setVisible(true);
            });
            winLeagues.add([inputNomeLiga, btnCriar, btnVoltar,inputPalavraChave]);
        });

        winLeagues.add([txtLigaInfo, btnRanking, btnNovaLiga]);

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