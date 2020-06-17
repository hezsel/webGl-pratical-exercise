const canvas = document.querySelector('canvas')
canvas.width  = window.innerWidth
canvas.height = window.innerHeight

const gl = canvas.getContext('webgl')
if (!gl) throw new Error('WebGL not supported')

const vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, `
  precision mediump float;

  attribute vec3 position;
  attribute vec3 color;
  varying vec3 vColor;

  uniform mat4 matrix;  

  void main() {
    vColor = color;
    gl_Position = matrix * vec4(position, 1);
  }
`)
gl.compileShader(vertexShader)

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragmentShader, `
  precision mediump float;

  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor, 1);
  }
`)
gl.compileShader(fragmentShader)

let animationFrameId = null

const program = createProgram(gl, [fragmentShader, vertexShader])
gl.useProgram(program)
gl.enable(gl.DEPTH_TEST)

const drawShape = (shapeName, colorName = 'ramdom') => {
  cancelAnimationFrame(animationFrameId)

  const vertex = shapes[shapeName]

  const color = generateColorArray(vertex.length, 3, colorName)

  const positionBuffer = createBuffer(gl, 'ARRAY_BUFFER', vertex)
  const colorBuffer = createBuffer(gl, 'ARRAY_BUFFER', color)

  const positionLocation = bindBuffer(gl, program, 'position', positionBuffer)
  const colorLocation = bindBuffer(gl, program, 'color', colorBuffer)

  const matrix = newMat4()

  const projectionMatrix = newMat4()
  mat4.perspective(
    projectionMatrix,
    1.25,
    canvas.width/canvas.height,
    1e-4, 
    1e4,
  )
  
  scale(matrix, [0.25, 0.25, 0.25])
  translate(matrix, [0, 0, -4])

  const finalMatrix = newMat4()

  const uniformMatrix = gl.getUniformLocation(program, 'matrix')

  rotateX(matrix, 0.5)
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    rotateY(matrix, 0.02)
    mat4.multiply(finalMatrix, projectionMatrix, matrix)
    saveUniform(gl, uniformMatrix, finalMatrix)
    gl.drawArrays(gl.TRIANGLES, 0 , vertex.length/3)
  }
  animate()


  document.addEventListener('keydown', (event) => {
    if(event.keyCode == 37) rotateY(matrix, 0.05)
    else if(event.keyCode == 39) rotateY(matrix, -0.05)
    else if(event.keyCode == 40) rotateX(matrix, 0.05)
    else if(event.keyCode == 38) rotateX(matrix, -0.05)
    else if(event.keyCode == 27) cancelAnimationFrame(animationFrameId)
  })

  document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) scale(matrix, [1.1, 1.1, 1.1])
    else if (event.deltaY < 0) scale(matrix, [0.9, 0.9, 0.9])
  })
}

drawShape('pyramid')
