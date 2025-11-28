import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";

export class Title extends Phaser.Scene {
    
    constructor() {
        super('Title');
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        const title = this.add.image(width / 2, height / 3, 'title');
        title.setDisplaySize(width / 2, height / 2);
        
        new Button(this, 640, 500, "INICIAR", 170, 75, () => {
            this.scene.start('Login');
        });
      
    }

}