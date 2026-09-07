import TestScene from './TestScene.js';

document.getElementById("main").innerHTML = `
    <div style="
        color: white;
        font-family: Arial;
        font-size: 30px;
        text-align: center;
        margin-top: 100px;
    ">
        main.js works!  ...3
    </div>
`;

/*
const config = {
    parent: 'main',
    width: 360,
    height: 640,
    type: Phaser.AUTO,
    scene: [ 
        TestScene
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
*/