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

// window (global) functions
import('./utils/globalHelpers.js');

/* FIT
const config = {
    type: Phaser.AUTO,
    parent: 'main',
    scene: [ 
        BootScene,
        CreationScene,
        ConversationScene
    ],
    width: 360,
    height: 640,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
*/

/* RESIZE
const config = {
    type: Phaser.AUTO,

    parent: 'main',

    scene: [
        BootScene,
        CreationScene,
        ConversationScene
    ],

    width: 360,
    height: 640,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

*/

const config = {
    parent: 'main',
    type: Phaser.AUTO,
    scene: [ 
        BootScene,
        CreationScene,
        ConversationScene
    ],
    scale: {
        mode: Phaser.Scale.FIT, // FIT is good for preserving aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game
        width: 1200,
        height: 1800
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