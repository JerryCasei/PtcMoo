export class WebGLBackdrop {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    this.uniforms = { time: 0, resolution: [1, 1], intensity: 0.35, pointerSpeed: 0 };
    if (this.gl) this.init();
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  init() {
    const gl = this.gl;
    const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);} `;
    const frag = `precision mediump float;
    uniform vec2 uRes; uniform float uTime; uniform float uIntensity; uniform float uSpeed;
    float noise(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
    void main(){
      vec2 uv=gl_FragCoord.xy/uRes;
      float g=sin((uv.x+uTime*0.07)*8.)*0.08 + sin((uv.y-uTime*0.05)*10.)*0.08;
      float scan=sin((uv.y+uTime*0.1)*uRes.y*0.03)*0.03;
      float n=noise(uv*vec2(130.,80.)+uTime*0.3)*0.06;
      vec3 c=vec3(0.14+g,0.18+g*1.6,0.32+g*2.) + vec3(0.06,0.0,0.1)*sin(uTime*0.5+uv.x*3.);
      c += (scan+n)*(uIntensity + uSpeed*0.4);
      gl_FragColor=vec4(c,0.35);
    }`;
    const compile = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    this.program = program;
    this.pos = gl.getAttribLocation(program, 'p');
    this.uRes = gl.getUniformLocation(program, 'uRes');
    this.uTime = gl.getUniformLocation(program, 'uTime');
    this.uIntensity = gl.getUniformLocation(program, 'uIntensity');
    this.uSpeed = gl.getUniformLocation(program, 'uSpeed');
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  }

  resize() {
    const dpr = devicePixelRatio || 1;
    this.canvas.width = innerWidth * dpr; this.canvas.height = innerHeight * dpr;
    this.canvas.style.width = `${innerWidth}px`; this.canvas.style.height = `${innerHeight}px`;
    this.uniforms.resolution = [this.canvas.width, this.canvas.height];
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setIntensity(v) { this.uniforms.intensity = v; }
  setPointerSpeed(v) { this.uniforms.pointerSpeed = v; }

  draw(time) {
    if (!this.gl) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.pos);
    gl.vertexAttribPointer(this.pos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2fv(this.uRes, this.uniforms.resolution);
    gl.uniform1f(this.uTime, time * 0.001);
    gl.uniform1f(this.uIntensity, this.uniforms.intensity);
    gl.uniform1f(this.uSpeed, this.uniforms.pointerSpeed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  start() {
    const raf = (t) => { this.draw(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
