const getRamdomColor = () => [Math.random(), Math.random(), Math.random()]

const colors = {
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
}

export const generateColorArray = (arrayLength, vertexLength, colorValue = null) => {
  const colorArray = []
  let colorRGB = []
  if (colorValue === 'ramdom') colorRGB = getRamdomColor()
  else colorRGB = colors[colorValue]
  for (let i = 0; i < arrayLength/vertexLength; i++) colorArray.push(...colorRGB)

  return colorArray
}

export const resizeCanvasToFullscreen = (canvas) => {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
}
