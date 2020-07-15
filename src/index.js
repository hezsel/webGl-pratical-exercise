import {
  createShader,
  createBuffer,
  bindBuffer,
  createProgram,
  saveUniform,
} from './utils/webGl.js'
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

window.models = {}

let animationFrameId = null

const defaultConfig = {    
  model: 'cube',
  color: null,
  animation: true,
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
}

let configs = {}

const matrix = {
  model: mat4.create(),
  view: mat4.create(),
  normal: mat4.create(),
  projection: mat4.create(),
  rotation: {
    x: mat4.create(),
    y: mat4.create(),
  },
}

const changeScale = (scaleValue) => {
  const modifier = (1 + (scaleValue/10))
  mat4.scale(matrix.model, matrix.model, [modifier, modifier, modifier])
  configs.scale = scaleValue
}

const resetMatrixes = () => {
  mat4.perspective(matrix.projection, 1.25, canvas.width/canvas.height, 1e-4, 1e4)
  mat4.identity(matrix.model)
  mat4.identity(matrix.view)
  mat4.translate(matrix.view, matrix.view, [0, 0, -2])
  mat4.identity(matrix.rotation.x)
  mat4.identity(matrix.rotation.y)
}

const adjustRotation = ({ rotationChange: [ axis, value ] }) => {
  configs.rotation[axis] = value
}

const mouseRotation = ({ model, rotation }, { angles }) => {
  mat4.fromXRotation(rotation.x, angles.x)
  mat4.fromYRotation(rotation.y, angles.y)

  mat4.multiply(model, rotation.x, model)
  mat4.multiply(model, rotation.y, model)

  configs.angles = {
    x: 0,
    y: 0,
  }
}

const multiplyMatrixes = (mvp, mv, { model, view, projection }) => {
  mat4.multiply(mv, view, model)
  mat4.multiply(mvp, projection, mv)
}

const generateNormalMatrix = (normal, mv) => {
  mat4.invert(normal, mv)
  mat4.transpose(normal, normal)
}

const rotateModel = (model, { rotation }) => {
  mat4.rotateX(model, model, rotation.x/100)
  mat4.rotateY(model, model, rotation.y/100)
  mat4.rotateZ(model, model, rotation.z/100)
}

const drawModel = (program) => () => {
  cancelAnimationFrame(animationFrameId)

  const { vertexes, normals } = window.models[configs.model]

  const colors = generateColorArray(vertexes.length, configs)

  const positionBuffer = createBuffer(gl, 'ARRAY_BUFFER', vertexes)
  const colorBuffer = createBuffer(gl, 'ARRAY_BUFFER', colors)
  const normalBuffer = createBuffer(gl, 'ARRAY_BUFFER', normals)

  bindBuffer(gl, program, 'position', positionBuffer)
  bindBuffer(gl, program, 'color', colorBuffer)
  bindBuffer(gl, program, 'normal', normalBuffer)

  const mvMatrix = mat4.create()
  const mvpMatrix = mat4.create()

  const uniformMatrixes = {
    normal: gl.getUniformLocation(program, 'normalMatrix'),
    matrix: gl.getUniformLocation(program, 'matrix'),
  }

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw)

    if (configs.animation) rotateModel(matrix.model, configs)

    mouseRotation(matrix, configs)
    multiplyMatrixes(mvpMatrix, mvMatrix, matrix)
    generateNormalMatrix(matrix.normal, mvMatrix)

    saveUniform(gl, uniformMatrixes.matrix, mvpMatrix)
    saveUniform(gl, uniformMatrixes.normal, matrix.normal)
  
    gl.drawArrays(gl.TRIANGLES, 0, vertexes.length/3)
  }

  draw()
}

const setConfig = (newConfigs, reload = false) => {
  configs = { ...configs, ...newConfigs }

  if (newConfigs.color === null) configs.color = getRandomColor()
  if (newConfigs.color) configs.colorByVertex = false
  if (newConfigs.scaleChange) changeScale(newConfigs.scaleChange)
  if (newConfigs.changeAnimation) configs.animation = !configs.animation
  if (newConfigs.rotationChange)adjustRotation(configs)
  if (newConfigs.resetPosition) resetMatrixes()

  if (reload) window.drawModel()
  updateUiValues(configs)
}

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

  window.setConfig(defaultConfig)

  window.drawModel()
}


loadProgram()
addListeners(matrix, { changeScale, setConfig })
