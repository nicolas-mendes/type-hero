export class Button extends Phaser.GameObjects.Container {

    /**
     * Cria um botão estilo Sci-Fi usando 9-Slice scaling.
     * * @param {Phaser.Scene} scene - A cena onde o botão será criado
     * @param {number} x - Posição X (Centro do botão)
     * @param {number} y - Posição Y (Centro do botão)
     * @param {string} text - O texto a ser exibido
     * @param {number} width - Largura final do botão (ex: 200, 300)
     * @param {number} height - Altura final do botão (ex: 60, 80)
     * @param {function} callback - Função disparada ao clicar
     */
    constructor(scene, x, y, text, width, height, callback) {
        super(scene, x, y);
        this.scene = scene;
        this.callback = callback;

        this.background = scene.add.nineslice(
            0, 0, 
            'button_bg', 
            0, 
            width, 
            height, 
            25, 25, 15, 15
        );
        this.background.setOrigin(0.5);
        this.add(this.background);

        this.textObject = scene.add.text(0, 0, text, {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            color: '#fff',
            align: 'center',
            fontStyle: 'bold'
        });
        this.textObject.setOrigin(0.5);
        
        
        this.textObject.setShadow(2, 2, '#000000', 2, true, true);
        
        this.add(this.textObject);

        
        this.setSize(width, height);
        
        this.setInteractive({ useHandCursor: true });

        
        this.on('pointerover', () => { 
            this.textObject.setScale(1.05);
        });

        
        this.on('pointerout', () => {
            this.background.clearTint();
            this.textObject.setScale(1);
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
            
            // this.scene.sound.play('click_sound');

        });

        scene.add.existing(this);
    }
}