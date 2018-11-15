const spritesheet_name = 'spritesheet';

export default function generateAnimations(scene) {
    scene.anims.create(setup(scene, 'krzymsky/idle', 0, 1, 4));
    scene.anims.create(setup(scene, 'krzymsky/run', 1, 4, 8));

    scene.anims.create(setup(scene, 'helenka/idle', 10, 11, 4));
    scene.anims.create(setup(scene, 'helenka/run', 11, 14, 8));
}


function setup(scene, key, start, end, frameRate, repeat = -1) {
    return {
        key: key,
        frames: scene.anims.generateFrameNumbers(spritesheet_name, {start: start, end: end}),
        frameRate: frameRate,
        repeat: repeat
    };
}