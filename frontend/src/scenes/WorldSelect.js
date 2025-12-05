import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";

export class WorldSelect extends Phaser.Scene {
    constructor() { super('WorldSelect'); }

    init(data) {
        this.leagueId = data.leagueId || 1;
        this.leagueName = data.leagueName || "Liga Geral";
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setTint(0x111111);

        this.add.text(width / 2, 50, "CAMPANHA", { fontSize: '40px', fontFamily: '"Orbitron"' }).setOrigin(0.5);
        this.add.text(width / 2, 90, this.leagueName.toUpperCase(), { fontSize: '20px', color: '#00ff41' }).setOrigin(0.5);

        new Button(this, 100, 50, "VOLTAR", 120, 40, () => this.scene.start('SelectLeague'));

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

                // 1. Desenha os painéis informativos (Esquerda e Direita/Centro)
                this.drawStatsPanel(stats);
                this.drawWorldMap(mapData, stats);

                // =============================================================
                // LÓGICA DOS BOTÕES DE AÇÃO (RODAPÉ)
                // =============================================================
                const btnY = height - 80;
                const hasActiveRun = (stats.active !== false && stats.active !== null);

                if (hasActiveRun) {
                    // --- CENÁRIO: TEM SAVE ATIVO ---

                    // Botão 1: CONTINUAR (Destaque Verde)
                    const btnContinue = new Button(this, width / 2 + 110, btnY, "CONTINUAR", 200, 60, () => {
                        this.startRunGame(false); // isNew = false (Não reseta)
                    });
                    btnContinue.background.setTint(0x00ff00); // Verde Neon

                    // Adiciona um texto informativo sobre onde parou
                    this.add.text(width / 2 + 110, btnY - 45,
                        `Mundo ${stats.active.current_world_id} - Fase ${stats.active.current_level_id}`,
                        { fontSize: '14px', color: '#00ff00' }
                    ).setOrigin(0.5);


                    // Botão 2: REINICIAR (Perigo Vermelho)
                    const btnReset = new Button(this, width / 2 - 110, btnY, "REINICIAR", 200, 60, () => {
                        // Confirmação de segurança
                        if (confirm("⚠️ ATENÇÃO:\n\nVocê tem um jogo em andamento.\nIniciar uma nova run APAGARÁ seu progresso atual.\n\nDeseja realmente começar do zero?")) {
                            this.startRunGame(true); // isNew = true (Reseta no banco)
                        }
                    });
                    btnReset.background.setTint(0xff4444); // Vermelho Perigo

                } else {
                    // --- CENÁRIO: NÃO TEM SAVE ---

                    // Botão Único: NOVA RUN (Grande e Verde)
                    const btnNew = new Button(this, width / 2, btnY, "INICIAR NOVA RUN", 300, 70, () => {
                        // Como não tem save, pode ir direto sem confirmar
                        this.startRunGame(true);
                    });
                    btnNew.background.setTint(0x00ff00);
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
        const x = 200;
        const y = 200;

        const box = this.add.rectangle(x, y + 100, 300, 400, 0x000000, 0.5).setStrokeStyle(2, 0x444444);

        this.add.text(x, y - 50, "🏆 MELHOR RUN", { fontSize: '18px', color: '#ffd700' }).setOrigin(0.5);
        if (stats.best) {
            this.add.text(x, y - 20, `Score: ${stats.best.total_score}`, { fontSize: '24px' }).setOrigin(0.5);
            this.add.text(x, y + 10, `Chegou: Mundo ${stats.best.max_world_reached} - ${stats.best.max_level_reached}`, { fontSize: '16px', color: '#aaa' }).setOrigin(0.5);
        } else {
            this.add.text(x, y, "- Sem dados -", { color: '#666' }).setOrigin(0.5);
        }

        this.add.text(x, y + 80, "💀 ÚLTIMA MORTE", { fontSize: '18px', color: '#ff4444' }).setOrigin(0.5);
        if (stats.last) {
            this.add.text(x, y + 110, `Score: ${stats.last.total_score}`, { fontSize: '24px' }).setOrigin(0.5);
            this.add.text(x, y + 140, `Causa: ${stats.last.death_cause || 'Desconhecida'}`, { fontSize: '16px', color: '#aaa' }).setOrigin(0.5);
        } else {
            this.add.text(x, y + 120, "- Sem dados -", { color: '#666' }).setOrigin(0.5);
        }
    }

    drawWorldMap(mapData, stats) {
        let yPos = 150;
        const xPos = 800;

        this.add.text(xPos, 100, "MAPA DA LIGA", { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        mapData.forEach(world => {
            this.add.text(xPos, yPos, `🌍 ${world.name}`, { fontSize: '20px', color: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
            yPos += 40;

            world.levels.forEach(level => {
                const isPassed = stats.best && (
                    stats.best.max_world_reached > parseInt(world.order_index) ||
                    (stats.best.max_world_reached == parseInt(world.order_index) && stats.best.max_level_reached >= parseInt(level.order_index))
                );

                const color = isPassed ? '#00ff00' : '#555555';
                const icon = isPassed ? '✅' : '🔒';

                this.add.text(xPos, yPos, `${icon} ${level.name}`, { fontSize: '16px', color: color }).setOrigin(0.5);
                yPos += 30;
            });

            yPos += 20;
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