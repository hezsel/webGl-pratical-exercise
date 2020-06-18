import shapes from './shapes.js'
import {
  createShader,
  createBuffer,
  bindBuffer,
  createProgram,
  saveUniform,
} from './utils/webGl.js'
import {
  newMat4,
  rotateX,
  rotateY,
  scale,
  translate,
  createProjectionMatrix,
  multiply,
} from './utils/matrix.js'
import {
  generateColorArray,
  resizeCanvasToFullscreen,
} from './utils/others.js'
import {
  vertexShaderSource,
  fragmentShaderSource,
} from './shaders/index.js'

const canvas = document.getElementById('canvas')
resizeCanvasToFullscreen(canvas)
const gl = canvas.getContext('webgl')
if (!gl) throw new Error('WebGL not supported')

const vertexShader = createShader(gl, 'VERTEX_SHADER', vertexShaderSource)
const fragmentShader = createShader(gl, 'FRAGMENT_SHADER', fragmentShaderSource)

const program = createProgram(gl, [fragmentShader, vertexShader])

gl.useProgram(program)

gl.enable(gl.DEPTH_TEST)

let animationFrameId = null

const drawShape = (shapeName, colorName = 'ramdom') => {
  cancelAnimationFrame(animationFrameId)

  const vertex = shapes[shapeName]

  const color = generateColorArray(vertex.length, 3, colorName)

  const positionBuffer = createBuffer(gl, 'ARRAY_BUFFER', vertex)
  const colorBuffer = createBuffer(gl, 'ARRAY_BUFFER', color)

  bindBuffer(gl, program, 'position', positionBuffer)
  bindBuffer(gl, program, 'color', colorBuffer)

  const matrix = newMat4()

  const projectionMatrix = createProjectionMatrix(
    1.25,
    canvas.width/canvas.height,
    1e-4, 
    1e4,
  )
  
  scale(matrix, [0.25, 0.25, 0.25])
  translate(matrix, [0, 0, -4])

  const finalMatrix = newMat4()

  const uniformMatrixLocation = gl.getUniformLocation(program, 'matrix')

  rotateX(matrix, 0.5)
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    rotateY(matrix, 0.02)
    multiply(finalMatrix, projectionMatrix, matrix)
    saveUniform(gl, uniformMatrixLocation, finalMatrix)
    gl.drawArrays(gl.TRIANGLES, 0 , vertex.length/3)
  }
  animate()

  document.addEventListener('keydown', (event) => {
    if(event.keyCode == 37) rotateY(matrix, 0.05)
    if(event.keyCode == 39) rotateY(matrix, -0.05)
    if(event.keyCode == 40) rotateX(matrix, 0.05)
    if(event.keyCode == 38) rotateX(matrix, -0.05)
    if(event.keyCode == 13) {
      if (animationFrameId === null ) animate()
    }
    if(event.keyCode == 27) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  })

  document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) scale(matrix, [1.1, 1.1, 1.1])
    if (event.deltaY < 0) scale(matrix, [0.9, 0.9, 0.9])
  })
}

drawShape('pyramid')

window.drawShape = drawShape
