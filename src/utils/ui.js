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
  { model, view },
  { changeScale, setConfig },
) => {
  document.addEventListener('keydown', (event) => {
    if (event.keyCode == 74) mat4.rotateY(model, model, -0.05)
    if (event.keyCode == 76) mat4.rotateY(model, model, 0.05)
    if (event.keyCode == 75) mat4.rotateX(model, model, 0.05)
    if (event.keyCode == 73) mat4.rotateX(model, model, -0.05)
    if (event.keyCode == 85) mat4.rotateZ(model, model, 0.05)
    if (event.keyCode == 79) mat4.rotateZ(model, model, -0.05)

    if (event.keyCode == 70) mat4.translate(model, model, [-0.1, 0, 0])
    if (event.keyCode == 72) mat4.translate(model, model, [0.1, 0, 0])
    if (event.keyCode == 84) mat4.translate(model, model, [0, 0, -0.1])
    if (event.keyCode == 71) mat4.translate(model, model, [0, 0, 0.1])
    if (event.keyCode == 82) mat4.translate(model, model, [0, 0.1, 0])
    if (event.keyCode == 89) mat4.translate(model, model, [0, -0.1, 0])

    if (event.keyCode == 65) mat4.translate(view, view, [-0.1, 0, 0])
    if (event.keyCode == 68) mat4.translate(view, view, [0.1, 0, 0])
    if (event.keyCode == 87) mat4.translate(view, view, [0, 0, -0.1])
    if (event.keyCode == 83) mat4.translate(view, view, [0, 0, 0.1])
    if (event.keyCode == 81) mat4.translate(view, view, [0, 0.1, 0])
    if (event.keyCode == 69) mat4.translate(view, view, [0, -0.1, 0])

    if (event.keyCode == 32) setConfig({ changeAnimation: true })
  })

  document.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) changeScale(0.5)
    if (event.deltaY < 0) changeScale(- 0.5)
  })

  let isDraging = false
  const position = {
    x: 0,
    y: 0,
  }
  document.addEventListener('mousedown', ({ clientX, clientY }) => {
    isDraging = true
    position.x = clientX
    position.y = clientY
  })
  document.addEventListener('mousemove', ({ clientX, clientY }) => {
    if (isDraging) {
      const movement = {
        y: (clientX - position.x) / (window.innerWidth / 0.25),
        x: (clientY - position.y) / (window.innerHeight / 0.25),
      }
      setConfig({ angles: movement })
    }
  })
  document.addEventListener('mouseup', () => {
    isDraging = false
  })
}
