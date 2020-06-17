const createBuffer = (webgl, bufferType, data, type = 'STATIC_DRAW') => {
  const buffer = webgl.createBuffer()
  webgl.bindBuffer(webgl[bufferType], buffer)
  webgl.bufferData(webgl[bufferType], new Float32Array(data), webgl[type])

  return buffer
}

const bindBuffer = (webgl, program, attributeName, buffer, bufferType = 'ARRAY_BUFFER') => {
  const attributeLocation = webgl.getAttribLocation(program, attributeName)
  webgl.enableVertexAttribArray(attributeLocation)
  webgl.bindBuffer(webgl[bufferType], buffer)
  webgl.vertexAttribPointer(attributeLocation, 3, webgl.FLOAT, false, 0, 0)
  return attributeLocation  
}

const createProgram = (webgl, shaders) => {
  const program = webgl.createProgram()
  for (const shader of shaders) {
    webgl.attachShader(program, shader)
  }
  webgl.linkProgram(program)

  return program
}

const saveUniform = (webgl, location, data) => {
  webgl.uniformMatrix4fv(location, false, data)
}

const newMat4 = () => mat4.create()

const rotateX = (matrixToRotate, value) => {
  mat4.rotateX(matrixToRotate, matrixToRotate, value)
}

const rotateY = (matrixToRotate, value) => {
  mat4.rotateY(matrixToRotate, matrixToRotate, value)
}

const scale = (matrixToScale, value) => {
  mat4.scale(matrixToScale, matrixToScale, value)
}

const translate = (matrixToTranslate, value) => {
  mat4.translate(matrixToTranslate, matrixToTranslate, value)
}

const getRamdomColor = () => [Math.random(), Math.random(), Math.random()]

// todo: heaxagonal colors
const colors = {
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
}

const generateColorArray = (arrayLength, vertexLength, colorValue = null) => {
  const colorArray = []
  let colorRGB = []
  if (colorValue === 'ramdom') colorRGB = getRamdomColor()
  else colorRGB = colors[colorValue]
  for (let i = 0; i < arrayLength/vertexLength; i++) colorArray.push(...colorRGB)

  return colorArray
}
