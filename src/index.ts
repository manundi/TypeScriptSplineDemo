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
    sky?: PIXI.Sprite[],
    mountains?: PIXI.Sprite[],
    trees?: PIXI.Sprite[],
    ground?: PIXI.Sprite[],
    front?: PIXI.Sprite[]
}
let bgLayers: BgLayers = {
    sky: [null, null],
    mountains: [null, null],
    trees: [null, null],
    ground: [null, null],
    front: [null, null],
}

// define basic settings of html canvas. Sizer bg color etc.
const game = new PIXI.Application<any>({
    width: screenSize.x,
    height: screenSize.y,
    backgroundColor: 'white',
});

// attach the game (pixi app) to the html document element called body
document.body.appendChild(game.view)

const AddSprite = (path: string, sprite1: PIXI.Sprite, sprite2: PIXI.Sprite): Promise<void> => {
    return PIXI.Assets.load(path).then((resource) => {
        let width = screenSize.x / resource.width
        let height = screenSize.y / resource.height

        sprite1 = new PIXI.Sprite(resource)
        sprite2 = new PIXI.Sprite(resource)

        sprite1.setTransform(0, 0, width, height);
        sprite2.setTransform(sprite1.width, 0, width, height);
        game.stage.addChild(sprite1, sprite2);
    })
}
const spriteloaders = [
    AddSprite('/assets/Sky.png', bgLayers.sky[0], bgLayers.sky[1]),
    AddSprite('/assets/Mountains.png', bgLayers.mountains[0], bgLayers.mountains[1]),
    AddSprite('/assets/Trees.png', bgLayers.trees[0], bgLayers.trees[1]),
    AddSprite('/assets/Ground.png', bgLayers.ground[0], bgLayers.ground[1]),
    AddSprite('/assets/ForeGround.png', bgLayers.front[0], bgLayers.front[1]),

];

//TODO: fix layer order
Promise.all(spriteloaders).then(() => {
    // console.log('kek1')
    // game.stage.setChildIndex(bgLayers.sky[0],0)
    // console.log('kek')
    // game.stage.setChildIndex(bgLayers.ground[0],1)
    // console.log('kek2')
    // bgLayers.sky.forEach(item => game.stage.setChildIndex(item, 0))
    // bgLayers.mountains.forEach(item => game.stage.setChildIndex(item, 1))
    // bgLayers.trees.forEach(item => game.stage.setChildIndex(item, 2))
    // bgLayers.ground.forEach(item => game.stage.setChildIndex(item, 3))
    // bgLayers.front.forEach(item => game.stage.setChildIndex(item, 4))
    console.log('All sprites have been added!');
    PIXI.Assets.load('/assets/animation/spineboy-pro.json').then((resource) => {
        animation = new Spine(resource.spineData);
        playerNamePlate.setTransform(-250, 1, 3, 3)
        playerNamePlate.setParent(playerTransform)
        playerNamePlate.style.fill = '#FFF'
        playerNamePlate.style.dropShadow = true
        playerNamePlate.style.fontWeight = 'bold'
        animation.setParent(playerTransform)
        game.stage.addChild(playerTransform);
        game.stage.setChildIndex(playerTransform,4)

        // lets move the newly created animation to center of the screen

        playerTransform.setTransform(
            screenSize.x / 2,
            screenSize.y - 100,
            playerSettings.scale * 1, playerSettings.scale * 1
        )

        if (animation.state.hasAnimation('run')) {
            animation.state.setAnimation(0, 'run', true);
            animation.state.timeScale = 0.1 * playerSettings.speed;
            animation.autoUpdate = true;
        }
        console.log('Loaded spineboy: ')
    });

}).catch((error) => {
    console.error('An error occurred:', error);
});



PIXI.Assets.load('/assets/Arrow_keys.jpg').then((resource) => {
    const keyboardInstructions = new PIXI.Sprite(resource)
    keyboardInstructions.setTransform(screenSize.x / 2 - 50, 50, 0.3, 0.3)
    game.stage.addChild(keyboardInstructions);
})

// PIXI.Assets.load('/assets/Trees.png').then((resource) => {

//     bgLayers.ground = new PIXI.Sprite(resource)
//     let width = screenSize.x/resource.width
//     let height = screenSize.y / resource.height

//     bgLayers.ground.setTransform(0,0,width,height)
//     game.stage.addChild( bgLayers.ground);


//     PIXI.Assets.load('/assets/Trees.png').then((resource) => {

//         bgLayers.trees = new PIXI.Sprite(resource)
//         bgLayers.trees2 = new PIXI.Sprite(resource)
//         let width = screenSize.x/resource.width
//         let height = screenSize.y / resource.height

//         bgLayers.trees.setTransform(0,0,width,height)
//         bgLayers.trees2.setTransform(bgLayers.trees.width,0,width,height)
//         game.stage.addChild( bgLayers.trees);
//         game.stage.setChildIndex(bgLayers.trees,0)
//         game.stage.addChild( bgLayers.trees2);
//         game.stage.setChildIndex(bgLayers.trees2,0)

//         PIXI.Assets.load('/assets/Sky.png').then((resource) => {

//             bgLayers.sky = new PIXI.Sprite(resource)
//             let width = screenSize.x/resource.width
//             let height = screenSize.y / resource.height

//             bgLayers.sky.setTransform(0,0,width,height)
//             game.stage.addChild( bgLayers.sky);
//             game.stage.setChildIndex(bgLayers.sky,0)
//         })
//     })
// })



const GameLoop = () => {
    //initial animation /movement when user did not yet take control
    if (gameHasStarted) {
        if (userInput.isInput) {

        } else {
            player.velocity = Lerp(player.velocity, 0, 0.03)
        }

        animation.state.timeScale = 0.1 * Math.abs(player.velocity)
        playerTransform.position.set(
            playerTransform.position.x + player.velocity,
            playerTransform.position.y)
        bgLayers.trees[0].x -= player.velocity
        bgLayers.trees[1].x -= player.velocity

        const RepeatLayers = (spites: PIXI.Sprite[]): void => {
            // If the first background has moved completely off screen, reposition it to the end
            if (spites[0].x + spites[0].width <= 0) {
                spites[0].x = spites[1].x + spites[1].width;
            }
            // Similarly, if the second background has moved off screen, reposition it to the end
            if (spites[1].x + spites[1].width <= 0) {
                spites[1].x = spites[0].x + spites[0].width;
            }
        }
        Object.entries(bgLayers).forEach(([key, value]) => {
            RepeatLayers(value)
        });

    }
    if (playerTransform.x > screenSize.x + playerTransform.width / 2) {
        playerTransform.x = -playerTransform.width / 2;
    }
    if (playerTransform.x < -100) {
        playerTransform.x = screenSize.x + 20
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






