import BootScene from './scenes/BootScene.js';
import CreationScene from './scenes/CreationScene.js';
import ConversationScene from './scenes/ConversationScene.js';

import { DEBUG } from './config.js';
if (DEBUG) {
    import('./debug/debug.js'); // logExport, htmlExport
    import('./debug/zoom.js'); // zoom
}

// window (global) functions
import('./utils/globalHelpers.js');

/*
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

const game = new Phaser.Game(config);

setTimeout(() => {
    console.log('Phaser game...', game);
    console.log('Scale:' + game.scale.width + ' ' + game.scale.height);
    console.log('Canvas:'); // + game.canvas);
    console.log(game.canvas);
    console.log('Canvas size:' + game.canvas?.width + ' ' + game.canvas?.height);
    console.log('Canvas CSS:' + game.canvas?.style.cssText);
}, 1000);