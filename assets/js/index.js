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
import parseObjFile from './utils/parser.js'

const canvas = document.getElementById('canvas')
resizeCanvasToFullscreen(canvas)
const gl = canvas.getContext('webgl')
if (!gl) throw new Error('WebGL not supported')

const colorPicker = document.getElementById('color-picker')
const currentColor = document.getElementById('current-color')
const xRotation = document.getElementById('x-rotation')
const yRotation = document.getElementById('y-rotation')
const zRotation = document.getElementById('z-rotation')
const xRotationRange = document.getElementById('x-rotation-range')
const yRotationRange = document.getElementById('y-rotation-range')
const zRotationRange = document.getElementById('z-rotation-range')

const modelList = document.getElementById('model-list')

let animationFrameId = null

let models = {}

let configs = {}

const addModelsTolist = (models) => {
  for (const [name] of Object.entries(models)) {
    const model = document.createElement('li')
    const label = document.createElement('a')
    label.innerText = name
    model.appendChild(label)
    model.setAttribute('onclick', `setConfig({ model: "${name}" }, true)`)
    modelList.appendChild(model)
  }
}

const loadModels = (modelsToLoad) => {
  models = {
    ...models,
    ...modelsToLoad,
  }

  addModelsTolist(modelsToLoad)
}

const addModelFile = (name, data) => {
  const modelJson = parseObjFile(data)
  loadModels({
    [name]: modelJson,
  })
  setConfig({ model: name }, true)
}

document.getElementById('file').addEventListener('change', event => {
  const file = event.target.files[0]
  if (!file.name.match(/.*\.obj$/)) {
    alert('only ".obj" files are accepted')
    return
  }
  const reader = new FileReader()
  reader.addEventListener('load', event => {
    const fileName = file.name.replace(/\.obj$/, '')
    addModelFile(fileName, event.target.result)
  })
  reader.readAsText(file)
})

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
let viewMatrix = newMat4()
translate(viewMatrix, [0, 0, -1])

const updateUiValues = ({ rotation, color }) => {
  colorPicker.value = color
  currentColor.innerText = color
  xRotation.innerText = `${rotation.x} x`
  yRotation.innerText = `${rotation.y} y`
  zRotation.innerText = `${rotation.z} z`
  xRotationRange.value = rotation.x
  yRotationRange.value = rotation.y
  zRotationRange.value = rotation.z
}

const changeScale = (scaleValue) => {
  const modifier = (1 + (scaleValue/10))
  scale(objectMatrix, modifier)
  configs.scale = scaleValue
}

const setConfig = (newConfigs, reload = false) => {
  configs = {
    ...configs,
    ...newConfigs,
  }
  if (newConfigs.color === null) {
    configs.color = getRandomColor()
  }
  if (newConfigs.scaleChange) {
    changeScale(newConfigs.scaleChange)
  }

  const rotationChange = newConfigs.rotationChange
  if (rotationChange) {
    configs.rotation[rotationChange[0]] = rotationChange[1]
  }

  updateUiValues(configs)

  if (newConfigs.resetPosition) {
    objectMatrix = newMat4()
    changeScale(-7.5)
    viewMatrix = newMat4()
    translate(viewMatrix, [0, 0, -1])
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

  setConfig({    
    model: 'cube',
    color: null,
    automaticRotation: true,
    resetPosition: true,
    rotation: {
      x: 1,
      y: 1,
      z: 0,
    },
  })

  window.drawModel()
}

const drawModel = (program) => () => {
  cancelAnimationFrame(animationFrameId)

  const { vertices, normals } = models[configs.model]

  const color = generateColorArray(vertices.length, 3, configs.color)

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

  const uniformMatrixLocation = gl.getUniformLocation(program, 'matrix')
  const uniformNormalLocation = gl.getUniformLocation(program, 'normalMatrix')

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw)
    if (configs.automaticRotation) {
      rotateX(objectMatrix, configs.rotation.x / 100)
      rotateY(objectMatrix, configs.rotation.y / 100)
      rotateX(objectMatrix, configs.rotation.z / 100)
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
    if (event.deltaY > 0) changeScale(0.5)
    if (event.deltaY < 0) changeScale(- 0.5)
  })
}

loadProgram()
