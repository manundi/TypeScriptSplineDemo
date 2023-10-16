import 'pixi-spine' // Do this once at the very start of your code. This registers the loader!
import * as PIXI from 'pixi.js'
import { Spine } from 'pixi-spine'
import { Text, Container } from 'pixi.js'

type Vector2 = {
    x: number,
    y: number
}

type CharacterSettings = {
    name: string,
    scale: number,
    speed: number,
}

const screenSize: Vector2 = { x: window.innerWidth, y: window.innerHeight }

//we have an a character, we will call it player
const playerSettings: CharacterSettings = {
    name: 'Captain Cosmic',
    scale: 0.3,
    speed: 2
}


const playerTransform = new Container()
const playerNamePlate = new Text(playerSettings.name)
let animation: any
let gameHasStarted = false


let userInput = {
    isInput: false,
    x: 0,
    y: 0
}

let player = {
    transform: playerTransform,
    animation: animation,
    namePlate: playerNamePlate,
    velocity: 1,
}

type BgLayers = {
    sky? : PIXI.Sprite,
    mountains? : PIXI.Sprite,
    trees? : PIXI.Sprite,
    trees2? : PIXI.Sprite,
    front? : PIXI.Sprite
}
let bgLayers : BgLayers = {
    sky:null,
    mountains:null,
    trees: null,
    trees2: null,
    front: null
}

// define basic settings of html canvas. Sizer bg color etc.
const game = new PIXI.Application<any>({
    width: screenSize.x,
    height: screenSize.y,
    backgroundColor: 'white',
});

// attach the game (pixi app) to the html document element called body
document.body.appendChild(game.view)

PIXI.Assets.load('/assets/Arrow_keys.jpg').then((resource) => {
    const keyboardInstructions = new PIXI.Sprite(resource)
    keyboardInstructions.setTransform(screenSize.x/2 -50,50,0.3,0.3)
    game.stage.addChild(keyboardInstructions);
})

PIXI.Assets.load('/assets/Trees.png').then((resource) => {

    bgLayers.trees = new PIXI.Sprite(resource)
    bgLayers.trees2 = new PIXI.Sprite(resource)
    let width = screenSize.x/resource.width
    let height = screenSize.y / resource.height

    bgLayers.trees.setTransform(0,0,width,height)
    bgLayers.trees2.setTransform(bgLayers.trees.width,0,width,height)
    game.stage.addChild( bgLayers.trees);
    game.stage.setChildIndex(bgLayers.trees,0)
    game.stage.addChild( bgLayers.trees2);
    game.stage.setChildIndex(bgLayers.trees2,0)
})


PIXI.Assets.load('/assets/animation/spineboy-pro.json').then((resource) => {
    //console.log('Loaded spineboy: ', resource)

    animation = new Spine(resource.spineData);
    playerNamePlate.setTransform(-250, 1, 3, 3)
    playerNamePlate.setParent(playerTransform)
    animation.setParent(playerTransform)

    game.stage.addChild(playerTransform);

    // lets move the newly created animation to center of the screen

    playerTransform.setTransform(
        screenSize.x / 2,
        screenSize.y  -100,
        playerSettings.scale * 1, playerSettings.scale * 1
    )

    if (animation.state.hasAnimation('run')) {
        animation.state.setAnimation(0, 'run', true);
        animation.state.timeScale = 0.1 * playerSettings.speed;
        animation.autoUpdate = true;
    }
});

const GameLoop = () => {
    //initial animation /movement when user did not yet take control
    if (gameHasStarted) {
        if (userInput.isInput) {
            
        } else {
            player.velocity = Lerp(player.velocity, 0, 0.03)
        }

        animation.state.timeScale =  0.1 *  Math.abs(player.velocity)
        playerTransform.position.set(
        playerTransform.position.x + player.velocity,
        playerTransform.position.y)
        bgLayers.trees.x -= player.velocity
        bgLayers.trees2.x -= player.velocity
      
      
        // If the first background has moved completely off screen, reposition it to the end
        if (bgLayers.trees.x + bgLayers.trees.width <= 0) {
            bgLayers.trees.x = bgLayers.trees2.x + bgLayers.trees2.width;
        }

        // Similarly, if the second background has moved off screen, reposition it to the end
        if (bgLayers.trees2.x + bgLayers.trees2.width <= 0) {
            bgLayers.trees2.x = bgLayers.trees.x + bgLayers.trees.width;
        }
    }
    if (playerTransform.x > screenSize.x + playerTransform.width / 2) {
        playerTransform.x = -playerTransform.width / 2;
    }
    if (playerTransform.x < -100 ) {
        playerTransform.x = screenSize.x +20
    }
    
    //TODO: Fix moving to idle when playervelocity is near 0
    //if(animation?.state.timeScale  <0.1) animation.state.setAnimation(0, 'run-to-idle', false)
    
    
    

}

game.ticker.add(GameLoop)
game.ticker.start()

const Lerp = (a: number, b: number, t: number) => {
    let result = (1 - t) * a + t * b;
    //threshold to stop compute if close to target
    if (Math.abs(result - b) < 0.1) {
        return 0;
    }
    return result;
}


document.addEventListener('keydown', (e) => {


    userInput.isInput = true
    //TODO: this does not need to set everytime, how to prevent?
    gameHasStarted = true
    switch (e.key) {
        case 'ArrowRight':
        case 'd':
            player.velocity = playerSettings.speed
            animation.scale.x = 1

            break;

        case 'ArrowLeft':
        case 'a':
            player.velocity = -playerSettings.speed
            animation.scale.x = -1

            break;

        default:
            break;
    }
 
});

document.addEventListener('keyup', (e) => {
    userInput.isInput = false
});






