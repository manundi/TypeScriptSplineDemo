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
let animation: Spine
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


// define basic settings of html canvas. Sizer bg color etc.
const game = new PIXI.Application<any>({
    width: screenSize.x,
    height: screenSize.y,
    backgroundColor: 'pink',
});

// attach the game (pixi app) to the html document element called body
document.body.appendChild(game.view)

PIXI.Assets.load('/assets/Arrow_keys.jpg').then((resource) => {
    const keyboardInstructions = new PIXI.Sprite(resource)
    keyboardInstructions.setTransform(screenSize.x/2 -100,screenSize.y-200,0.5,0.5)
    game.stage.addChild(keyboardInstructions);
})


PIXI.Assets.load('/assets/animation/spineboy-pro.json').then((resource) => {
    //console.log('Loaded spineboy: ', resource)

    animation = new Spine(resource.spineData);
    const shadow : Spine = new Spine(resource.spineData);

    const fiter = new PIXI.Filter(
        `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;
        
        uniform mat3 projectionMatrix;
        
        varying vec2 vTextureCoord;
        
        void main(void) {
            vTextureCoord = aTextureCoord;
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        }
       
       `,
       `
       
       precision mediump float;
    
       varying vec2 vTextureCoord;
       uniform sampler2D uSampler;
       
      
       void main(void) {
           vec4 color = texture2D(uSampler, vTextureCoord);
       
           // Sample neighboring pixels for a basic blur effect
           vec4 blurColor = texture2D(uSampler, vTextureCoord + vec2(0.5 , 0.5 )) * 0.25
                          + texture2D(uSampler, vTextureCoord + vec2(-0.5 , 0.5 )) * 0.25
                          + texture2D(uSampler, vTextureCoord + vec2(0.5 , -0.5 )) * 0.25
                          + texture2D(uSampler, vTextureCoord + vec2(-0.5 , -0.5 )) * 0.25;
       
           // If the original pixel is not transparent but the blurred area is, then draw the shadow
           if (color.a > 0.0 && blurColor.a > 0.0) {
               gl_FragColor = vec4(0.0, 0.0, 0.0, 0.9  * blurColor.a);
           } else {
               discard;
           }
       }
       
       
    
    `,
       null)
        
    shadow.filters = [fiter];

    playerNamePlate.setTransform(-250, 1, 3, 3)
    playerNamePlate.setParent(playerTransform)
    animation.setParent(playerTransform)

    game.stage.addChild(playerTransform);

    // lets move the newly created animation to center of the screen

    playerTransform.setTransform(
        screenSize.x / 2,
        screenSize.y / 2 + animation.height * playerSettings.scale / 2,
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
    if (!gameHasStarted) {
        playerTransform.position.set(
            playerTransform.position.x + playerSettings.speed,
            playerTransform.position.y)
    //user has control, game has started
    } else {
        if (userInput.isInput) {
            
        } else {
            player.velocity = Lerp(player.velocity, 0, 0.03)
        }

        animation.state.timeScale =  0.1 *  Math.abs(player.velocity)
        playerTransform.position.set(
        playerTransform.position.x + player.velocity,
        playerTransform.position.y)
      
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







