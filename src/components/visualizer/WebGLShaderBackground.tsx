import React, { useEffect, useRef } from 'react';
import { InterviewPhase } from '../../types';

interface WebGLShaderBackgroundProps {
  currentPhase?: InterviewPhase;
  speakingState?: 'AI' | 'CANDIDATE' | 'IDLE' | 'TEST_PASS';
}

export const WebGLShaderBackground: React.FC<WebGLShaderBackgroundProps> = ({
  currentPhase = 'LANDING',
  speakingState = 'IDLE',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for low-power or mobile devices
    const isMobile = window.innerWidth < 768;

    function syncSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const w = canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.parentElement?.clientHeight || window.innerHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas.parentElement);
    }
    syncSize();

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    // "THE INTERVYN FIELD" — Precision Architectural Environment Shader
    // Base Canvas: #080A0D | Secondary Atmosphere: #0D1217
    // Primary Indicator: #22D3EE (Cyan 6%) | Secondary Bounce: #8B5CF6 (Violet 2%) | Neutral (92%)
    const fs = `
precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_phase;
uniform float u_light_state;

// Hash for sparse Data Dust
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = (u_mouse / u_resolution.xy - 0.5) * 0.02; // Ultra-subtle 1-3px parallax
    
    vec2 p = st - 0.5 + mouse;
    p.x *= u_resolution.x / max(1.0, u_resolution.y);
    
    // Base Obsidian & Secondary Atmosphere Colors (#080A0D & #0D1217)
    vec3 baseBg = vec3(0.031, 0.039, 0.051); // #080A0D
    vec3 atmosBg = vec3(0.051, 0.071, 0.090); // #0D1217
    
    // Extremely subtle light falloff & background atmosphere
    float distCenter = length(p * vec2(0.8, 1.2));
    float atmosphere = smoothstep(1.2, 0.0, distCenter);
    vec3 color = mix(baseBg, atmosBg, atmosphere * 0.4);
    
    // --------------------------------------------------
    // SIGNATURE ELEMENT: ARCHITECTURAL FIELD SHELL
    // --------------------------------------------------
    // Large curved architectural shell / spatial contour plane
    float shellRadius = 1.4 + sin(u_time * 0.08) * 0.05;
    vec2 shellCenter = vec2(0.15, -0.4) + mouse * 1.5;
    float dShell = length(p - shellCenter);
    
    // Thin precision contour arcs
    float contourArc = smoothstep(0.003, 0.0, abs(dShell - shellRadius));
    float contourArcInner = smoothstep(0.002, 0.0, abs(dShell - (shellRadius - 0.35)));
    
    // Restrained cyan instrument accent (#22D3EE)
    vec3 cyan = vec3(0.133, 0.827, 0.933);
    // Restrained violet bounce (#8B5CF6)
    vec3 violet = vec3(0.545, 0.361, 0.965);
    
    // Spatial occlusion light falloff on shell curve
    float shellLight = smoothstep(shellRadius + 0.1, shellRadius - 0.3, dShell) * 0.05;
    color += shellLight * atmosBg;
    color += (contourArc * 0.07 + contourArcInner * 0.03) * cyan;
    
    // --------------------------------------------------
    // PRECISION FIELD GRID (Only 5-10% Visible)
    // --------------------------------------------------
    vec2 gridUV = (p + vec2(0.0, u_time * 0.005)) * 14.0;
    vec2 gridFract = abs(fract(gridUV - 0.5) - 0.5);
    float gridLine = min(gridFract.x, gridFract.y);
    float gridPattern = smoothstep(0.015, 0.0, gridLine);
    
    // Fade out grid line density into darkness
    float gridVisibility = smoothstep(0.9, 0.1, length(p)) * 0.035;
    
    // Coding Phase Precision Geometry: Coordinate tick markers
    if (u_phase > 2.5 && u_phase < 4.5) {
        gridVisibility *= 1.4;
        float tick = step(0.98, fract(gridUV.x * 2.0)) * step(0.98, fract(gridUV.y * 2.0));
        color += tick * cyan * 0.04;
    }
    
    color += gridPattern * gridVisibility * mix(vec3(0.3, 0.4, 0.5), cyan, 0.2);
    
    // --------------------------------------------------
    // DATA DUST PARTICLES (Extremely Sparse & Low Density)
    // --------------------------------------------------
    vec2 dustUV = (p + mouse * 0.5) * 22.0;
    vec2 dustId = floor(dustUV);
    vec2 dustFract = fract(dustUV) - 0.5;
    
    float dustHash = hash(dustId);
    if (dustHash > 0.94) { // Only ~6% of cells contain tiny data dust
        float dustOffset = u_time * (0.05 + dustHash * 0.05);
        vec2 particlePos = vec2(sin(dustOffset + dustHash * 6.28), cos(dustOffset * 0.7)) * 0.3;
        float particleDist = length(dustFract - particlePos);
        float particle = smoothstep(0.04, 0.0, particleDist) * (0.15 + dustHash * 0.2);
        
        // Convergence light tint towards console
        vec3 dustColor = mix(vec3(0.5, 0.6, 0.7), cyan, dustHash);
        color += particle * dustColor * 0.4;
    }
    
    // --------------------------------------------------
    // DYNAMIC LIGHT BEHAVIOR (State-Driven Ambient Illumination)
    // --------------------------------------------------
    // u_light_state: 0.0 (Idle), 1.0 (AI Speaking), 2.0 (Candidate Speaking), 3.0 (Test Pass)
    float consoleGlow = smoothstep(0.65, 0.0, length(p - vec2(0.2, 0.0)));
    
    if (u_light_state > 0.5 && u_light_state < 1.5) { // AI Speaking
        color += consoleGlow * cyan * 0.06;
    } else if (u_light_state > 1.5 && u_light_state < 2.5) { // Candidate Speaking
        color += consoleGlow * mix(cyan, violet, 0.4) * 0.05;
    } else if (u_light_state > 2.5) { // Code Test Pass (Mint Pulse #10B981)
        vec3 mint = vec3(0.062, 0.725, 0.505);
        color += consoleGlow * mint * 0.08;
    }
    
    // Subtle secondary violet bounce on bottom left (2% proportion)
    float violetBounce = smoothstep(1.0, 0.0, length(p - vec2(-0.8, -0.6))) * 0.02;
    color += violetBounce * violet;
    
    // Intimate darkening in interview & coding room
    if (u_phase > 1.5 && u_phase < 4.5) {
        color *= 0.82; // Quieter, darker chamber feel
    }
    
    gl_FragColor = vec4(color, 1.0);
}`;

    function compileShader(glCtx: WebGLRenderingContext, type: number, src: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, src);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.warn('WebGL compile error:', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vs);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('WebGL link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, 'a_position');
    if (pos >= 0) {
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    }

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uPhase = gl.getUniformLocation(program, 'u_phase');
    const uLightState = gl.getUniformLocation(program, 'u_light_state');

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Map currentPhase string to numeric phase value for GLSL shader progression
    // LANDING (0.0) -> RESUME (1.0) -> INTERVIEW (2.0) -> CODING (3.0) -> REPORT (4.0)
    const getPhaseValue = (phase: InterviewPhase): number => {
      switch (phase) {
        case 'LANDING':
          return 0.0;
        case 'RESUME_UPLOAD':
        case 'RESUME_ANALYZING':
        case 'ROLE_SETUP':
        case 'BLUEPRINT_READY':
          return 1.0;
        case 'QUESTION_VOICE':
        case 'LISTENING':
        case 'TRANSCRIBING':
        case 'EVALUATING':
        case 'BEHAVIORAL_ROUND':
        case 'MCQ_ROUND':
          return 2.0;
        case 'CODING_TRANSITION':
        case 'CODING_ARENA':
        case 'RUNNING_TESTS':
        case 'SUBMITTING_HIDDEN':
          return 3.0;
        case 'FINAL_EVALUATION':
        case 'REPORT':
          return 4.0;
        default:
          return 0.0;
      }
    };

    const getLightStateValue = (speaking: string): number => {
      switch (speaking) {
        case 'AI':
          return 1.0;
        case 'CANDIDATE':
          return 2.0;
        case 'TEST_PASS':
          return 3.0;
        default:
          return 0.0;
      }
    };

    let animationFrameId: number;
    let isTabActive = true;

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    function render(t: number) {
      if (!gl || !canvas || !program) return;

      if (isTabActive) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
        if (uPhase) gl.uniform1f(uPhase, getPhaseValue(currentPhase));
        if (uLightState) gl.uniform1f(uLightState, getLightStateValue(speakingState));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [currentPhase, speakingState]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
