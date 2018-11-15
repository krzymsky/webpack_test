import 'phaser';

import {GameScene} from './scenes/GameScene';

const config = {
    width: 1024,
    height: 768,
    backgroundColor: '#cabfbf',
    type: Phaser.WEBGL,
    scene: GameScene,
    pixelArt: true,
    physics: {
        default: 'matter',
        matter: {
            gravity: {y: 1},
            debug: false
        }
    }
};

new Phaser.Game(config);
