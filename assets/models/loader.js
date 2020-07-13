import parseObjFile from '../js/utils/parser.js'

const modelList = document.getElementById('model-list')

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

export default loadModels
