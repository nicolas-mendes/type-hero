export class Window extends Phaser.GameObjects.Container {
    
    constructor(scene, x, y, width, height, title) {
        super(scene, x, y);
        this.scene = scene;
        
        this.background = scene.add.nineslice(0, 0, 'window_bg', 0, width, height, 12, 12, 12, 12);
        this.add(this.background);

        this.header = scene.add.rectangle(0, -height/2 + 25, width - 10, 40, 0x000000, 0.5);
        this.add(this.header);

        this.titleText = scene.add.text(0, -height/2 + 25, title, {
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '22px',
            color: '#e9d080ff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.titleText);

        this.setSize(width, height);
        
        scene.add.existing(this);
    }

    addContent(gameObject) {
        this.add(gameObject);
    }
}