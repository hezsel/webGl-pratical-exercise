export const multiply = (outputMatrix, m1, m2) => {
  mat4.multiply(outputMatrix, m1, m2)
}

export const newMat4 = () => mat4.create()

export const rotateX = (matrixToRotate, value) => {
  mat4.rotateX(matrixToRotate, matrixToRotate, value)
}

export const rotateY = (matrixToRotate, value) => {
  mat4.rotateY(matrixToRotate, matrixToRotate, value)
}

export const rotateZ = (matrixToRotate, value) => {
  mat4.rotateZ(matrixToRotate, matrixToRotate, value)
}

export const scale = (matrixToScale, value) => {
  mat4.scale(matrixToScale, matrixToScale, value)
}

export const translate = (matrixToTranslate, value) => {
  mat4.translate(matrixToTranslate, matrixToTranslate, value)
}

export const createProjectionMatrix = (fov, aspect, nearCullDistance, farCullDistance) => {
  const matrix = newMat4()
  mat4.perspective(matrix, fov, aspect, nearCullDistance, farCullDistance)

  return matrix
}
