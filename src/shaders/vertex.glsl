precision mediump float;

attribute vec3 position;
attribute vec3 color;
attribute vec3 normal;

varying vec3 vColor;
varying vec3 vNormal;

uniform mat4 matrix;

void main() {
  vColor = color;
  vNormal = normal;

  gl_Position = matrix * vec4(position, 1);
}
