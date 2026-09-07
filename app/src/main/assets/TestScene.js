export default class TestScene extends Phaser.Scene {

    constructor() {
        super("TestScene");
    }

    create() {

        const { width, height } = this.scale;

        this.add.text(
            width / 2,
            height / 2 - 50,
            "Phaser Works!",
            {
                fontFamily: "Arial",
                fontSize: "48px",
                color: "#ffffff"
            }
        ).setOrigin(0.5);

        const button = this.add.text(
            width / 2,
            height / 2 + 50,
            "CLICK ME",
            {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#00ff00",
                backgroundColor: "#222222",
                padding: {
                    left: 20,
                    right: 20,
                    top: 10,
                    bottom: 10
                }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        button.on("pointerdown", () => {

            button.setText("PHASER INPUT WORKS!");

            console.log("Phaser pointerdown works!");
        });
    }
}