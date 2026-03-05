precision mediump float;
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;
void main(){
  vec2 uv = vUv + vec2(sin(vUv.y * 16.0 + uTime) * 0.004, 0.0);
  vec4 col = texture2D(uTexture, uv);
  float glow = smoothstep(0.4, 1.0, col.a);
  gl_FragColor = vec4(col.rgb + glow * vec3(0.0, 0.9, 1.0), col.a);
}
