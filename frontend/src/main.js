import { Preload } from './scenes/Preload.js';
import { Menu } from './scenes/Menu.js';
import { Login } from './scenes/Login.js';
import { Register } from './scenes/Register.js';    


const config = {
    type: Phaser.AUTO,
    title: 'Type Hero',
    description: 'Um jogo de digitação',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    dom: {
        createContainer: true
    },
    scene: [
        Preload,
        Menu,
        Login,
        Register
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            