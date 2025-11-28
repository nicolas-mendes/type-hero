import { WorldData } from "../data/Levels.js";
import { Button } from "../components/Button.js";

export class WorldSelect extends Phaser.Scene {
    constructor() { super('WorldSelect'); }

    create() {
        this.add.text(640, 50, "SELECIONE A MISSÃO", { fontSize: '40px' }).setOrigin(0.5);

        let yPos = 150;

        WorldData.forEach(world => {
            
            this.add.text(640, yPos, world.name, { color: '#ffff00' }).setOrigin(0.5);
            yPos += 50;

            // Para cada fase dentro do mundo...
            world.levels.forEach(level => {
                
                new Button(this, 640, yPos, `Nível ${level.id} - ${level.bossName}`, 400, 60, () => {
                    
                    // AQUI ESTÁ O SEGREDO:
                    // Passamos o objeto 'level' inteiro para a próxima cena
                    this.scene.start('GameScene', level);
                });

                yPos += 70;
            });
            
            yPos += 30; // Espaço entre mundos
        });
    }
}