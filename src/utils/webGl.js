export const createShader = (gl, shaderType, source) => {
  const shader = gl.createShader(gl[shaderType])
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  return shader
}

export const createBuffer = (gl, bufferType, data, type = 'STATIC_DRAW') => {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl[bufferType], buffer)
  gl.bufferData(gl[bufferType], new Float32Array(data), gl[type])

  return buffer
}

export const bindBuffer = (gl, program, attributeName, buffer, bufferType = 'ARRAY_BUFFER') => {
  const attributeLocation = gl.getAttribLocation(program, attributeName)
  gl.enableVertexAttribArray(attributeLocation)
  gl.bindBuffer(gl[bufferType], buffer)
  gl.vertexAttribPointer(attributeLocation, 3, gl.FLOAT, false, 0, 0)
  return attributeLocation  
}

export const createProgram = (gl, shaders) => {
  const program = gl.createProgram()
  for (const shader of shaders) {
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)

  return program
}

export const saveUniform = (gl, location, data) => {
  gl.uniformMatrix4fv(location, false, data)
}
