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
  loadResource,
  getDefaultModels,
} from './utils/others.js'

const canvas = document.getElementById('canvas')
resizeCanvasToFullscreen(canvas)
const gl = canvas.getContext('webgl')
if (!gl) throw new Error('WebGL not supported')

let animationFrameId = null

let models = {}

const loadModels = (modelsToLoad) => {
  models = {
    ...models,
    ...modelsToLoad,
  }
}

const loadShaders = async () => {
  const vertexShaderSource = await loadResource('text', 'assets/shaders/vertex.glsl')
  const fragmentShaderSource = await loadResource('text', 'assets/shaders/fragment.glsl')

  const vertexShader = createShader(gl, 'VERTEX_SHADER', vertexShaderSource)
  const fragmentShader = createShader(gl, 'FRAGMENT_SHADER', fragmentShaderSource)

  return {
    vertexShader,
    fragmentShader,
  }
}

const loadProgram = async () => {
  const { vertexShader, fragmentShader } = await loadShaders()

  const program = createProgram(gl, [fragmentShader, vertexShader])
  gl.useProgram(program)
  gl.enable(gl.DEPTH_TEST)

  await getDefaultModels().then(loadModels)

  window.drawModel = drawModel(program)
  window.drawModel('cube', { automaticRotation: true })
}

const drawModel = (program) => (modelName, { colorName, automaticRotation = true } = {}) => {
  cancelAnimationFrame(animationFrameId)

  const { vertices, normals } = models[modelName]
  const color = generateColorArray(vertices.length, 3, colorName)

  const positionBuffer = createBuffer(gl, 'ARRAY_BUFFER', vertices)
  const colorBuffer = createBuffer(gl, 'ARRAY_BUFFER', color)
  const normalBuffer = createBuffer(gl, 'ARRAY_BUFFER', normals)

  bindBuffer(gl, program, 'position', positionBuffer)
  bindBuffer(gl, program, 'color', colorBuffer)
  bindBuffer(gl, program, 'normal', normalBuffer)

  const objectMatrix = newMat4()
  const projectionMatrix = createProjectionMatrix(
    1.25,
    canvas.width/canvas.height,
    1e-4, 
    1e4,
  )
  const normalMatrix = newMat4()
  const viewMatrix = newMat4()
  const mvMatrix = newMat4()
  const mvpMatrix = newMat4()

  const uniformMatrixLocation = gl.getUniformLocation(program, 'matrix')
  const uniformNormalLocation = gl.getUniformLocation(program, 'normalMatrix')

  scale(objectMatrix, [0.25, 0.25, 0.25])
  translate(viewMatrix, [0, 0, -1])

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw)
    if (automaticRotation) {
      rotateX(objectMatrix, 0.01)
      rotateY(objectMatrix, 0.01)
    }

    multiply(mvMatrix, viewMatrix, objectMatrix)
    multiply(mvpMatrix, projectionMatrix, mvMatrix)

    mat4.invert(normalMatrix, mvMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    saveUniform(gl, uniformMatrixLocation, mvpMatrix)
    saveUniform(gl, uniformNormalLocation, normalMatrix)
  
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3)
  }
  draw()

  document.addEventListener('keydown', (event) => {
    if(event.keyCode == 74) rotateY(objectMatrix, -0.05)
    if(event.keyCode == 76) rotateY(objectMatrix, 0.05)
    if(event.keyCode == 75) rotateX(objectMatrix, 0.05)
    if(event.keyCode == 73) rotateX(objectMatrix, -0.05)
    if(event.keyCode == 85) rotateX(objectMatrix, 0.05)
    if(event.keyCode == 79) rotateX(objectMatrix, -0.05)

    if(event.keyCode == 70) translate(objectMatrix, [-0.1, 0, 0])
    if(event.keyCode == 72) translate(objectMatrix, [0.1, 0, 0])
    if(event.keyCode == 84) translate(objectMatrix, [0, 0, -0.1])
    if(event.keyCode == 71) translate(objectMatrix, [0, 0, 0.1])
    if(event.keyCode == 82) translate(objectMatrix, [0, 0.1, 0])
    if(event.keyCode == 89) translate(objectMatrix, [0, -0.1, 0])

    if(event.keyCode == 65) translate(viewMatrix, [-0.1, 0, 0])
    if(event.keyCode == 68) translate(viewMatrix, [0.1, 0, 0])
    if(event.keyCode == 87) translate(viewMatrix, [0, 0, -0.1])
    if(event.keyCode == 83) translate(viewMatrix, [0, 0, 0.1])
    if(event.keyCode == 81) translate(viewMatrix, [0, 0.1, 0])
    if(event.keyCode == 69) translate(viewMatrix, [0, -0.1, 0])

    if(event.keyCode == 13) {
      if (animationFrameId === null ) draw()
    }
    if(event.keyCode == 27) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  })

  document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) scale(objectMatrix, [1.1, 1.1, 1.1])
    if (event.deltaY < 0) scale(objectMatrix, [0.9, 0.9, 0.9])
  })
}

loadProgram()
