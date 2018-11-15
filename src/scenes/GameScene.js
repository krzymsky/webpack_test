/// <reference path="../../defs/phaser.d.ts" />
/// <reference path="../../defs/matter.d.ts" />

import generateAnimations from '../GenerateAnimations';
import Dude from '../objects/Dude';
import { timingSafeEqual } from 'crypto';

export class GameScene extends Phaser.Scene {

    preload() {
        this.load.spritesheet('spritesheet', 'assets/spritesheet.png', {frameWidth: 24, frameHeight: 24});
        this.load.tilemapTiledJSON('map', 'assets/room1.json');
        this.load.image('tiles', 'assets/tileset.png');
    }

    create() {
        //this.add.text(100, 100, 'krzymsky rulez', {fill: '#ff0000'});
        generateAnimations(this);
        this.map = this.make.tilemap({key: 'map'});
        this.tileset = this.map.addTilesetImage('tileset', 'tiles');
        this.groundLayer = this.map.createDynamicLayer('Ground', 'tileset', 0, 0);
        this.backgroundLayer = this.map.createStaticLayer('Background', 'tileset', 0, 0);

        this.groundLayer.setCollisionByProperty({collides: true});
        this.matter.world.convertTilemapLayer(this.groundLayer);
        this.matter.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);

        this.collision_cat_1 = this.matter.world.nextCategory();
        this.collision_cat_2 = this.matter.world.nextCategory();

        this.krzymsky = new Dude({
            scene: this,
            x: 100,
            y: 100,
            anim_prefix: 'krzymsky/',
            input_left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            input_right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            input_jump: Phaser.Input.Keyboard.KeyCodes.UP,
            input_action: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        //var a = this.matter.add.constraint(this.sprite, this.closest_object, this.closest_object.width, 1);
        

        this.helenka = new Dude({
            scene: this,
            x: 200,
            y: 100,
            anim_prefix: 'helenka/',
            input_left: Phaser.Input.Keyboard.KeyCodes.A,
            input_right: Phaser.Input.Keyboard.KeyCodes.D,
            input_jump: Phaser.Input.Keyboard.KeyCodes.W
        });

        let box = this.matter.add.sprite(170, 100, 'spritesheet', 20);
        const box_body = Phaser.Physics.Matter.Matter.Bodies.rectangle(0, 0, 16, 16, {label: 'pickable'});
        box.setExistingBody(box_body);
        box.setPosition(170, 100);
        box.setCollisionCategory(this.collision_cat_2);
        box = this.matter.add.sprite(150, 100, 'spritesheet', 21, {label: 'pickable'});

        //this.matter.add.gameObject(this.krzymsky)
        this.cameras.main.zoom = 3;
        //this.cameras.main.startFollow(this.krzymsky.sprite);
        this.cameras.main.centerOn(205,120);
    }

    update() {
        this.krzymsky.update();
        this.helenka.update();
    }
}
