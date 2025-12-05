export class Preload extends Phaser.Scene {

    constructor() {
        super('Preload');
    }

    preload() {

        // Imagens do Sistema
        this.load.image('background', 'assets/ui/bg.png');
        this.load.image('title', 'assets/ui/title.png');
        this.load.image('button_bg', 'assets/ui/button_bg.png');
        this.load.image('window_bg', 'assets/ui/window_bg.png');

        // HTML Templates
        this.load.html('form_login', 'assets/html/login.html');
        this.load.html('form_register', 'assets/html/register.html');
        this.load.html('form_createLeague', 'assets/html/createLeague.html');
        this.load.html('table_listLeague', 'assets/html/listLeague.html');
        this.load.html('table_infoLeague', 'assets/html/infoLeague.html');
        this.load.html('admin_panel', 'assets/html/adminPanel.html');

    }

    create() {

        this.add.text(0, 0, "Carregando Fonte...", {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '1px'
        }).setAlpha(0);

        this.scene.start('Title');
    }
}