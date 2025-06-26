precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;
void main() {
    vec4 color = texture2D(u_texture,v_uv);
    gl_FragColor = vec4(color.r * 16.0, 
                        color.r * 16,
                        color.b * 16, 1.0);
}
