export class Player extends Phaser.GameObjects.Container {

    constructor(scene, x, y, stats) {
        super(scene, x, y);
        this.scene = scene;

        this.maxHp = stats.hp || 100;
        this.currentHp = this.maxHp;

        if (scene.anims.exists('heroi_idle')) {
            this.sprite = scene.add.sprite(0, 0, 'heroi_idle');
            this.sprite.play('heroi_idle');
            

        this.sprite.setScale(3); 
        } else {
            console.warn("Animação 'heroi_idle' não encontrada. Usando quadrado verde.");
            this.sprite = scene.add.rectangle(0, 0, 64, 64, 0x00ff00);
        }
        
        this.add(this.sprite);

        this.hpBarBg = scene.add.rectangle(0, -90, 80, 10, 0x000000);
        this.hpBarFill = scene.add.rectangle(-40, -90, 78, 8, 0xff0000).setOrigin(0, 0.5);
        this.add([this.hpBarBg, this.hpBarFill]);

        this.updateHpBar();

        scene.add.existing(this);
    }


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
          
                this.sprite.setTint(0xff0000);
                this.scene.time.delayedCall(200, () => this.sprite.clearTint());
            }
        } 
      
        else {
             this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 1
            });
        }

        this.scene.cameras.main.shake(100, 0.01);

        return this.currentHp <= 0; 
    }

    
    playAttackAnim(targetX, onHitCallback) {
        
        
        if (this.sprite.anims && this.scene.anims.exists('heroi_attack')) {
            this.sprite.play('heroi_attack');
            
            
            this.sprite.once('animationcomplete', () => {
                this.sprite.play('heroi_idle');
            });
        }

        
        const originalX = this.x;
        
        
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