export const getRandomColor = () => '#000000'.replace(/0/g,() => (~~(Math.random()*16)).toString(16))

const convertHexToRGB = (hex) => {
  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);

  return [r/255, g/255, b/255]
}

export const generateColorArray = (arrayLength, vertexLength, { color, colorByTriangle }) => {
  const colorArray = []
  const colorRGB = convertHexToRGB(color)
  if (!colorByTriangle) {
    for (let i = 0; i < arrayLength/vertexLength; i++) colorArray.push(...colorRGB)
  } else {
    for (let i = 0; i < arrayLength/vertexLength; i++) {
      colorArray.push(...convertHexToRGB(getRandomColor()))
    }
  }

  return colorArray
}

export const loadResource = (type, path) => fetch(path)
  .then((res) => {
    return res[type]()
  })

export const getDefaultModels = async () => {
  const cube = await loadResource('json', 'src/models/cube.json')
  const sphere = await loadResource('json', 'src/models/sphere.json')
  const cylinder = await loadResource('json', 'src/models/cylinder.json')
  const cone = await loadResource('json', 'src/models/cone.json')

  return {
    cube,
    sphere,
    cylinder,
    cone,
  }
}
