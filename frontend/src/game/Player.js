export class Player extends Phaser.GameObjects.Container {

    constructor(scene, x, y, stats) {
        super(scene, x, y);
        this.scene = scene;

        // --- ATRIBUTOS ---
        this.maxHp = stats.hp || 100; // Garante valor padrão
        this.currentHp = this.maxHp;

        // --- VISUAL ---

        // 1. Sprite do Herói
        // Tenta pegar a animação 'heroi_idle'. Se não existir, usa um quadrado verde de fallback.
        if (scene.anims.exists('heroi_idle')) {
            this.sprite = scene.add.sprite(0, 0, 'heroi_idle');
            this.sprite.play('heroi_idle'); // Começa parado
            

        this.sprite.setScale(3); 
        } else {
            console.warn("Animação 'heroi_idle' não encontrada. Usando quadrado verde.");
            this.sprite = scene.add.rectangle(0, 0, 64, 64, 0x00ff00);
        }
        
        this.add(this.sprite);

        // 2. Barra de Vida (Posicionada acima da cabeça)
        this.hpBarBg = scene.add.rectangle(0, -60, 80, 10, 0x000000);
        this.hpBarFill = scene.add.rectangle(-40, -60, 78, 8, 0xff0000).setOrigin(0, 0.5); // Ancora na esquerda
        this.add([this.hpBarBg, this.hpBarFill]);

        this.updateHpBar();

        scene.add.existing(this);
    }

    // Método para receber dano e atualizar visual
    takeDamage(amount) {
        this.currentHp -= amount;
        if (this.currentHp < 0) this.currentHp = 0;

        // Feedback Visual
        this.updateHpBar();

        // Se for Sprite animado
        if (this.sprite.anims) {
            // Toca animação de hit
            if (this.scene.anims.exists('heroi_hit')) {
                this.sprite.play('heroi_hit');
                
                // Quando terminar a animação de dor, volta a ficar parado (se estiver vivo)
                this.sprite.once('animationcomplete', () => {
                    if (this.currentHp > 0) {
                        this.sprite.play('heroi_idle');
                    }
                });
            } else {
                // Fallback: Pisca vermelho se não tiver animação de hit
                this.sprite.setTint(0xff0000);
                this.scene.time.delayedCall(200, () => this.sprite.clearTint());
            }
        } 
        // Se for Quadrado (Fallback)
        else {
             this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 1
            });
        }

        // Balanço da câmera (Impacto)
        this.scene.cameras.main.shake(100, 0.01);

        return this.currentHp <= 0; // Retorna TRUE se morreu
    }

    // Animação de Ataque (Avança, bate e volta)
    playAttackAnim(targetX, onHitCallback) {
        
        // 1. Toca a animação de ataque
        if (this.sprite.anims && this.scene.anims.exists('heroi_attack')) {
            this.sprite.play('heroi_attack');
            
            // Volta para idle quando acabar o ataque
            this.sprite.once('animationcomplete', () => {
                this.sprite.play('heroi_idle');
            });
        }

        // 2. Movimento físico (Tween) - Opcional, mas dá impacto
        const originalX = this.x;
        
        // Determina a direção (se o inimigo ta na direita, vai pra frente +)
        const forwardDistance = 50; 

        this.scene.tweens.add({
            targets: this,
            x: originalX + forwardDistance, 
            duration: 150,
            yoyo: true,    
            ease: 'Power2',
            onYoyo: () => {
               
                if (onHitCallback) onHitCallback();
            }
        });
    }
    playDefenseAnim() {
        // 1. Toca a animação se existir
        if (this.sprite.anims && this.scene.anims.exists('heroi_defend')) {
            this.sprite.play('heroi_defend');
            
            // Volta para idle depois que a animação acabar
            this.sprite.once('animationcomplete', () => {
                this.sprite.play('heroi_idle');
            });
        }}
    updateHpBar() {
        const pct = Math.max(0, this.currentHp / this.maxHp);
        // 78 é a largura total definida no fill da barra
        this.hpBarFill.width = 78 * pct;
    }
}