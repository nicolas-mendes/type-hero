export class Player extends Phaser.GameObjects.Container {

    constructor(scene, x, y, stats) {
        super(scene, x, y);
        this.scene = scene;

        // --- ATRIBUTOS (Vindos do Banco/Run) ---
        // stats = { hp: 100, damage: 10, ... }
        this.maxHp = 100; // Padrão ou vindo de stats.maxHp se tiver
        this.currentHp = stats.hp;

        // --- VISUAL ---

        // 1. Sprite do Herói (Placeholder ou Asset)
        // Se tiver spritesheet carregado, usa ele. Se não, usa um retangulo.
        if (scene.textures.exists('hero_idle')) {
            this.sprite = scene.add.sprite(0, 0, 'hero_idle').setScale(2);
            this.sprite.play('hero_anim_idle'); // Supodo que exista animação
        } else {
            this.sprite = scene.add.rectangle(0, 0, 64, 64, 0x00ff00); // Quadrado Verde
        }
        this.add(this.sprite);

        // 2. Barra de Vida (Em cima da cabeça)
        this.hpBarBg = scene.add.rectangle(0, -50, 80, 10, 0x000000);
        this.hpBarFill = scene.add.rectangle(0, -50, 78, 8, 0xff0000); // Vermelho
        this.add([this.hpBarBg, this.hpBarFill]);

        // 3. Texto de Dano (Floating Text Pool)
        // (Pode ser implementado depois)

        this.updateHpBar();

        scene.add.existing(this);
    }

    // Método para receber dano e atualizar visual
    takeDamage(amount) {
        this.currentHp -= amount;
        if (this.currentHp < 0) this.currentHp = 0;

        // VERIFICAÇÃO DE TIPO PARA EFEITO VISUAL
        // Se for um Sprite (tem textura), usa Tint.
        // Se for um Retângulo (placeholder), usa FillStyle.

        if (this.sprite.clearTint) {
            // --- LÓGICA PARA SPRITE (IMAGEM) ---
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                tint: 0xff0000, // Tween de cor funciona em Sprites
                duration: 100,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    this.sprite.clearTint(); // Remove o vermelho
                    this.sprite.setAlpha(1);
                }
            });
        } else {
            // --- LÓGICA PARA RETÂNGULO (PLACEHOLDER) ---
            // Muda a cor manualmente, pois tween de cor em shapes é complexo
            const originalColor = 0x00ff00; // Verde original
            this.sprite.setFillStyle(0xff0000); // Vira Vermelho

            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    this.sprite.setFillStyle(originalColor); // Volta pro Verde
                    this.sprite.setAlpha(1);
                }
            });
        }

        // Balanço da câmera (Impacto)
        this.scene.cameras.main.shake(100, 0.01);

        this.updateHpBar();

        return this.currentHp <= 0; // Retorna TRUE se morreu
    }

    // Animação de Ataque (Avança e volta)
    playAttackAnim(targetX, onHitCallback) {
        const originalX = this.x;

        this.scene.tweens.add({
            targets: this,
            x: originalX + 50, // Avança
            duration: 100,
            yoyo: true,
            onYoyo: () => {
                // No momento que "bate" (metade da animação)
                if (onHitCallback) onHitCallback();
            }
        });
    }

    updateHpBar() {
        // Regra de 3 simples para a barra
        const pct = this.currentHp / this.maxHp;

        // Ajusta a largura (78 é a largura máxima definida no constructor)
        this.hpBarFill.width = 78 * pct;

        // Mantém centralizado ou alinhado à esquerda?
        // Containers centralizam (0.5), então só mudar width funciona visualmente como "encolher pro centro"
        // Se quiser encolher pra esquerda, teria que mudar origin e x.
    }
}