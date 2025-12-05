import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";

export class SelectLeague extends Phaser.Scene {
    constructor() { super('SelectLeague'); }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setTint(0x111111);
        this.add.text(width / 2, 80, "SELECIONE A LIGA", { fontSize: '40px', fontFamily: '"Orbitron"' }).setOrigin(0.5);
        this.add.text(width / 2, 120, "Onde você vai jogar agora?", { fontSize: '20px', color: '#aaaaaa' }).setOrigin(0.5);

        new Button(this, 100, 50, "VOLTAR", 100, 40, () => this.scene.start('MainMenu'), 0xef4444, 20);

        this.listContainer = this.add.container(0, 0);

        this.loadLeagues();
    }

    async loadLeagues() {
        const { width, height } = this.scale;
        const loading = this.add.text(width / 2, height / 2, "Carregando ligas...", { fontSize: '24px' }).setOrigin(0.5);

        try {
            const res = await GameAPI.getMyLeagues();
            loading.destroy();

            if (res.status === 'sucesso') {
                const leagues = res.data;
                let yPos = 200;

                if (leagues.length === 0) {
                    this.add.text(width / 2, height / 2, "Você não participa de nenhuma liga.", { fontSize: '24px', color: '#ff5555' }).setOrigin(0.5);

                    new Button(this, width / 2, height / 2 + 80, "BUSCAR LIGAS", 250, 60, () => {
                        this.scene.start('Leagues');
                    });
                } else {
                    leagues.forEach(league => {
                        let btnColor = 0x3c6382;

                        if (league.name === 'Liga Geral') {
                            btnColor = 0xffd700;
                        }

                        const btn = new Button(this, width / 2, yPos, league.name.toUpperCase(), 300, 70, () => {
                            this.scene.start('WorldSelect', {
                                leagueId: league.id,
                                leagueName: league.name
                            });
                        }, btnColor, 35);

                        this.listContainer.add(btn);
                        yPos += 90;
                    });
                }
            } else {
                this.add.text(width / 2, height / 2, "Erro: " + res.msg, { color: 'red' }).setOrigin(0.5);
            }
        } catch (e) {
            console.error(e);
            loading.setText("Erro de conexão.");
        }
    }
}