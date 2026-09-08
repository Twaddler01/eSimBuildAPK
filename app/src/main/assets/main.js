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


const MAX_WIDTH = 1280;
const MAX_HEIGHT = 1920;
const HEIGHT_RATIO = 3 / 2;

function getGameSize() {

    const width = Math.min(
        window.innerWidth,
        MAX_WIDTH
    );

    const height = Math.min(
        window.innerHeight,
        width * HEIGHT_RATIO
    );

    return {
        width,
        height
    };
}

const { width, height } = getGameSize();

const config = {

    type: Phaser.AUTO,

    parent: 'main',

    scene: [
        BootScene,
        CreationScene,
        ConversationScene
    ],

    scale: {

        mode: Phaser.Scale.FIT,

        autoCenter: Phaser.Scale.CENTER_BOTH,

        width,
        height,

        min: {
            width: 320,
            height: 480
        },

        max: {
            width: MAX_WIDTH,
            height: MAX_HEIGHT
        }
    }
};

const game = new Phaser.Game(config);

setTimeout(() => {
console.log("innerWidth:" + window.innerWidth);
console.log("innerHeight:" + window.innerHeight);
console.log("devicePixelRatio:" + window.devicePixelRatio);
console.log("screen:" + screen.width, screen.height);
console.log("visualViewport:" +
    window.visualViewport?.width,
    + ' ' + window.visualViewport?.height
);
}, 1000);