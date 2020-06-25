export default `
precision mediump float;

varying vec3 vColor;
varying float vBrightness;

void main() {
  vec3 color = vColor * vBrightness;
  gl_FragColor = vec4(color, 1);
}
`
