export class WebGLFx {
  constructor(canvas, sourceCanvas, config) {
    this.canvas = canvas;
    this.source = sourceCanvas;
    this.config = config;
    this.gl = canvas.getContext('webgl');
    this.init();
    this.resize();
  }

  setConfig(config) { this.config = config; }

  init() {
    const gl = this.gl;
    const vs = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv=(aPos+1.0)*0.5; gl_Position=vec4(aPos,0.,1.);} `;
    const fs = `precision mediump float;
      uniform sampler2D uTex; uniform vec2 uRes; uniform float uBloom; uniform float uBlur; uniform float uChromatic; uniform float uScanline;
      varying vec2 vUv;
      void main(){
        vec2 uv=vUv;
        vec2 off = vec2(uChromatic*0.01,0.0);
        float n = sin(uv.y*uRes.y*0.18)*uScanline*0.06;
        vec4 c;
        c.r = texture2D(uTex, uv+off).r;
        c.g = texture2D(uTex, uv).g;
        c.b = texture2D(uTex, uv-off).b;
        c.a = 1.0;
        vec4 blur = texture2D(uTex, uv+vec2(uBlur*0.006,0.0))*0.25 + texture2D(uTex, uv-vec2(uBlur*0.006,0.0))*0.25;
        c.rgb = mix(c.rgb, blur.rgb, uBlur);
        c.rgb += c.rgb*uBloom*0.25;
        c.rgb += n;
        gl_FragColor = c;
      }`;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    this.program = pr;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  resize() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
    gl.uniform2f(gl.getUniformLocation(this.program, 'uRes'), this.canvas.width, this.canvas.height);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uBloom'), this.config.bloom);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uBlur'), this.config.motionBlur);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uChromatic'), this.config.chromatic);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uScanline'), this.config.scanline);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
