precision mediump float;
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
void main(){
  float n = hash(vUv * 240.0 + uTime);
  gl_FragColor = vec4(vec3(n * 0.08), 1.0);
}
