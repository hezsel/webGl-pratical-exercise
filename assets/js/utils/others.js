const getRamdomColor = () => [Math.random(), Math.random(), Math.random()]

const convertHexToRGB = (hex) => {
  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);

  return [r/255, g/255, b/255]
}

export const generateColorArray = (arrayLength, vertexLength, color = 'ramdom') => {
  const colorArray = []
  let colorRGB = []
  if (color === 'ramdom') colorRGB = getRamdomColor()
  else colorRGB = convertHexToRGB(color)
  for (let i = 0; i < arrayLength/vertexLength; i++) colorArray.push(...colorRGB)

  return colorArray
}

export const loadResource = (type, path) => fetch(path)
  .then((res) => {
    return res[type]()
  })

export const getDefaultModels = async () => {
  const cube = await loadResource('json', 'assets/models/cube.json')
  const sphere = await loadResource('json', 'assets/models/sphere.json')
  const cylinder = await loadResource('json', 'assets/models/cylinder.json')
  const cone = await loadResource('json', 'assets/models/cone.json')

  return {
    cube,
    sphere,
    cylinder,
    cone,
  }
}

export const resizeCanvasToFullscreen = (canvas) => {
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
}
