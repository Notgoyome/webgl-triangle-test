main();

function main() {
  const canvas = document.querySelector("#gl-canvas")
  const gl = canvas.getContext("webgl2")

  const vertices = [
    -1, -1,
    0, 1,
    1, 0
  ]

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)

  const vertexSource = `\
  precision mediump float;
  attribute vec2 vertex_position;
  void main() {
    gl_Position = vec4(vertex_position, 0.0, 1.0);
  }
  `
  
  gl.shaderSource(vertexShader, vertexSource)
  gl.compileShader(vertexShader)
  
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  const fragmentSource = `\
    precision mediump float;

    void main() {
      gl_FragColor = vec4(0.74, 0.07, 0.31, 1.0);
    }
  `
  gl.shaderSource(fragmentShader, fragmentSource)
  gl.compileShader(fragmentShader)

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader))
  }


  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader))
  }


  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.useProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program))
  }

  const vertexPositionLoc = gl.getAttribLocation(program, "vertex_position")
  gl.enableVertexAttribArray(vertexPositionLoc)
  
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.vertexAttribPointer(vertexPositionLoc, 2, gl.FLOAT, false, 0, 0)

  gl.viewport(0,0,canvas.width,canvas.height)


  gl.clearColor(0,0.71,0.26,1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  
  gl.drawArrays(gl.TRIANGLES, 0 , 3)
  
  console.log("drawing")
}
