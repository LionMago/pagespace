/* Directional, continuous flame field. No particle sprites or image overlays. */
window.createFireTransition = function (canvas, persistent = false) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false });
  if (!gl) return null;
  const vertex = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
  const fragment = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 resolution;
    uniform float time;
    uniform float emblem;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
    }
    float fbm(vec2 p){
      float n=0.,a=.53;
      for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.03+vec2(13.1,7.7);a*=.5;}
      return n;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution;
      float aspect=resolution.x/resolution.y;
      // Every layer travels upward, at different scales: broad rolls to thin tips.
      vec2 p=vec2(uv.x*aspect*7.,uv.y*2.5-time*2.9);
      float roll=fbm(p*.7);
      float flow=fbm(p+vec2((roll-.5)*2.8,roll*.7));
      float fine=fbm(p*2.7+vec2(flow*2.,-time*.7));
      if(emblem>.5){
        // Seven tapered tongues share a base; their tips bend independently.
        float shape=0.,core=0.;
        for(int i=0;i<7;i++){
          float id=float(i),seed=id*2.399;
          float height=.57+.12*sin(seed+1.)+.065*sin(time*2.2+seed)+.02*sin(time*5.3+seed);
          float q=(uv.y-.12)/height;
          float rise=clamp(q,0.,1.);
          float center=.17+id*.11;
          center+=pow(rise,1.3)*(.057*sin(time*1.9+seed-rise*4.)+.018*sin(time*4.1+seed));
          float width=(.103+.012*sin(seed))*pow(max(0.,1.-rise),1.25);
          width*=1.+.2*sin(rise*10.-time*4.+seed);
          center+=(fine-.5)*.018*rise;
          float distance=abs(uv.x-center);
          float tongue=(1.-smoothstep(max(0.,width-.009),width+.006,distance));
          tongue*=smoothstep(-.03,.04,q)*(1.-smoothstep(.96,1.,q));
          shape=max(shape,tongue);
          float inner=(1.-smoothstep(width*.15,width*.8+.001,distance))*(1.-rise);
          core=max(core,inner*tongue);
        }
        float detail=fbm(vec2(uv.x*24.,uv.y*9.-time*3.5));
        float heat=clamp(core*.95+detail*.28,0.,1.);
        vec3 color=mix(vec3(.94,.19,.018),vec3(1.,.52,.055),smoothstep(.05,.48,heat));
        color=mix(color,vec3(1.,.91,.59),smoothstep(.48,.94,heat));
        float alpha=shape*smoothstep(.08,.22,uv.y)*.96;
        gl_FragColor=vec4(color,alpha);return;
      }
      float front=-.42+time*.87;
      float tongues=pow(flow,2.)*.7+fine*.13;
      float edge=front-uv.y+tongues;
      // A moving, finite sheet of flame leaves the profile visible behind it.
      float band=smoothstep(-.012,.05,edge)*(1.-smoothstep(.27,.58,edge));
      float ridges=pow(clamp(flow*.65+fine*.65,0.,1.),2.2);
      float filaments=smoothstep(.26,.72,fbm(p*3.1+vec2(flow*3.,-time*.9)));
      float heat=clamp((.18+ridges*.9+filaments*.35)*band,0.,1.);
      vec3 red=vec3(.72,.055,.006), amber=vec3(1.,.36,.025), core=vec3(1.,.9,.58);
      vec3 color=mix(red,amber,smoothstep(.03,.5,heat));
      color=mix(color,core,smoothstep(.65,1.,heat));
      float flameAlpha=band*smoothstep(.03,.26,ridges);
      float curtain=1.-smoothstep(.3,.61,edge);
      float smoke=fbm(p*.5+4.)*.07*(1.-band);
      vec3 dark=vec3(.013,.016,.019)+smoke*vec3(.3,.24,.2);
      float light=exp(-abs(edge-.15)*12.)*.07;
      vec3 finalColor=mix(dark,color,flameAlpha)+light*vec3(1.,.32,.025);
      float alpha=max(curtain,flameAlpha);
      alpha*=1.-smoothstep(2.7,3.15,time);
      gl_FragColor=vec4(finalColor,alpha);
    }`;
  function compile(type, source) {
    const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(error);}
    return shader;
  }
  let program, buffer;
  try {
    const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    gl.deleteShader(vs);gl.deleteShader(fs);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  } catch(error) { console.warn('Fire renderer unavailable:',error.message); if(program)gl.deleteProgram(program); return null; }
  const size=gl.getUniformLocation(program,'resolution'),clock=gl.getUniformLocation(program,'time');
  gl.uniform1f(gl.getUniformLocation(program,'emblem'),persistent?1:0);
  let frame=0;
  function stop(){cancelAnimationFrame(frame);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}
  return {stop,play(done){
    stop();
    // Bound fill rate on high-DPI screens; smooth noise tolerates this resolution.
    const width=persistent?canvas.clientWidth:innerWidth,height=persistent?canvas.clientHeight:innerHeight;
    const ratio=persistent?Math.min(devicePixelRatio||1,1.5):Math.min(1,1100/innerWidth);
    canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
    gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(size,canvas.width,canvas.height);
    const start=performance.now();
    let previous=0;
    function draw(now){
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const t=persistent&&reduced?1.4:(now-start)/1000;
      if((!persistent&&t>=3.2)||gl.isContextLost()){stop();done();return;}
      if(persistent&&(document.hidden||canvas.closest('.screen').hidden||now-previous<33)){
        frame=requestAnimationFrame(draw);return;
      }
      previous=now;
      gl.uniform1f(clock,t);gl.drawArrays(gl.TRIANGLES,0,6);if(!persistent||!reduced)frame=requestAnimationFrame(draw);
    }
    draw(start);
  }};
};
