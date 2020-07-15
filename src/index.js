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
  rotateZ,
  scale,
  translate,
  createProjectionMatrix,
  multiply,
} from './utils/matrix.js'
import {
  generateColorArray,
  loadResource,
  getDefaultModels,
  getRandomColor,
} from './utils/others.js'
import {
  initializeCanvas,
  updateUiValues,
  addListeners,
} from './utils/ui.js'
import loadModels from './models/loader.js'

const gl = initializeCanvas()

let animationFrameId = null
window.models = {}
let configs = {}
const modelMatrix = newMat4()
const viewMatrix = newMat4()
const rotationMatrixes = {
  x: mat4.identity(newMat4()),
  y: mat4.identity(newMat4()),
}
translate(viewMatrix, [0, 0, -1])

const loadShaders = async () => {
  const vertexShaderSource = await loadResource('text', 'src/shaders/vertex.glsl')
  const fragmentShaderSource = await loadResource('text', 'src/shaders/fragment.glsl')

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

  window.setConfig = setConfig
  window.drawModel = drawModel(program)

  window.setConfig({    
    model: 'cube',
    color: null,
    automaticRotation: true,
    resetPosition: true,
    rotation: {
      x: 1,
      y: 0,
      z: 1,
    },
    angles: {
      x: 0,
      y: 0,
    }
  })

  window.drawModel()
}

const changeScale = (scaleValue) => {
  const modifier = (1 + (scaleValue/10))
  scale(modelMatrix, modifier)
  configs.scale = scaleValue
}

const setConfig = (newConfigs, reload = false) => {
  if (newConfigs.angles && configs.angles) {
    configs.angles.x += newConfigs.angles.x
    configs.angles.y += newConfigs.angles.y
  }
  configs = {
    ...configs,
    ...newConfigs,
  }
  if (newConfigs.color === null) {
    configs.color = getRandomColor()
  }
  if (newConfigs.color) {
    configs.colorByTriangle = false
  }
  if (newConfigs.scaleChange) {
    changeScale(newConfigs.scaleChange)
  }
  if (newConfigs.changeAutomaticRotation) {
    configs.automaticRotation = !configs.automaticRotation 
  }
  const rotationChange = newConfigs.rotationChange
  if (rotationChange) {
    configs.rotation[rotationChange[0]] = rotationChange[1]
  }
  if (newConfigs.resetPosition) {
    mat4.identity(modelMatrix)
    changeScale(-4.5)
    mat4.identity(viewMatrix)
    translate(viewMatrix, [0, 0, -1])
    rotationMatrixes.x = mat4.identity(newMat4())
    rotationMatrixes.y = mat4.identity(newMat4())
    configs.angles.x = 0
    configs.angles.y = 0
  }
  if (reload) {
    window.drawModel()
  }
  updateUiValues(configs)
}

const mouseRotation = () => {
  mat4.fromXRotation(rotationMatrixes.x, configs.angles.x)
  mat4.fromYRotation(rotationMatrixes.y, configs.angles.y)

  multiply(modelMatrix, rotationMatrixes.x, modelMatrix)
  multiply(modelMatrix, rotationMatrixes.y, modelMatrix)

  configs.angles.x = 0
  configs.angles.y = 0
}

const drawModel = (program) => () => {
  cancelAnimationFrame(animationFrameId)

  const { vertices, normals } = window.models[configs.model]

  const color = generateColorArray(vertices.length, 3, configs)

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
  const mvMatrix = newMat4()
  const mvpMatrix = newMat4()

  const uniformMatrixes = {
    normal: gl.getUniformLocation(program, 'normalMatrix'),
    matrix: gl.getUniformLocation(program, 'matrix'),
  }
  const draw = () => {
    animationFrameId = requestAnimationFrame(draw)
    if (configs.automaticRotation) {
      rotateX(modelMatrix, configs.rotation.x / 100)
      rotateY(modelMatrix, configs.rotation.y / 100)
      rotateZ(modelMatrix, configs.rotation.z / 100)
    }

    mouseRotation()

    multiply(mvMatrix, viewMatrix, modelMatrix)
    multiply(mvpMatrix, projectionMatrix, mvMatrix)

    mat4.invert(normalMatrix, mvMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    saveUniform(gl, uniformMatrixes.matrix, mvpMatrix)
    saveUniform(gl, uniformMatrixes.normal, normalMatrix)
  
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3)
  }
  draw()
}

loadProgram()
addListeners({ modelMatrix, viewMatrix }, { changeScale, setConfig })
