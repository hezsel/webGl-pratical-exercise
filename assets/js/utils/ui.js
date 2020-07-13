import {
  rotateX,
  rotateY,
  translate,
} from './matrix.js'

const colorPicker = document.getElementById('color-picker')
const currentColor = document.getElementById('current-color')
const xRotation = document.getElementById('x-rotation')
const yRotation = document.getElementById('y-rotation')
const zRotation = document.getElementById('z-rotation')
const xRotationRange = document.getElementById('x-rotation-range')
const yRotationRange = document.getElementById('y-rotation-range')
const zRotationRange = document.getElementById('z-rotation-range')

export const updateUiValues = ({ rotation, color }) => {
  colorPicker.value = color
  currentColor.innerText = color
  xRotation.innerText = `${rotation.x} x`
  yRotation.innerText = `${rotation.y} y`
  zRotation.innerText = `${rotation.z} z`
  xRotationRange.value = rotation.x
  yRotationRange.value = rotation.y
  zRotationRange.value = rotation.z
}

const resizeCanvasToFullscreen = (canvas) => {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
}

export const initializeCanvas = () => {
  const canvas = document.getElementById('canvas')
  resizeCanvasToFullscreen(canvas)
  const gl = canvas.getContext('webgl')
  if (!gl) {
    alert('WebGL not supported')
    throw new Error('WebGL not supported')
  }

  return gl
}

export const addListeners = (
  { modelMatrix: model, viewMatrix: view },
  { changeScale, setConfig },
) => {
  document.addEventListener('keydown', (event) => {
    if (event.keyCode == 74) rotateY(model, -0.05)
    if (event.keyCode == 76) rotateY(model, 0.05)
    if (event.keyCode == 75) rotateX(model, 0.05)
    if (event.keyCode == 73) rotateX(model, -0.05)
    if (event.keyCode == 85) rotateX(model, 0.05)
    if (event.keyCode == 79) rotateX(model, -0.05)

    if (event.keyCode == 70) translate(model, [-0.1, 0, 0])
    if (event.keyCode == 72) translate(model, [0.1, 0, 0])
    if (event.keyCode == 84) translate(model, [0, 0, -0.1])
    if (event.keyCode == 71) translate(model, [0, 0, 0.1])
    if (event.keyCode == 82) translate(model, [0, 0.1, 0])
    if (event.keyCode == 89) translate(model, [0, -0.1, 0])

    if (event.keyCode == 65) translate(view, [-0.1, 0, 0])
    if (event.keyCode == 68) translate(view, [0.1, 0, 0])
    if (event.keyCode == 87) translate(view, [0, 0, -0.1])
    if (event.keyCode == 83) translate(view, [0, 0, 0.1])
    if (event.keyCode == 81) translate(view, [0, 0.1, 0])
    if (event.keyCode == 69) translate(view, [0, -0.1, 0])

    if (event.keyCode == 32) {
      setConfig({ changeAutomaticRotation: true })
    }
  })

  document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) changeScale(0.5)
    if (event.deltaY < 0) changeScale(- 0.5)
  })
}
