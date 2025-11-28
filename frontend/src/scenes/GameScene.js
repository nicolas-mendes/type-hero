import { GameAPI } from "../api_client.js";

export class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    /**
     * @param {object} data - O objeto de configuração da fase
     */
    init(data) {
        // Se não vier dados (ex: teste direto), usa um padrão
        this.levelConfig = data || { 
            bossName: "Monstro Teste", 
            hp: 100, 
            background: 'bg_default' 
        };
        
        console.log("Carregando Fase:", this.levelConfig.id);
    }

    create() {
        const { width, height } = this.scale;

        // 1. Configura o Fundo Dinamicamente
        this.add.image(width/2, height/2, this.levelConfig.background)
            .setDisplaySize(width, height);

        // 2. Configura o Boss Dinamicamente
        this.boss = this.add.image(width/2, height/2, this.levelConfig.bossSprite);
        
        // 3. Configura a UI com os dados recebidos
        this.add.text(50, 50, this.levelConfig.bossName, { fontSize: '32px' });
        
        // Configura a vida inicial baseada no JSON
        this.currentHp = this.levelConfig.hp;
    }
    
    // ... resto da lógica do jogo ...
}