import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";
import { TypingInput } from "../game/TypingInput.js";
import { TextBlock } from "../game/TextBlock.js";
import { WordDictionary } from "../game/WordDictionary.js";
import { Player } from "../game/Player.js";
import { Enemy } from "../game/Enemy.js";

export class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.runData = data;
        this.playerStats = data.player_stats || {
            hp: 100,
            damage: 10,
            playerDefenseTime: 15,
            playerDefenseWord: 5
        };

        this.currentHp = this.playerStats.hp;
        this.scoreGainedInThisLevel = 0;

        this.enemyQueue = [];
        this.currentEnemyObject = null;
        this.isPlayerTurn = true;
    }

    preload(){
        this.load.path = 'assets/worlds/characters/Hero/'; 
        this.load.aseprite('heroi_idle', 'heroi_idle.png', 'heroi_idle.json');
        this.load.aseprite('heroi_attack', 'heroi_at.png', 'heroi_at.json');
        this.load.aseprite('heroi_hit', 'heroi_dn.png', 'heroi_dn.json');
        this.load.aseprite('heroi_defend', 'heroi_defesa.png', 'heroi_defesa.json');

        this.load.path = 'assets/worlds/characters/Lobo1/';
        
        this.load.aseprite('lobo_idle', 'lobo_idle.png', 'lobo_idle.json');
        this.load.aseprite('lobo_attack', 'lobo_at.png', 'lobo_at.json');
        this.load.aseprite('lobo_hit', 'lobo_dn.png', 'lobo_dn.json');


        this.load.path = 'assets/worlds/characters/Paladino/';
        this.load.aseprite('paladino_idle', 'paladino_st.png', 'paladino_st.json');
        this.load.aseprite('paladino_attack', 'paladino_at.png', 'paladino_at.json');
        this.load.aseprite('paladino_hit', 'paladino_dn.png', 'paladino_dn.json');

        this.load.path = 'assets/worlds/characters/Goblin1/';
        this.load.aseprite('goblin_idle', 'goblin_idle.png', 'goblin_idle.json'); 
        this.load.aseprite('goblin_attack', 'goblin_at.png', 'goblin_at.json');
        this.load.aseprite('goblin_hit', 'goblin_dn.png', 'goblin_dn.json');

        this.load.path = 'assets/worlds/characters/Goblin2/';
        this.load.aseprite('goblin2_idle', 'goblin2_st.png', 'goblin2_st.json');
        this.load.aseprite('goblin2_attack', 'goblin2_at.png', 'goblin2_at.json');
        this.load.aseprite('goblin2_hit', 'goblin2_dn.png', 'goblin2_dn.json');
    }

    create() {

        const { width, height } = this.scale;
        
        this.createAllAnims();  

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setTint(0x444444);

        this.player = new Player(this, 375, height / 2 + 100, this.playerStats);

        this.inputManager = new TypingInput(this);

        this.events.on('shutdown', () => {
            this.inputManager.destroy();
        });

        this.inputManager.on('type', (char) => {
            if (this.activeTextBlock && this.activeTextBlock.active) {
                this.activeTextBlock.handleKey(char);
            }
        });

        this.inputManager.on('backspace', () => {
            if (this.activeTextBlock && this.activeTextBlock.active) {
                this.activeTextBlock.handleKey('BACKSPACE');
            }
        });

        const btnAbandon = new Button(this, width - 100, 50, "DESISTIR", 130, 40, () => {
            this.handleGiveUp();
        },0x550000, 20);

        this.startLevel();
    }

    createAllAnims() {
    // --- HEROI ---
        // Tags usadas nos JSONs novos: "idle", "attack", "hit"
        this.createAnimSafe('heroi_idle', 'heroi_idle', true);
        this.createAnimSafe('heroi_attack', 'heroi_attack', false);
        this.createAnimSafe('heroi_hit', 'heroi_hit', false);
        this.createAnimSafe('heroi_defend', 'heroi_defend', false);

        // --- LOBO ---
        this.createAnimSafe('lobo_idle', 'lobo_idle', true);
        this.createAnimSafe('lobo_attack', 'lobo_attack', false);
        this.createAnimSafe('lobo_hit', 'lobo_hit', false);
        // Paladino
        this.createAnimSafe('paladino_idle', 'paladino_idle', true);
        this.createAnimSafe('paladino_attack', 'paladino_attack', false);
        this.createAnimSafe('paladino_hit', 'paladino_hit', false);

        // Goblin 1
        this.createAnimSafe('goblin_idle', 'goblin_idle', true);
        this.createAnimSafe('goblin_attack', 'goblin_attack', false);
        this.createAnimSafe('goblin_hit', 'goblin_hit', false);

        // Goblin 2
        this.createAnimSafe('goblin2_idle', 'goblin2_idle', true);
        this.createAnimSafe('goblin2_attack', 'goblin2_attack', false);
        this.createAnimSafe('goblin2_hit', 'goblin2_hit', false);
    }

    createAnimSafe(assetKey, uniqueAnimName, loop) {
        // 1. Cria as animações do arquivo Aseprite
        const animsCreated = this.anims.createFromAseprite(assetKey);
        
        if (animsCreated && animsCreated.length > 0) {
            const anim = animsCreated[0]; //)


            this.anims.remove(anim.key);

            // 3. Renomeia para o nome único (ex: "goblin_attack")
            anim.key = uniqueAnimName;
            if (loop) anim.repeat = -1;

            // 4. Adiciona de volta ao gerenciador com o nome novo e seguro
            this.anims.add(uniqueAnimName, anim);
            
            console.log(`Animação criada com sucesso: ${uniqueAnimName}`);
        } else {
            console.warn(`Não foi possível criar animação para: ${assetKey}. Verifique se a TAG está no JSON.`);
        }
    }

    // =================================================================
    // CONTROLE DE FLUXO DA FASE
    // =================================================================

    async startLevel() {
        try {
            const res = await GameAPI.getLevelEnemies(this.runData.level_id);

            if (res.status === 'sucesso') {
                this.enemyQueue = [];

                res.enemies.forEach(group => {
                    for (let i = 0; i < group.quantity; i++) {
                        this.enemyQueue.push({
                            name: group.name,
                            maxHp: group.base_hp,
                            currentHp: group.base_hp,
                            damage: group.damage,
                            sprite: group.sprite_key,
                            enemyAttackWord: group.enemyAttackWord,
                            enemyAttackTime: group.enemyAttackTime
                        });
                    }
                });

                if (this.runData.boss_id) {
                }

                if (this.enemyQueue.length > 0) {
                    this.nextEnemy();
                } else {
                    this.handleVictory();
                }

            } else {
                alert("Erro ao carregar inimigos: " + res.msg);
            }
        } catch (e) {
            console.error(e);
        }
    }

    nextEnemy() {
        if (this.enemyQueue.length === 0) {
            this.handleVictory();
            return;
        }

        // 1. Limpa o inimigo anterior
        if (this.currentEnemyObject) {
            this.currentEnemyObject.destroy();
        }

        // 2. Pega os dados do próximo inimigo
        const nextEnemyData = this.enemyQueue.shift();

        // 3. Instancia a Classe Enemy
        // Posicionado à direita
        const { width, height } = this.scale;
        this.currentEnemyObject = new Enemy(this, width - 375, height / 2 + 100, nextEnemyData);

        // 4. Inicia o Turno do Jogador
        this.time.delayedCall(1000, () => {
            this.startPlayerTurn();
        });
    }

    // =================================================================
    // MÁQUINA DE ESTADOS (TURNOS)
    // =================================================================
    startPlayerTurn() {
        const { width, height } = this.scale;
        this.isPlayerTurn = true;

        let targetX = width / 2;
        let targetY = height / 2;

        if (this.currentEnemyObject && this.currentEnemyObject.active) {
            targetX = this.currentEnemyObject.x;
            targetY = this.currentEnemyObject.y - 200;
        }

        this.showFloatingText("SUA VEZ!", '#00ff00');

        const wordCount = this.playerStats.playerAttackWord;
        const timeLimit = this.playerStats.playerAttackTime;
        const words = WordDictionary.getWords(wordCount);

        this.activeTextBlock = new TextBlock(
            this, targetX, targetY, words, timeLimit,

            // Sucesso
            () => {
                this.player.playAttackAnim(targetX, () => {
                    this.damageEnemy(this.playerStats.damage);
                });
            },

            // Falha
            () => {
                this.cameras.main.shake(100, 0.005);
                this.showFloatingText("ERROU!", '#ff0000');
                this.time.delayedCall(500, () => this.startEnemyTurn());
            }
        );
    }

    startEnemyTurn() {
        const { width, height } = this.scale;
        this.isPlayerTurn = false;

    // Toca a animação do inimigo atacando
  

        if (!this.currentEnemyObject || !this.currentEnemyObject.active) return;

        // 1. Define a Posição (Em cima do Player)
        const targetX = this.player.x;
        const targetY = this.player.y - 200;

        this.showFloatingText("DEFENDA-SE!", '#ff0000');

        const wordCount = this.currentEnemyObject.enemyAttackWord;
        const timeLimit = this.currentEnemyObject.enemyAttackTime;
        const words = WordDictionary.getWords(wordCount);

        this.activeTextBlock = new TextBlock(
            this, targetX, targetY, words, timeLimit,

            // Sucesso
            () => {
                this.showFloatingText("BLOQUEADO!", '#ffff00');
                this.player.playDefenseAnim();
                this.time.delayedCall(500, () => this.startPlayerTurn());
            },

            // Falha
            () => {
                this.currentEnemyObject.playAttack(() => {
        // Só aplica o dano quando a animação terminar (ou durante)
                this.damagePlayer(this.currentEnemyObject.damageValue);
    });
            }
        );
    }

    // =================================================================
    // AÇÕES DE COMBATE
    // =================================================================

    damageEnemy(amount) {
        const isDead = this.currentEnemyObject.takeDamage(amount);

        if (isDead) {
            this.scoreGainedInThisLevel += 100;
            this.time.delayedCall(1000, () => this.nextEnemy());
        } else {
            this.time.delayedCall(1000, () => this.startEnemyTurn());
        }
    }

    damagePlayer(amount) {
        const isDead = this.player.takeDamage(amount);

        this.currentHp = this.player.currentHp;

        if (isDead) {
            this.handleDefeat();
        } else {
            this.time.delayedCall(1000, () => this.startPlayerTurn());
        }
    }


    showFloatingText(msg, color) {
        const { width, height } = this.scale;
        const txt = this.add.text(width / 2, height / 2 - 100, msg, {
            fontSize: '32px', color: color, fontStyle: 'bold', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: txt, y: txt.y - 50, alpha: 0, duration: 1000,
            onComplete: () => txt.destroy()
        });
    }

    // =================================================================
    // FIM DE JOGO
    // =================================================================

    async handleVictory() {
        const { width, height } = this.scale;

        this.inputManager.disable();

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

        const txtTitle = this.add.text(width / 2, height / 2 - 100, "VITÓRIA!", {
            fontSize: '60px', color: '#00ff00', fontStyle: 'bold', fontFamily: '"Orbitron"'
        }).setOrigin(0.5);

        const txtLoading = this.add.text(width / 2, height / 2, "Salvando progresso...", { fontSize: '20px' }).setOrigin(0.5);

        try {
            const res = await GameAPI.completeLevel(
                this.runData.leagueId,
                this.runData.level_id,
                this.currentHp,
                this.scoreGainedInThisLevel,
                this.runData.score
            );

            txtLoading.destroy();

            if (res.status === 'proxima_fase') {

                this.add.text(width / 2, height / 2 - 20, `Pontos da Fase: +${this.scoreGainedInThisLevel}`, { fontSize: '24px' }).setOrigin(0.5);
                this.add.text(width / 2, height / 2 + 20, `Vida Restante: ${this.currentHp}`, { fontSize: '24px', color: '#ffaaaa' }).setOrigin(0.5);

                const btnNext = new Button(this, width / 2, height / 2 + 100, "PRÓXIMO NÍVEL >>", 250, 60, () => {
                    const nextData = {
                        ...res.next_level_data,
                        leagueId: this.runData.leagueId,
                        player_stats: res.next_level_data.player_stats || {
                            hp: this.currentHp,
                            damage: this.playerStats.damage,
                            playerDefenseTime: this.playerStats.playerDefenseTime,
                            playerDefenseWord: this.playerStats.playerDefenseWord
                        }
                    };
                    this.scene.start('GameScene', nextData);
                },0x78e08f);

                const btnExit = new Button(this, width / 2, height / 2 + 180, "SALVAR E SAIR", 200, 50, () => {
                    this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
                },0x555555);

            }

            else if (res.status === 'vitoria_total') {
                txtTitle.setText("LIGA COMPLETADA!");
                txtTitle.setColor('#ffd700');

                this.add.text(width / 2, height / 2, "Parabéns! Você venceu todos os desafios.", { fontSize: '20px' }).setOrigin(0.5);

                new Button(this, width / 2, height / 2 + 100, "VOLTAR AO MENU", 250, 60, () => {
                    this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
                }, 0x3c6382);
            }

        } catch (e) {
            console.error(e);
            txtLoading.setText("Erro de conexão ao salvar!");
            // Botão de emergência para sair se der erro
            new Button(this, width / 2, height / 2 + 100, "FORÇAR SAÍDA", 200, 50, () => {
                this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
            });
        }
    }

    async handleGiveUp() {
        this.inputManager.disable();

        const confirmacao = window.confirm(
            "⚠️ TEM CERTEZA?\n\n" +
            "Se você desistir agora, sua run será encerrada e você perderá o progresso atual.\n" +
            "A pontuação até aqui será salva no histórico."
        );

        if (!confirmacao) {
            this.inputManager.enable();
            return;
        }

        const { width, height } = this.scale;
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        const txt = this.add.text(width / 2, height / 2, "Encerrando run...", { fontSize: '24px' }).setOrigin(0.5);

        try {
            const res = await GameAPI.gameOver(
                this.runData.leagueId,
                this.scoreGainedInThisLevel
            );

            if (res.status === 'sucesso') {
                this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
            } else {
                alert("Erro ao encerrar: " + res.msg);
                this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
            }

        } catch (e) {
            console.error(e);
            alert("Erro de conexão.");
            this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
        }
    }

    async handleDefeat() {
        this.inputManager.disable();
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x330000, 0.9);
        overlay.setDepth(1000);

        const txtTitle = this.add.text(width / 2, height / 2 - 80, "GAME OVER", {
            fontSize: '60px', color: '#ff0000', fontStyle: 'bold', fontFamily: '"Orbitron"'
        }).setOrigin(0.5).setDepth(1001);

        const txtStatus = this.add.text(width / 2, height / 2, "Gravando seu legado...", {
            fontSize: '20px', fontFamily: '"Roboto Mono"'
        }).setOrigin(0.5).setDepth(1001);

        try {
            const res = await GameAPI.gameOver(
                this.runData.leagueId,
                this.scoreGainedInThisLevel,
                {
                    wpm: 0,
                    accuracy: 0,
                    words: 0,
                    time: 0
                }
            );

            if (res.status === 'sucesso') {
                txtStatus.setText(`Pontuação Final: ${res.final_score}`);
                txtStatus.setColor('#ffff00');
            } else {
                console.warn(res.msg);
                txtStatus.setText("Fim de jogo.");
            }

        } catch (e) {
            console.error(e);
            txtStatus.setText("Erro de conexão ao salvar histórico.");
        }

        const btnBack = new Button(this, width / 2, height / 2 + 100, "VOLTAR AO HUB", 250, 60, () => {
            this.scene.start('WorldSelect', { leagueId: this.runData.leagueId });
        },0xef4444);

        btnBack.setDepth(1002);
    }
}