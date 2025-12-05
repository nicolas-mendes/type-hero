export class Button extends Phaser.GameObjects.Container {

    /**
     * Cria um componente novo de botão.
     * @param {Phaser.Scene} scene - A cena onde o botão será criado
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {string} text - O texto a ser exibido
     * @param {number} width - Largura final
     * @param {number} height - Altura final
     * @param {function} callback - Função disparada ao clicar
     * @param {number} backgroundColor - (Opcional) Cor Hex. Padrão: 0xffffff (Branco)
     * @param {number} fontSize - (Opcional) Tamanho da fonte em pixels. Padrão: 22
     */
    constructor(scene, x, y, text, width, height, callback, backgroundColor = 0xffffff, fontSize = 22) {
        super(scene, x, y);
        this.scene = scene;
        this.callback = callback;
        this.baseColor = backgroundColor;

        this.background = scene.add.nineslice(
            0, 0,
            'button_bg',
            0,
            width,
            height,
            20, 20, 15, 15
        );
        this.background.setOrigin(0.5);
        this.background.setTint(this.baseColor);
        this.add(this.background);

        const textOffsetY = -2;

        this.textObject = scene.add.text(0, textOffsetY, text, {
            fontFamily: '"Tektur", monospace',
            fontSize: `${fontSize}px`,
            color: '#fff',
            align: 'center',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.textObject.setOrigin(0.5);
        this.add(this.textObject);

        this.setSize(width, height);
        this.setInteractive({ useHandCursor: true });

        this.on('pointerover', () => {
            this.background.setAlpha(0.8);
        });

        this.on('pointerout', () => {
            this.background.setAlpha(1);
            this.background.setTint(this.baseColor);
        });

        this.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    if (this.callback) this.callback();
                }
            });
        });

        scene.add.existing(this);
    }
}