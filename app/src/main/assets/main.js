//import TestScene from './TestScene.js';

document.getElementById("main").innerHTML = `
    <div style="
        color: white;
        background-color: #111111;
        font-family: Arial;
        font-size: 30px;
        text-align: center;
        margin-top: 100px;
    ">
        main.js works!  ...
    </div>
    
    <div style="
        color: black;
        background-color: white;
        font-family: Arial;
        font-size: 30px;
        text-align: center;
        margin-top: 100px;
    ">
        main.js works!  ...
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