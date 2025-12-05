export class Enemy extends Phaser.GameObjects.Container {

    constructor(scene, x, y, data) {
        super(scene, x, y);
        this.scene = scene;

        this.name = data.name;
        this.maxHp = data.maxHp;
        this.currentHp = data.currentHp;
        this.damageValue = data.damage;
        this.enemyAttackWord = data.enemyAttackWord;
        this.enemyAttackTime = data.enemyAttackTime;


        const key = scene.textures.exists(data.sprite) ? data.sprite : 'mob_slime';
        this.sprite = scene.add.sprite(0, 0, key);

        if (this.sprite.width > 128) this.sprite.setScale(0.8);

        this.add(this.sprite);

        this.txtName = scene.add.text(0, -80, this.name.toUpperCase(), {
            fontSize: '16px', color: '#ffaaaa', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.txtName);


        this.hpBarBg = scene.add.rectangle(0, -60, 100, 12, 0x000000);
        this.hpBarFill = scene.add.rectangle(-50, -60, 98, 10, 0xff0000).setOrigin(0, 0.5);
        this.add([this.hpBarBg, this.hpBarFill]);

        scene.add.existing(this);
    }

    takeDamage(amount) {
        this.currentHp -= amount;

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

        this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => this.sprite.clearTint());

        this.updateHpBar();

        if (this.currentHp <= 0) {
            this.die();
            return true;
        }
        return false;
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