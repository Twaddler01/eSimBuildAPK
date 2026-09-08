import BootScene from './scenes/BootScene.js';
import CreationScene from './scenes/CreationScene.js';
import ConversationScene from './scenes/ConversationScene.js';

/*
import { DEBUG } from './config.js';
if (DEBUG) {
    import('./debug/debug.js'); // logExport, htmlExport
    import('./debug/zoom.js'); // zoom
}
*/

const GAME_WIDTH = 800; // 600 / 1200

const aspectRatio = window.innerHeight / window.innerWidth;
const GAME_HEIGHT = Math.round(GAME_WIDTH * aspectRatio);

const config = {
    parent: 'main',
    type: Phaser.AUTO,
    scene: [
        BootScene,
        CreationScene,
        ConversationScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    }
};

const game = new Phaser.Game(config);

/*
setTimeout(() => {
console.log("innerWidth:" + window.innerWidth);
console.log("innerHeight:" + window.innerHeight);
console.log("devicePixelRatio:" + window.devicePixelRatio);
console.log("screen width:" + screen.width);
console.log('screen.height:' + screen.height);
console.log("visualViewport width:" + window.visualViewport?.width);
console.log('visualViewport height:' + window.visualViewport?.height);

console.log("documentW:" + document.documentElement.clientWidth);
console.log("documentH:" + document.documentElement.clientHeight);
console.log("mainW:" + document.getElementById("main").clientWidth);
console.log("mainH" + document.getElementById("main").clientHeight);

}, 1000);
*/