export class Enemy extends Phaser.GameObjects.Container {

    constructor(scene, x, y, data) {
        super(scene, x, y);
        this.scene = scene;

        // Dados do Banco (level_enemies)
        this.name = data.name;
        this.maxHp = data.maxHp;
        this.currentHp = data.currentHp;
        this.damageValue = data.damage;
        this.enemyAttackWord = data.enemyAttackWord;
        this.enemyAttackTime = data.enemyAttackTime;

        // --- VISUAL ---

        // 1. Sprite
        // Verifica se a chave existe, senão usa placeholder
        const key = scene.textures.exists(data.sprite) ? data.sprite : 'mob_slime'; // Fallback
        this.sprite = scene.add.sprite(0, 0, key);

        // Ajuste de escala se o sprite for muito grande/pequeno
        if (this.sprite.width > 128) this.sprite.setScale(0.8);

        this.add(this.sprite);

        // 2. Nome e HP
        this.txtName = scene.add.text(0, -80, this.name.toUpperCase(), {
            fontSize: '16px', color: '#ffaaaa', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.txtName);

        // 3. Barra de HP
        this.hpBarBg = scene.add.rectangle(0, -60, 100, 12, 0x000000);
        this.hpBarFill = scene.add.rectangle(-50, -60, 98, 10, 0xff0000).setOrigin(0, 0.5); // Ancora Esquerda
        this.add([this.hpBarBg, this.hpBarFill]);

        scene.add.existing(this);
    }

    takeDamage(amount) {
        this.currentHp -= amount;

        // Feedback de Dano (Texto flutuante simples)
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

        // Flash Branco
        this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => this.sprite.clearTint());

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
        // Animação de Morte (Fade out e sumir)
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