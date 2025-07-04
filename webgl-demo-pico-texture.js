import { spriteIndexed } from "./SpriteSheet.js";
import { palette } from "./SpriteSheet.js";
main();

function main() {
  const canvas = document.querySelector("#gl-canvas")
  const spriteSize = 128.0
  const gl = canvas.getContext("webgl2")

  const s = canvas.height / spriteSize

  const x = 40
  const y = 40
  const n_sprite = 0

  const vertices = [
    x, y, // bottom left
    x, spriteSize + y, // upper left
    spriteSize + x, y, // bottom right

    spriteSize + x, spriteSize + y,
    x,spriteSize + y,
    spriteSize + x,y

  ]

  const sprite_x = n_sprite % 16
  const sprite_y = Math.floor(n_sprite / 16)

  const uv_x = sprite_x/s
  const uv_y = sprite_y/s

  const uvs = [
    uv_x, uv_y,
    uv_x, uv_y + 1/s,
    uv_x + 1/s, uv_y,
    
    uv_x + 1/s, uv_y + 1/s,
    uv_x, uv_y + 1/s,
    uv_x + 1/s, uv_y
  ]

  //create spritesheet texture
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8, // 
    128,
    128,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    spriteIndexed
  )

  //create texture for color palette
  const colorPalette = gl.createTexture()
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, colorPalette)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    16,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    palette
  )

  
  const [vertexShader, fragmentShader] = compileShaders(gl, spriteSize)

  const program = makeProgram(gl, vertexShader, fragmentShader)

  
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  const vertexPositionLoc = gl.getAttribLocation(program, "vertex_position")
  gl.enableVertexAttribArray(vertexPositionLoc)
  gl.vertexAttribPointer(vertexPositionLoc, 2, gl.FLOAT, false, 0, 0)

  const textureBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW)
  const uvPositionLoc = gl.getAttribLocation(program, "uv_position")
  gl.enableVertexAttribArray(uvPositionLoc)
  gl.vertexAttribPointer(uvPositionLoc, 2, gl.FLOAT, false, 0, 0)

  gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0)
  gl.uniform1i(gl.getUniformLocation(program, "u_color_texture"), 1)

  gl.viewport(0,0,canvas.width,canvas.height)


  gl.clearColor(0,0,0.26,1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  
  gl.drawArrays(gl.TRIANGLES, 0 , vertices.length/2)
  
}

function compileShaders(gl, spriteSize) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)

  //GET RGBA
  const vertexSource = `\
  attribute vec2 vertex_position;
  attribute vec2 uv_position;
  varying vec2 v_uv;
  void main() {
    vec2 normalized_position = vec2((vertex_position - vec2(64.0,64.0)) / vec2(${64},${64})); // USE UNIFORM 
    vec2 flipped_position = vec2(normalized_position.x, -normalized_position.y);
    gl_Position = vec4(flipped_position, 0.0, 1.0);
    v_uv = uv_position;
  }
  `
  // si 0 c'est -1 et 128 c'est 1 alors 64 c'est 0 donc
  // normalized = (position - 64) / spriteSize
  gl.shaderSource(vertexShader, vertexSource)
  gl.compileShader(vertexShader)
  
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  const fragmentSource = `\
    precision mediump float;
    uniform sampler2D u_texture;
    uniform sampler2D u_color_texture;
    varying vec2 v_uv;
    void main() {
      vec4 color = texture2D(u_texture,v_uv); // getting the index
      float index = color.r * 255.0;

      vec4 palette_color = texture2D(u_color_texture, vec2(index / 16.0, 0.0));
      gl_FragColor = vec4(palette_color.r, palette_color.g, palette_color.b, 1.0);
    }
  `
  gl.shaderSource(fragmentShader, fragmentSource)
  gl.compileShader(fragmentShader)
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log("err: ", gl.getShaderInfoLog(fragmentShader))
  }
  return [vertexShader, fragmentShader]
}

function makeProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.useProgram(program)
  return program
}