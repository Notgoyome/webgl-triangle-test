attribute vec2 vertex_position;
varying vec2 v_uv;
void main() {
  gl_Position = vec4(vertex_position, 0.0, 1.0);
  v_uv = vec2(vertex_position.x, vertex_position.y);
}

