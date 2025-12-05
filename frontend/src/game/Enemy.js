export class Enemy extends Phaser.GameObjects.Container {

    constructor(scene, x, y, data) {
        super(scene, x, y);
        this.scene = scene;

        // Dados do Banco
        this.name = data.name;
        this.maxHp = data.maxHp;
        this.currentHp = data.currentHp;
        this.damageValue = data.damage;
        this.enemyAttackWord = data.enemyAttackWord;
        this.enemyAttackTime = data.enemyAttackTime;

        // --- VISUAL ---

        // 1. Define as chaves de animação
        this.spriteKey = data.sprite; // Ex: "goblin"
        const idleAnim = this.spriteKey + '_idle'; // Ex: "goblin_idle"

        // Verifica se a animação existe, senão usa um fallback (mob_slime ou quadrado branco)
        // Nota: startKey deve ser a string da animação, não undefined
        const startKey = scene.anims.exists(idleAnim) ? idleAnim : 'mob_slime';

        // 2. Cria o Sprite usando a chave correta
        this.sprite = scene.add.sprite(0, 0, startKey);

        // 3. DA O PLAY NA ANIMAÇÃO (Crucial!)
        if (scene.anims.exists(startKey)) {
            this.sprite.play(startKey);
        }

        // Ajuste de escala
        if (this.sprite.width > 128) this.sprite.setScale(0.8);

        this.add(this.sprite);

        // 4. Nome e HP
        this.txtName = scene.add.text(0, -80, this.name.toUpperCase(), {
            fontSize: '16px', color: '#ffaaaa', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.txtName);

        // 5. Barra de HP
        this.hpBarBg = scene.add.rectangle(0, -60, 100, 12, 0x000000);
        this.hpBarFill = scene.add.rectangle(-50, -60, 98, 10, 0xff0000).setOrigin(0, 0.5);
        this.add([this.hpBarBg, this.hpBarFill]);

        scene.add.existing(this);
    }

    // Chamado quando o inimigo ataca o player
    playAttack(onComplete) {
        const attackKey = this.spriteKey + '_attack';

        if (this.scene.anims.exists(attackKey)) {
            this.sprite.play(attackKey);
            
            // Quando a animação de ataque acabar, volta para idle
            this.sprite.once('animationcomplete', () => {
                this.sprite.play(this.spriteKey + '_idle');
                if (onComplete) onComplete();
            });
        } else {
            // Se não tiver animação, executa o callback imediatamente
            if (onComplete) onComplete();
        }
    }

    takeDamage(amount) {
        this.currentHp -= amount;

        // 1. Feedback Visual de Dano (Texto)
        const dmgText = this.scene.add.text(this.x, this.y - 50, `-${amount}`, {
            fontSize: '32px', color: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: dmgText,
            y: this.y - 100,
            alpha: 0,
            duration: 800,
            onComplete: () => dmgText.destroy()
        });

        // 2. Animação de "Hit" (Apanhando)
        const hitKey = this.spriteKey + '_hit';
        if (this.scene.anims.exists(hitKey)) {
            this.sprite.play(hitKey);
            // Volta para idle depois de apanhar
            this.sprite.once('animationcomplete', () => {
                // Só volta pro idle se ainda estiver vivo
                if (this.currentHp > 0) {
                    this.sprite.play(this.spriteKey + '_idle');
                }
            });
        } else {
            // Fallback: Pisca Branco se não tiver animação de hit
            this.sprite.setTint(0xffffff);
            this.scene.time.delayedCall(100, () => this.sprite.clearTint());
        }

        this.updateHpBar();

        if (this.currentHp <= 0) {
            this.die();
            return true; // Morreu
        }
        return false; // Vivo
    }

    updateHpBar() {
        const pct = Math.max(0, this.currentHp / this.maxHp);
        this.hpBarFill.scaleX = pct;
    }

    die() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 300,
            onComplete: () => this.destroy()
        });
    }
}