/// <reference path="../../defs/matter.d.ts" />
/// <reference path="../../defs/matter.d.ts" />

import Bullet from '../objects/Bullet';

export default class Dude {
    constructor(cfg) {
        //super(cfg.scene, cfg.x, cfg.y, cfg.key);
        //cfg.scene.physics.world.enable(this);
        //cfg.scene.add.existing(this);

        this.scene = cfg.scene;
        this.closest_object = null;
        this.holding_object = null;
        this.holding_joint = null;
        this.can_hold = true;
        this.can_hold_timer = null;
        this.playable = cfg.playable;
        this.anim_prefix = cfg.anim_prefix;
        this.can_fire = true;
        this.can_fire_timer = null;

        this.sprite = cfg.scene.matter.add.sprite(cfg.x, cfg.y, 'spritesheet', null);

        //this.anims.load('idle');
        //this.anims.play('idle');
        //this.sprite.anims.play('idle');
        this.sprite.anims.play(this.anim_prefix + 'idle', true);

        this.sprite.setCollisionCategory(this.scene.collision_cat_1);
        this.sprite.setCollidesWith([this.scene.collision_cat_1]);

        this.bullets = this.scene.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });

        this.blocked = {
            left: false,
            right: false,
            bottom: false
        };
        this.numTouching = {
            left: 0,
            right: 0,
            bottom: 0
        };
        this.sensors = {
            bottom: null,
            left: null,
            right: null
        };

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { width: w, height: h } = this.sprite;
        this.collision_body = Bodies.rectangle(0, 0, 14, 18, { chamfer: { radius: 4 }});
        this.sensors.bottom = Bodies.rectangle(0, h*0.50, w * 0.5, 5, { isSensor: true });
        this.sensors.left = Bodies.rectangle(-w * 0.35, 0, 5, h * 0.25, { isSensor: true, label: this.anim_prefix+'LEFT' });
        this.sensors.right = Bodies.rectangle(w * 0.35, 0, 5, h * 0.25, { isSensor: true, label: this.anim_prefix+'RIGHT' });
        const body = Body.create({
            parts: [this.collision_body, this.sensors.bottom, this.sensors.left, this.sensors.right],
            friction: 0.01,
            restitution: 0.05
        });

        this.sprite.setExistingBody(body);
        this.sprite.setPosition(cfg.x, cfg.y);
        this.sprite.setOrigin(0.5, 0.7);
        this.sprite.setFixedRotation();
        this.sprite.setBounce(0.4);

        cfg.scene.matter.world.on('beforeupdate', function (event) {
            this.numTouching.left = 0;
            this.numTouching.right = 0;
            this.numTouching.bottom = 0;
            this.closest_object = null;
        }, this);

        cfg.scene.matter.world.on('collisionactive', function (event)
        {
            var playerBody = this.collision_body;
            var left = this.sensors.left;
            var right = this.sensors.right;
            var bottom = this.sensors.bottom;

            for (var i = 0; i < event.pairs.length; i++)
            {
                var bodyA = event.pairs[i].bodyA;
                var bodyB = event.pairs[i].bodyB;

                if (bodyA === playerBody || bodyB === playerBody)
                {
                    continue;
                }
                else if (bodyA === bottom || bodyB === bottom)
                {
                    // Standing on any surface counts (e.g. jumping off of a non-static crate).
                    this.numTouching.bottom += 1;
                }
                else if ((bodyA === left && bodyB.isStatic) || (bodyB === left && bodyA.isStatic))
                {
                    // Only static objects count since we don't want to be blocked by an object that we
                    // can push around.
                    this.numTouching.left += 1;
                }
                else if ((bodyA === right && bodyB.isStatic) || (bodyB === right && bodyA.isStatic))
                {
                    this.numTouching.right += 1;
                }
                else if ((bodyA === left || bodyB === left) || (bodyA === right || bodyB === right)){
                    if (bodyA.label == 'pickable')
                        this.closest_object = bodyA;
                    if (bodyB.label == 'pickable')
                        this.closest_object = bodyB;
                }
            }
        }, this);

        cfg.scene.matter.world.on('afterupdate', function (event) {
            this.blocked.right = this.numTouching.right > 0 ? true : false;
            this.blocked.left = this.numTouching.left > 0 ? true : false;
            this.blocked.bottom = this.numTouching.bottom > 0 ? true : false;
        }, this);

        this.input_left = cfg.scene.input.keyboard.addKey(cfg.input_left);
        this.input_right = cfg.scene.input.keyboard.addKey(cfg.input_right);
        this.input_jump = cfg.scene.input.keyboard.addKey(cfg.input_jump);
        this.input_action = cfg.scene.input.keyboard.addKey(cfg.input_action);
    }

    update() {
        // Horizontal movement
        //this.sprite.setVelocityX(0);
        if (this.input_left.isDown && !this.blocked.left)
        {
            this.sprite.setVelocityX(-2);
            this.sprite.anims.playReverse(this.anim_prefix + 'run', true);
            this.sprite.setFlipX(false);
        }
        else if (this.input_right.isDown && !this.blocked.right)
        {
            this.sprite.setVelocityX(2);
            this.sprite.anims.playReverse(this.anim_prefix + 'run', true);
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play(this.anim_prefix + 'idle', true);
        }

        // Jumping
        if (this.input_jump.isDown && this.blocked.bottom)
        {
            this.sprite.setVelocityY(-5);
        }

        if (this.input_action.isDown && this.can_fire) {
            let b = this.bullets.get();
            if (b) {
                b.fire(this.sprite.x, this.sprite.y, this.sprite.flipX);
                this.can_fire = false;
                this.can_fire_timer = this.scene.time.addEvent({
                    delay: 250,
                    callback: () => (this.can_fire = true)
                });
            }
        }

        if (false && this.input_action.isDown && this.can_hold)
        {
            if (this.holding_object) {
                //console.log(this.holding_object);
                //console.log(this.holding_joint);
                this.scene.matter.world.removeConstraint(this.holding_joint);
                //this.holding_object.gameObject.setCollidesWith();
                this.holding_object.gameObject.setVelocityX(6 * (this.sprite.flipX ? 1 : -1));
                this.holding_joint = null;
                this.holding_object = null;
            } else {
                this.holding_object = this.closest_object;
                if (this.holding_object) {
                    //console.log(this.holding_object);
                    this.holding_object.gameObject.setFixedRotation();
                    //this.holding_object.gameObject.setCollidesWith([this.scene.collision_cat_2]);
                    //this.holding_object.gameObject.setVelocityY(-4);
                    //this.holding_object.gameObject.setVelocityX(-6 * (this.sprite.flipX ? 1 : -1));
                    
                    //this.holding_object.x = this.sprite.x;
                    //this.holding_object.y = this.sprite.y - 10;
                    //this.holding_object.gameObject.setPosition(this.sprite.x, this.sprite.y-100);
                    //this.holding_object.ignoreGravity = true;
                    var tween = this.scene.tweens.add({
                        targets: this.holding_object.gameObject,
                        x: this.sprite.x,
                        y: this.sprite.y - this.holding_object.gameObject.height,
                        duration: 100,
                        onComplete: () => (this.holding_joint = this.scene.matter.add.constraint(this.sprite, this.holding_object, 0, 1,
                            {pointA:{
                                x:0,
                                y:-this.holding_object.gameObject.height
                            }}))
                    });
                    /*this.holding_joint = this.scene.matter.add.constraint(this.sprite, this.holding_object, 1, 0,
                        {pointA:{
                            x:0,
                            y:-this.holding_object.gameObject.height
                        }});*/
                    console.log(this.holding_object);
                }
            }
            this.can_hold = false;
            this.can_hold_timer = this.scene.time.addEvent({
                delay: 250,
                callback: () => (this.can_hold = true)
            });
        }

        //console.log(this.holding_object);
        /*if (this.holding_object) {
            this.holding_object.position.x = this.sprite.x;
            this.holding_object.position.y = this.sprite.y - this.holding_object.gameObject.height;
            //this.holding_object.isSleeping = true;
        }*/
    }
}
