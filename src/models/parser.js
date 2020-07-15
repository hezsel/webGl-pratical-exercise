const fullTrim = string => string
  .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'')
  .replace(/\s+/g,' ') 


const parseFloatN = (string) => {
  let value = parseFloat(string)
  if (isNaN(value)) value = 0
  return value
}

const parseIntN = (string) => {
  let value = parseInt(string)
  if (isNaN(value)) value = 0
  return value
}

export default (data) => {
  const lines = data.split('\n')
  const v = [], vt = [], vn = [], f = []
  for (let line of lines) {
    line = fullTrim(line).split(' ')
    switch (line[0]){
      case 'v':
        if (line.length >= 4){
          v.push([parseFloatN(line[1]), parseFloatN(line[2]), parseFloatN(line[3])])
        }
        break
      case 'vt':
        if (line.length >= 3){
          vt.push([parseFloatN(line[1]), parseFloatN(line[2])])
        }
        break
      case 'vn':
        if (line.length === 4){
          vn.push([parseFloatN(line[1]), parseFloatN(line[2]), parseFloatN(line[3])])
        }
        break
      case 'f':
        if (line.length === 4){
          const f1 = line[1].split('/')
          const f2 = line[2].split('/')
          const f3 = line[3].split('/')
          const parseFace = (face) => {
            const index = { v:0, vt:0, vn:0 }
            if (face.length >= 1){
              index.v = parseIntN(face[0]-1)
            }
            if ( face.length === 3 ) {
              index.vt = parseIntN(face[1]-1)
              index.vn = parseIntN(face[2]-1)
            }
            return index
          }
          f.push(parseFace(f1))
          f.push(parseFace(f2))
          f.push(parseFace(f3))
        }
        break
    }
  }
  const result = {
    vertexes: [],
    normals: [],
  }
  for (let i = 0; i < f.length; i++){
    result.vertexes.push(v[f[i].v][0], v[f[i].v][1], v[f[i].v][2])
    result.normals.push(vn[f[i].vn][0], vn[f[i].vn][1], vn[f[i].vn][2])
  }

  return result
}
