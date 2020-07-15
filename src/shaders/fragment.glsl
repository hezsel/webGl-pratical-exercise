precision mediump float;

const vec3 lightDirection = normalize(vec3(0, 1, 0));
const float ambient = 0.7;

varying vec3 vColor;
varying vec3 vNormal;

uniform mat4 normalMatrix;

void main() {
  vec3 worldNormal = (normalMatrix * vec4(vNormal, 1)).xyz;
  float diffuse = max(0.0, dot(worldNormal, lightDirection));
  float brightness = ambient + diffuse;

  vec3 color = vColor * brightness;
  gl_FragColor = vec4(color, 1);
}
