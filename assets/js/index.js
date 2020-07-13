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
  getRandomColor,
} from './utils/others.js'

const canvas = document.getElementById('canvas')
resizeCanvasToFullscreen(canvas)
const gl = canvas.getContext('webgl')
if (!gl) throw new Error('WebGL not supported')

const colorPicker = document.getElementById('color-picker')

let animationFrameId = null

let models = {}

let configs = {}

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

let objectMatrix = newMat4()
scale(objectMatrix, [0.25, 0.25, 0.25])

const setConfig = (newConfigs, reload = false) => {
  configs = {
    ...configs,
    ...newConfigs,
  }

  const rotationAdd = newConfigs.rotationAdd
  if (rotationAdd) {
    configs.rotation[rotationAdd[0]] += rotationAdd[1]
  }

  if (newConfigs.resetPosition) {
    objectMatrix = newMat4()
    scale(objectMatrix, [0.25, 0.25, 0.25])
  }

  if (reload) {
    window.drawModel()
  }
}

const loadProgram = async () => {
  const { vertexShader, fragmentShader } = await loadShaders()

  const program = createProgram(gl, [fragmentShader, vertexShader])
  gl.useProgram(program)
  gl.enable(gl.DEPTH_TEST)

  await getDefaultModels().then(loadModels)

  window.setConfig = setConfig
  window.drawModel = drawModel(program)

  window.setConfig({    
    model: 'cube',
    color: null,
    automaticRotation: true,
    rotation: {
      x: 0.01,
      y: 0.01,
      z: 0,
    },
  })

  window.drawModel()
}

const drawModel = (program) => () => {
  cancelAnimationFrame(animationFrameId)

  const { vertices, normals } = models[configs.model]

  const colorHex = configs.color || getRandomColor()
  const color = generateColorArray(vertices.length, 3, colorHex)

  colorPicker.value = colorHex

  const positionBuffer = createBuffer(gl, 'ARRAY_BUFFER', vertices)
  const colorBuffer = createBuffer(gl, 'ARRAY_BUFFER', color)
  const normalBuffer = createBuffer(gl, 'ARRAY_BUFFER', normals)

  bindBuffer(gl, program, 'position', positionBuffer)
  bindBuffer(gl, program, 'color', colorBuffer)
  bindBuffer(gl, program, 'normal', normalBuffer)

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

  translate(viewMatrix, [0, 0, -1])

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw)
    if (configs.automaticRotation) {
      rotateX(objectMatrix, configs.rotation.x)
      rotateY(objectMatrix, configs.rotation.y)
      rotateX(objectMatrix, configs.rotation.z)
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

    if(event.keyCode == 32) {
      setConfig({ automaticRotation: !configs.automaticRotation })
    }

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
