export class Window extends Phaser.GameObjects.Container {

    /**
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} title 
     * @param {string} [description] 
     * @param {object} [config] - Configurações opcionais de estilo e layout
     * @param {number} [config.titleMargin=80] - Espaço entre o título e o texto
     * @param {string} [config.fontFamily='"JetBrains Mono", sans-serif'] - Fonte do texto
     * @param {string} [config.fontSize='18px'] - Tamanho da fonte do texto
     */
    constructor(scene, x, y, width, height, title, description = null, config = {}) {
        super(scene, x, y);
        this.scene = scene;

        const titleMargin = config.titleMargin !== undefined ? config.titleMargin : 80;
        const textFontFamily = config.fontFamily || '"JetBrains Mono", sans-serif';
        const textFontSize = config.fontSize || '18px';

        const topPadding = 30;
        const footerHeight = 70;
        const sidePadding = 40;

        const bgTexture = scene.textures.exists('window_bg') ? 'window_bg' : 'button_bg';
        this.background = scene.add.nineslice(0, 0, bgTexture, 0, width, height, 40, 40, 40, 40);
        this.add(this.background);

        const titleY = -height / 2 + topPadding;

        this.titleText = scene.add.text(0, titleY, title.toUpperCase(), {
            fontFamily: "Orbitron",
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
        }).setOrigin(0.5, 0);

        this.add(this.titleText);

        if (description) {
            const contentTop = titleY + this.titleText.height + titleMargin;
            const contentBottom = height / 2 - footerHeight;
            const availableHeight = contentBottom - contentTop;
            const contentCenterY = contentTop + (availableHeight / 2);

            this.descText = scene.add.text(0, contentCenterY, description, {
                fontFamily: textFontFamily,
                fontSize: textFontSize,
                color: '#ffffff',
                align: 'center',
                wordWrap: {
                    width: width - (sidePadding * 2),
                    useAdvancedWrap: true
                }
            }).setOrigin(0.5);

            if (this.descText.height > availableHeight) {
                const currentSizeNum = parseInt(textFontSize);
                this.descText.setFontSize(Math.max(12, currentSizeNum - 4));

                if (this.descText.height > availableHeight) {
                    console.warn("Texto da janela muito longo para o espaço disponível.");
                }
            }

            this.add(this.descText);
        }

        this.setSize(width, height);
        scene.add.existing(this);
    }

    addContent(gameObject) {
        this.add(gameObject);
    }
}