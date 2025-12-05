import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";
import { Window } from "../components/Window.js";

export class WorldSelect extends Phaser.Scene {
    constructor() { super('WorldSelect'); }

    init(data) {
        this.leagueId = data.leagueId || 1;
        this.leagueName = data.leagueName || "Liga Geral";
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setTint(0x111111);

        this.add.text(width / 2, 50, this.leagueName.toUpperCase(), {
            fontSize: '40px',
            fontFamily: '"Orbitron", sans-serif',
            color: '#ffffff',
        }).setOrigin(0.5);

        new Button(this, 100, 50, "VOLTAR", 100, 40, () => this.scene.start('SelectLeague'), 0xef4444, 20);

        this.loadHubData();
    }

    async loadHubData() {
        const { width, height } = this.scale;

        const loading = this.add.text(width / 2, height / 2, "Sincronizando dados...", {
            fontSize: '24px', fontFamily: '"Orbitron"'
        }).setOrigin(0.5);

        try {
            const res = await GameAPI.getHubData(this.leagueId);
            loading.destroy();

            if (res.status === 'sucesso') {
                const stats = res.data.stats;
                const mapData = res.data.map_structure;

                this.drawStatsPanel(stats);
                this.drawWorldMap(mapData, stats);

                const btnY = height - 80;
                const hasActiveRun = (stats.active !== false && stats.active !== null);

                if (hasActiveRun) {
                    new Button(this, width / 2 + 110, btnY, "CONTINUAR", 200, 60, () => {
                        this.startRunGame(false);
                    }, 0x78e08f);

                    this.add.text(width / 2 + 110, btnY - 45,
                        `Mundo ${stats.active.current_world_id} - Fase ${stats.active.current_level_id}`,
                        { fontSize: '16px', color: '#00ff00', fontFamily: '"Rajdhani"' }
                    ).setOrigin(0.5);

                    new Button(this, width / 2 - 110, btnY, "REINICIAR", 200, 60, () => {
                        if (confirm("⚠️ ATENÇÃO:\n\nIniciar uma nova run APAGARÁ seu progresso atual.\n\nDeseja realmente começar do zero?")) {
                            this.startRunGame(true);
                        }
                    }, 0xef4444);

                } else {
                    new Button(this, width / 2, btnY, "INICIAR NOVA RUN", 300, 70, () => {
                        this.startRunGame(true);
                    }, 0x78e08f, 25);
                }

            } else {
                this.add.text(width / 2, height / 2, "Erro: " + res.msg, { color: '#ff0000' }).setOrigin(0.5);
            }
        } catch (e) {
            console.error(e);
            loading.setText("Erro de conexão.");
        }
    }

    drawStatsPanel(stats) {
        const winStats = new Window(this, 200, 360, 325, 350, "ESTATÍSTICAS");
        const content = this.add.container(0, 0);

        const titleBest = this.add.text(0, -70, "🏆 MELHOR RUN", { fontSize: '18px', color: '#ffd700', fontFamily: '"Rajdhani"', fontStyle: 'bold' }).setOrigin(0.5);
        let txtBestScore = this.add.text(0, -40, "- Sem dados -", { fontSize: '16px', color: '#666', fontFamily: '"Rajdhani"' }).setOrigin(0.5);
        let txtBestLevel = null;

        if (stats.best) {
            txtBestScore.setText(`${stats.best.total_score} PTS`);
            txtBestScore.setColor('#ffffff');
            txtBestScore.setFontSize(28);

            txtBestLevel = this.add.text(0, -15, `Mundo ${stats.best.max_world_reached} - ${stats.best.max_level_reached}`, { fontSize: '14px', color: '#aaaaaa', fontFamily: '"Rajdhani"' }).setOrigin(0.5);
            content.add(txtBestLevel);
        }

        const titleLast = this.add.text(0, 20, "💀 ÚLTIMA RUN", { fontSize: '18px', color: '#ff4444', fontFamily: '"Rajdhani"', fontStyle: 'bold' }).setOrigin(0.5);
        let txtLastScore = this.add.text(0, 50, "- Sem dados -", { fontSize: '16px', color: '#666', fontFamily: '"Rajdhani"' }).setOrigin(0.5);
        let txtDeath = null;

        if (stats.last) {
            txtLastScore.setText(`${stats.last.total_score} PTS`);
            txtLastScore.setColor('#ffffff');
            txtLastScore.setFontSize(28);

            // txtDeath = this.add.text(0, 80, `Causa da : ${stats.last.death_cause || 'Desconhecida'}`, { fontSize: '14px', color: '#aaaaaa', fontFamily: '"Rajdhani"' }).setOrigin(0.5);
            // content.add(txtDeath);
        }

        content.add([titleBest, txtBestScore, titleLast, txtLastScore]);
        winStats.addContent(content);
    }

    drawWorldMap(mapData, stats) {
        const centerX = this.scale.width / 2;
        let yPos = 180;

        this.add.text(centerX, 120, "MAPA DE FASES", {
            fontSize: '24px', color: '#ffffff', fontFamily: '"Orbitron"', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        mapData.forEach(world => {
            this.add.text(centerX, yPos, `🌍 ${world.name.toUpperCase()}`, {
                fontSize: '22px', color: '#ffff00', fontStyle: 'bold', fontFamily: '"Rajdhani"', stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);

            yPos += 40;

            world.levels.forEach(level => {
                const isPassed = stats.best && (
                    stats.best.max_world_reached > parseInt(world.order_index) ||
                    (stats.best.max_world_reached == parseInt(world.order_index) && stats.best.max_level_reached >= parseInt(level.order_index))
                );

                const color = isPassed ? '#00ff00' : '#888888';
                const icon = isPassed ? '✅' : '🔒';
                const bossIcon = level.boss_monster_id ? '💀 ' : '';

                this.add.text(centerX, yPos, `${icon} ${bossIcon}${level.name}`, {
                    fontSize: '18px',
                    color: color,
                    fontFamily: '"Rajdhani", monospace'
                }).setOrigin(0.5);

                yPos += 30;
            });

            yPos += 30;
        });
    }

    async startRunGame(isNew) {
        try {
            const response = await GameAPI.startRun(this.leagueId, isNew);
            if (response.status === 'sucesso') {
                const gameData = {
                    ...response.level_data,
                    leagueId: this.leagueId
                };
                this.scene.start('GameScene', gameData);
            } else {
                alert("Erro ao iniciar: " + response.msg);
            }
        } catch (e) {
            console.error(e);
        }
    }
}