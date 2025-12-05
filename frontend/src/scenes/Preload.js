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
        this.load.image('avatar_player', 'assets/ui/avatar_player.png');
        this.load.image('avatar_leagues', 'assets/ui/avatar_leagues.png');
        this.load.image('avatar_play', 'assets/ui/avatar_play.png');

        // HTML Templates
        this.load.html('form_login', 'assets/html/login.html');
        this.load.html('form_register', 'assets/html/register.html');
        this.load.html('form_createLeague', 'assets/html/createLeague.html');
        this.load.html('table_listLeague', 'assets/html/listLeague.html');
        this.load.html('table_infoLeague', 'assets/html/infoLeague.html');
        this.load.html('admin_panel', 'assets/html/adminPanel.html');

        this.load.aseprite("mob_oblin", "assets/worlds/characters/Goblin1/goblin_idle.png","assets/worlds/characters/Goblin1/goblin_idle.json");
        this.load.aseprite('goblin_attack', 'assets/worlds/characters/Goblin1/goblin_at.png', 'assets/worlds/characters/Goblin1/goblin_at.json');
        this.load.aseprite('goblin_hit', 'assets/worlds/characters/Goblin1/goblin_dn.png', 'assets/worlds/characters/Goblin1/goblin_dn.json');

        this.load.aseprite("heroi","assets/worlds/characters/Hero/heroi_defesa.png","assets/worlds/characters/Hero/heroi_defesa.json");

        this.load.aseprite('paladino_idle', 'assets/worlds/characters/Paladino/paladino_st.png', 'assets/worlds/characters/Paladino/paladino_st.json');
        this.load.aseprite('paladino_attack', 'assets/worlds/characters/Paladino/paladino_at.png', 'assets/worlds/characters/Paladino/paladino_at.json');
        this.load.aseprite('paladino_hit', 'assets/worlds/characters/Paladino/paladino_dn.png', 'assets/worlds/characters/Paladino/paladino_dn.json');



        this.load.aseprite('goblin2_idle', 'assets/worlds/characters/Goblin2/goblin2_st.png', 'assets/worlds/characters/Goblin2/goblin2_st.json');
        this.load.aseprite('goblin2_attack', 'assets/worlds/characters/Goblin2/goblin2_at.png', 'assets/worlds/characters/Goblin2/goblin2_at.json');
        this.load.aseprite('goblin2_hit', 'assets/worlds/characters/Goblin2/goblin2_dn.png', 'assets/worlds/characters/Goblin2/goblin2_dn.json');
    }

    create() {

        const font1 = this.add.text(0, 0, "A", { fontFamily: '"JetBrains Mono"' }).setAlpha(0);
        const font2 = this.add.text(0, 0, "B", { fontFamily: '"Silkscreen"' }).setAlpha(0);
        const font3 = this.add.text(0, 0, "B", { fontFamily: '"Orbitron"' }).setAlpha(0);

        document.fonts.ready.then(() => {

            console.log("Fontes carregadas com sucesso!");
            font1.destroy();
            font2.destroy();
            font3.destroy();
            this.scene.start('Title');

        }).catch((err) => {
            console.error("Erro ao carregar fontes:", err);
            this.scene.start('Title');
        });
    }
}