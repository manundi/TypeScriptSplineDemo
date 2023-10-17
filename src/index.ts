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

interface PlayerSettings extends CharacterSettings {
    movingEnabled: boolean;
}
//we have an a character, we will call it player
const playerSettings: PlayerSettings = {
    name: 'Captain Cosmic',
    scale: 0.3,
    speed: 2,
    movingEnabled: false,
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

let objectsOnStage : any = []

// define basic settings of html canvas. Sizer bg color etc.
const game = new PIXI.Application<any>({
    width: screenSize.x,
    height: screenSize.y,
    backgroundColor: 'white',
});

// attach the game (pixi app) to the html document element called body
document.body.appendChild(game.view)

const AddSprite = (path: string, sprites: PIXI.Sprite[]): Promise<void> => {
    return PIXI.Assets.load(path).then((resource) => {
        let width = screenSize.x / resource.width
        let height = screenSize.y / resource.height

        const sprite1 = new PIXI.Sprite(resource)
        const sprite2 = new PIXI.Sprite(resource)

        sprite1.setTransform(0, 0, width, height);
        sprite2.setTransform(sprite1.width, 0, width, height);
        sprites[0] = sprite1
        sprites[1] = sprite2 
        objectsOnStage.push(sprite1, sprite2);
    })
}
const spriteloaders = [
    AddSprite('/assets/Sky.png', bgLayers.sky,),
    AddSprite('/assets/Mountains.png', bgLayers.mountains),
    AddSprite('/assets/Trees.png', bgLayers.trees),
    AddSprite('/assets/Ground.png', bgLayers.ground),
    AddSprite('/assets/ForeGround.png', bgLayers.front),

];

//TODO: fix layer order
Promise.all(spriteloaders).then(() => {
    console.log('kek1', bgLayers.sky[0])

    bgLayers.sky.forEach(item => item.zIndex = -100)
    bgLayers.mountains.forEach(item => item.zIndex = -90)
    bgLayers.trees.forEach(item => item.zIndex = -80)
    bgLayers.ground.forEach(item => item.zIndex = 0)
    bgLayers.front.forEach(item => item.zIndex = 10)
    console.log('All sprites have been added!');
    
    PIXI.Assets.load('/assets/animation/spineboy-pro.json').then((resource) => {
        animation = new Spine(resource.spineData);
        animation.setParent(playerTransform)
        game.stage.addChild(playerTransform);
        playerTransform.setTransform(
            screenSize.x / 2,
            screenSize.y -  playerSettings.scale * 1 * (screenSize.x /1600)*450,
            playerSettings.scale * 1 *(screenSize.x /1600), playerSettings.scale * 1 * (screenSize.x /1600)
        )
        if (animation.state.hasAnimation('run')) {
            animation.state.setAnimation(0, 'run', true);
            animation.state.timeScale = 0.1 * playerSettings.speed;
            animation.autoUpdate = true;
        }

        playerNamePlate.setTransform(-250, 1, 3, 3)
        playerNamePlate.setParent(playerTransform)
        playerNamePlate.style.fill = '#FFF'
        playerNamePlate.style.dropShadow = true
        playerNamePlate.style.fontWeight = 'bold'

        console.log('Loaded bgs: ',objectsOnStage)
        game.stage.sortableChildren = true
        game.stage.addChild(...objectsOnStage)
        console.log('all set ')
    });

}).catch((error) => {
    console.error('An error occurred:', error);
});



PIXI.Assets.load('/assets/Arrow_keys.jpg').then((resource) => {
    const keyboardInstructions = new PIXI.Sprite(resource)
    keyboardInstructions.setTransform(screenSize.x / 2 - 50, 50, 0.3, 0.3)
    game.stage.addChild(keyboardInstructions);
})


const GameLoop = () => {
    if (gameHasStarted) {
        if (!userInput.isInput)player.velocity = Lerp(player.velocity, 0, 0.03)
       
        animation.state.timeScale = 0.2 * Math.abs(player.velocity)
   
        
        bgLayers.sky.forEach(i => i.x -= player.velocity*0.2)
        bgLayers.mountains.forEach(i => i.x -= player.velocity*0.3)
        bgLayers.trees.forEach(i => i.x -= player.velocity*0.6)
        bgLayers.ground.forEach(i => i.x -= player.velocity*0.9)
        bgLayers.front.forEach(i => i.x -= player.velocity*1)

        const RepeatBackground = (spites: PIXI.Sprite[]): void => {
            if (spites[0].x + spites[0].width <= 0) spites[0].x = spites[1].x + spites[1].width;
            if (spites[1].x + spites[1].width <= 0) spites[1].x = spites[0].x + spites[0].width;
            if (spites[0].x >= screenSize.x) spites[0].x = spites[1].x - spites[0].width;
            if (spites[1].x >= screenSize.x) spites[1].x = spites[0].x - spites[1].width;
        }
        Object.entries(bgLayers).forEach(([key, value]) => {
            RepeatBackground(value)
        });

    }
if(playerSettings.movingEnabled){
    playerTransform.position.set(
        playerTransform.position.x + player.velocity,
        playerTransform.position.y)

    //run out of screen to right TODO: this is broken
    if (playerTransform.x > 100) {
        playerTransform.x = -playerTransform.width / 2;
    }
      //run out of screen to left
    if (playerTransform.x < -100) {
        playerTransform.x = screenSize.x + 20
    }

}


    //TODO: Add moving to idle when playervelocity is near 0
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






