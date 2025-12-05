import { Preload } from './scenes/Preload.js';
import { Title } from './scenes/Title.js';
import { Login } from './scenes/Login.js';
import { Register } from './scenes/Register.js';    
import { MainMenu } from './scenes/MainMenu.js';    
import { Leagues } from './scenes/Leagues.js';
import { WorldSelect } from './scenes/WorldSelect.js';
import { SelectLeague } from './scenes/selectLeague.js';
import { GameScene } from './scenes/GameScene.js';


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
        Title,
        Login,
        Register,
        MainMenu,
        Leagues,
        SelectLeague,
        WorldSelect,
        GameScene,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);

window.gameIsActive = false;

// Previne atualizar a página e perder a sessão ativa
window.addEventListener('beforeunload', function (e) {
    if (window.gameIsActive) {
        e.preventDefault(); 
    }
});

// Bloquea o comando "CTRL+R", que não é coberto pelo parâmetro 'beforeunload'
window.addEventListener('keydown', function (e) {
    if (window.gameIsActive) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
            e.preventDefault();
            console.log("Ctrl+R bloqueado pelo jogo.");
        }
    }
});