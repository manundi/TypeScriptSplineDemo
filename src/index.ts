import 'pixi-spine' // Do this once at the very start of your code. This registers the loader!
import * as PIXI from 'pixi.js'
import { Spine } from 'pixi-spine'
import { Text, Container } from 'pixi.js'
 
type Vector2 ={
    x: number,
    y: number
}

type CharacterSettings = {
    name : string,
    scale : number,
    speed : number,

}

const screenSize : Vector2 = {x:window.innerWidth, y:window.innerHeight}

//we have an a character, we will call it player
const playerSettings : CharacterSettings = {
    name: 'Captain Cosmic',
    scale: 0.3,
    speed: 1
}


// define basic settings of html canvas. Sizer bg color etc.
const game = new PIXI.Application<HTMLCanvasElement>({
    width: screenSize.x,
    height: screenSize.y,
    backgroundColor: 'pink',
});

// attach the game (pixi app) to the html document element called body
document.body.appendChild(game.view)

PIXI.Assets.load('/assets/animation/spineboy-pro.json').then((resource) => {
    //console.log('Loaded spineboy: ', resource)
    const playerTransform = new Container()
	const animation = new Spine(resource.spineData);
    const charNamePlate = new Text(playerSettings.name)
    charNamePlate.setTransform(-150,1,2,2)
    charNamePlate.setParent(playerTransform)
    animation.setParent(playerTransform)

    game.stage.addChild(playerTransform);
    
    // lets move the newly created animation to center of the screen

    playerTransform.setTransform(
        screenSize.x /2,
        screenSize.y/2 + animation.height*playerSettings.scale/2,
        playerSettings.scale*1,playerSettings.scale*1
    )
    

    
    if (animation.state.hasAnimation('run')) {
        animation.state.setAnimation(0, 'run', true);
        animation.state.timeScale = 0.1;
        animation.autoUpdate = true;
    }
});




