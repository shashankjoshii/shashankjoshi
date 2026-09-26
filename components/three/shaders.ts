// GLSL for the two 3D moments. No textures, no environment maps: the "reflections" are a
// gradient sampled along the reflection vector, so the material costs one draw call and no downloads.

/** Ashima 3D simplex noise, shared by both materials. */
const noise = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

/** A liquid sphere: the surface is displaced by two octaves of noise and lit as glossy blue glass. */
export const orbVertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform vec2 uPointer;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;
  ${noise}

  float disp(vec3 p) {
    // the pointer leans the noise field, so the surface swells toward the cursor
    vec3 q = p * 0.85 + vec3(uPointer * 0.5, uTime * 0.28);
    return (snoise(q) + 0.18 * snoise(p * 1.9 - uTime * 0.17)) * uAmp;
  }

  void main() {
    vec3 n = normalize(normal);
    vec3 t = normalize(abs(n.x) > abs(n.z) ? vec3(-n.y, n.x, 0.0) : vec3(0.0, -n.z, n.y));
    vec3 b = normalize(cross(n, t));
    float e = 0.012;

    vec3 p0 = position + n * disp(position);
    vec3 pt = normalize(position + t * e); pt += pt * disp(pt);
    vec3 pb = normalize(position + b * e); pb += pb * disp(pb);
    vec3 dn = normalize(cross(pt - p0, pb - p0));
    if (dot(dn, n) < 0.0) dn = -dn;

    vNoise = disp(position);
    vNormal = normalize(normalMatrix * dn);
    vec4 mv = modelViewMatrix * vec4(p0, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const orbFragment = /* glsl */ `
  uniform float uTime;
  uniform float uLight; // 0 = deep blue glass on white, 1 = pale glass on blue
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float ndv = max(dot(N, V), 0.0);
    float fres = pow(1.0 - ndv, 2.4);

    vec3 R = reflect(-V, N);
    float env = smoothstep(-0.7, 0.95, R.y);
    // a soft "window" reflection so the surface reads as glass, not a gradient
    float win = smoothstep(0.55, 0.62, R.x * 0.7 + R.y * 0.6) * smoothstep(0.98, 0.7, R.y);

    vec3 deep = vec3(0.02, 0.19, 1.0);
    vec3 mid  = vec3(0.20, 0.47, 1.0);
    vec3 pale = vec3(0.86, 0.92, 1.0);
    vec3 col = mix(deep, mid, env);
    col = mix(col, pale, pow(env, 3.0) * 0.75);

    // thin-film shimmer: shifts toward cyan and violet across the fresnel band and the noise field
    float film = sin(vNoise * 7.0 + fres * 5.0 + uTime * 0.6);
    col += vec3(-0.02, 0.20, 0.10) * fres * (0.5 + 0.5 * film);
    col += vec3(0.16, 0.0, 0.18) * fres * (0.5 - 0.5 * film) * 0.6;

    vec3 L = normalize(vec3(-0.45, 0.8, 0.55));
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 55.0);
    col += spec * 0.95 + win * 0.35;
    col = mix(col, vec3(0.72, 0.86, 1.0), fres * 0.5);

    // on a blue page the glass goes pale so it lifts off the ground instead of sinking into it
    col = mix(col, mix(pale, vec3(0.42, 0.68, 1.0), env * 0.55) + spec * 0.8 + fres * 0.15, uLight);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Rigid geometry (the knot): same lighting, no displacement. A slow ripple runs along the surface. */
export const solidVertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;
  void main() {
    vNoise = sin(position.x * 1.7 + position.y * 1.3 + position.z * 1.9 + uTime * 0.5) * 0.4;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
