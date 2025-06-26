import { spriteIndexed } from "./SpriteSheet.js";
import { palette } from "./SpriteSheet.js";
main();

function main() {
  const canvas = document.querySelector("#gl-canvas")
  const gl = initGl(canvas)
  
  

  const vertices = [
    -1, -1,
    -1, 1,
    1, -1,

    1,1,
    -1,1,
    1,-1

  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.clearColor(0,0,0.26,1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  
  // gl.drawArrays(gl.TRIANGLES, 0 , vertices.length/2)
  drawSprite(canvas, gl, 1, 0, 0)
}


function drawSprite(canvas, gl, index, x, y, width=16, height=16) {
  x = (x - 0.5) * 2
  y = (y - 0.5) * 2
  x /= canvas.width
  y /= canvas.height
  width /= canvas.width
  height /= canvas.height

  console.log(canvas.width)
  
  const vertices = new Float32Array([
    x, y,
    x + width, y,
    x, y + height,
    x, y + height,
    x + width, y,
    x + width, y + height
  ])
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.drawArrays(gl.TRIANGLES, 0 , vertices.length/2)
}


function initGl(canvas) {
  const gl = canvas.getContext("webgl2")
  

  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
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

  
  const [vertexShader, fragmentShader] = compileShaders(gl)

  const program = makeProgram(gl, vertexShader, fragmentShader)

  
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

  
  const vertexPositionLoc = gl.getAttribLocation(program, "vertex_position")
  gl.enableVertexAttribArray(vertexPositionLoc)
  gl.vertexAttribPointer(vertexPositionLoc, 2, gl.FLOAT, false, 0, 0)
  
  gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0)
  gl.uniform1i(gl.getUniformLocation(program, "u_color_texture"), 1)
  
  gl.viewport(0,0,canvas.width,canvas.height)

  return gl
}



function compileShaders(gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)

  //GET RGBA
  const vertexSource = `\
  
  attribute vec2 vertex_position;
  varying vec2 v_uv;
  void main() {
    gl_Position = vec4(vertex_position, 0.0, 1.0);
    v_uv = vec2((vertex_position.x + 1.0)/2.0, (vertex_position.y * -1.0 + 1.0) / 2.0);
  }
  `
  
  gl.shaderSource(vertexShader, vertexSource)
  gl.compileShader(vertexShader)
  
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  const fragmentSource = `\
    precision mediump float;
    uniform sampler2D u_texture;
    uniform sampler2D u_color_texture;
    varying vec2 v_uv;
    void main() {
      vec4 color = texture2D(u_texture,v_uv);
      float index = color.r * 255.0 + 0.5;
      vec4 palette_color = texture2D(u_color_texture, vec2(index / 16.0, 0.0));
      gl_FragColor = vec4(palette_color.r * 1.0, palette_color.g * 1.0, palette_color.b * 1.0, 1.0);
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