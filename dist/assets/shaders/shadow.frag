precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float shadowYOffset; // The Y offset for the shadow
uniform float shadowOpacity; // Opacity of the shadow

void main(void) {
    vec4 spriteColor = texture2D(uSampler, vTextureCoord);
    
    if (vTextureCoord.y > shadowYOffset) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, spriteColor.a * shadowOpacity);
    } else {
        gl_FragColor = spriteColor;
    }
}
