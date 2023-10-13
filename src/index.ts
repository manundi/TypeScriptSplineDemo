import * as PIXI from 'pixi.js'
import { Spine } from '@pixi-spine/runtime-4.0'
import 'spineboy-pro.json' 

// define basic settings of html canvas. Sizer bg color etc.
const game = new PIXI.Application<HTMLCanvasElement>({
    width: 1920,
    height: 1080,
    backgroundColor: 'pink',
});

// attach the game (pixi app) to the html document element called bodyds
document.body.appendChild(game.view)
console.log('__dirname: ', __dirname)

PIXI.Assets.load('/assets/animation/spineboy-pro.json').then((resource) => {
    console.log('Loaded spineboy')
	const animation = new Spine(resource.spineData);
    game.stage.addChild(animation);

    // add the animation to the scene and renderd...d
    game.stage.addChild(animation);
    
    if (animation.state.hasAnimation('run')) {
        animation.state.setAnimation(0, 'run', true);
        animation.state.timeScale = 0.1;
        animation.autoUpdate = true;
    }
});


