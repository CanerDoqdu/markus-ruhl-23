"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
// @ts-expect-error three/examples is untyped
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
// @ts-expect-error three/examples is untyped
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils"

const BODY_PATH   = "/assets/trophy_body_opt.glb"
const PLINTH_PATH = "/assets/trophy_plinth_opt.glb"

/* Same tetrahedron fragmentation as three.js pointlights example */
function createGeometry(srcGeo: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = srcGeo.index ? srcGeo.toNonIndexed() : srcGeo.clone()
  const posAttr = geometry.getAttribute("position")

  const v0 = new THREE.Vector3()
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const v3 = new THREE.Vector3()
  const n  = new THREE.Vector3()
  const plane = new THREE.Plane()

  const verts: number[] = []
  const times: number[] = []
  const seeds: number[] = []
  const dNormals: number[] = []

  // Take every triangle - simple wireframe
  const step = 1

  for (let i = 0; i < posAttr.count; i += 3 * step) {
    if (i + 2 >= posAttr.count) break
    
    v0.fromBufferAttribute(posAttr, i)
    v1.fromBufferAttribute(posAttr, i + 1)
    v2.fromBufferAttribute(posAttr, i + 2)

    plane.setFromCoplanarPoints(v0, v1, v2)

    // No subdivision - keep original triangles
    v3.copy(v0).add(v1).add(v2).divideScalar(3)
    v3.add(n.copy(plane.normal).multiplyScalar(-0.001))

    // Original triangle only
    verts.push(v0.x,v0.y,v0.z, v1.x,v1.y,v1.z, v2.x,v2.y,v2.z)

    const t = Math.random()
    const s = Math.random()
    n.copy(plane.normal)

    for (let j = 0; j < 3; j++) { times.push(t); seeds.push(s) }
    dNormals.push(n.x,n.y,n.z, n.x,n.y,n.z, n.x,n.y,n.z)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
  geo.setAttribute("aTime", new THREE.Float32BufferAttribute(times, 1))
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1))
  geo.setAttribute("aDisplaceNormal", new THREE.Float32BufferAttribute(dNormals, 3))
  geo.computeVertexNormals()
  
  // Position-based vertex colors + barycentric for wireframe
  geo.computeBoundingSphere()
  const range = geo.boundingSphere!.radius * 2.0
  const colors: number[] = []
  const bary: number[] = []
  
  for (let i = 0; i < verts.length; i += 9) {
    // Each triangle's 3 vertices
    for (let j = 0; j < 3; j++) {
      const idx = i + j * 3
      const x = verts[idx]
      const y = verts[idx + 1]
      const z = verts[idx + 2]
      
      // Gold colors
      const intensity = (Math.abs(x / range) + Math.abs(y / range) + Math.abs(z / range)) / 3.0
      colors.push(0.82, 0.58, 0.12) // Rich warm gold
      
      // Barycentric coords for wireframe
      if (j === 0) bary.push(1, 0, 0)
      else if (j === 1) bary.push(0, 1, 0)
      else bary.push(0, 0, 1)
    }
  }
  
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geo.setAttribute("barycentric", new THREE.Float32BufferAttribute(bary, 3))
  
  geometry.dispose()
  return geo
}

/* Phong-like material with vertex displacement (same logic as example) */
function createMaterial(light1: THREE.PointLight, light2: THREE.PointLight) {
  const uniforms = {
    uTime:  { value: 0 },
    uL1:    { value: light1.position },
    uL2:    { value: light2.position },
    uC1:    { value: light1.color },
    uC2:    { value: light2.color },
    uInv:   { value: new THREE.Matrix4() },
  }

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      attribute float aTime;
      attribute float aSeed;
      attribute vec3 aDisplaceNormal;
      attribute vec3 color;
      attribute vec3 barycentric;
      uniform float uTime;
      uniform vec3 uL1, uL2;
      uniform mat4 uInv;
      varying vec3 vN, vW, vColor, vBary;
      varying float vDisplace;

      void main() {
        vN = normalize(normalMatrix * normal);
        vColor = color;
        vBary = barycentric;
        float lt = aTime + uTime;

        // light positions in model-local space
        vec3 l1 = (uInv * vec4(uL1, 1.0)).xyz;
        vec3 l2 = (uInv * vec4(uL2, 1.0)).xyz;

        // Subtle displacement
        float d1 = max(0.0, 2.0 - distance(position, l1)) / 30.0;
        float d2 = max(0.0, 2.0 - distance(position, l2)) / 30.0;
        float s = abs(sin(lt * 2.0 + aSeed) * 0.008) + d1 + d2;
        vDisplace = s;

        vec3 displaced = position + aDisplaceNormal * s;
        vec4 wp = modelMatrix * vec4(displaced, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform vec3 uL1, uL2;
      uniform vec3 uC1, uC2;
      varying vec3 vN, vW, vColor, vBary;
      varying float vDisplace;

      float edgeFactor() {
        // Big wireframe
        float minBary = min(min(vBary.x, vBary.y), vBary.z);
        return smoothstep(0.0, 0.03, minBary);
      }

      void main() {
        vec3 n = normalize(vN);
        vec3 viewDir = normalize(cameraPosition - vW);

        // Rich gold base
        vec3 c = vColor;

        // Lighting
        vec3 t1 = uL1 - vW;
        vec3 t2 = uL2 - vW;
        float att1 = 12.0 / (dot(t1, t1) + 1.0);
        float att2 = 12.0 / (dot(t2, t2) + 1.0);
        vec3 ld1 = normalize(t1);
        vec3 ld2 = normalize(t2);

        float diff1 = max(dot(n, ld1), 0.0);
        float diff2 = max(dot(n, ld2), 0.0);

        vec3 h1 = normalize(ld1 + viewDir);
        vec3 h2 = normalize(ld2 + viewDir);
        float spec1 = pow(max(dot(n, h1), 0.0), 80.0);
        float spec2 = pow(max(dot(n, h2), 0.0), 80.0);

        // Deep ambient for contrast
        c *= 0.12;
        // Warm diffuse
        c += vColor * 1.2 * diff1 * att1;
        c += vColor * 1.2 * diff2 * att2;
        // Gold specular (no white)
        vec3 specGold = vec3(0.75, 0.55, 0.15);
        c += specGold * spec1 * 0.3 * att1;
        c += specGold * spec2 * 0.3 * att2;
        // Fresnel rim for metallic sheen
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 4.0);
        c += vColor * fresnel * 0.10;

        // Black wireframe
        float edge = edgeFactor();
        c = mix(vec3(0.0), c, edge);

        gl_FragColor = vec4(c, 1.0);
      }
    `,
    side: THREE.FrontSide,
  })

  return { mat, uniforms }
}

/* Plinth material: simple colored material */
function createPlinthMaterial(light1: THREE.PointLight, light2: THREE.PointLight) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uL1: { value: light1.position },
      uL2: { value: light2.position },
    },
    vertexShader: /* glsl */`
      varying vec3 vN, vW;
      varying float vY;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vY = position.y;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uL1, uL2;
      varying vec3 vN, vW;
      varying float vY;
      void main() {
        vec3 n = normalize(vN);
        vec3 viewDir = normalize(cameraPosition - vW);

        vec3 t1 = uL1 - vW;
        vec3 t2 = uL2 - vW;
        float att1 = 16.0 / (dot(t1, t1) + 1.0);
        float att2 = 16.0 / (dot(t2, t2) + 1.0);
        vec3 ld1 = normalize(t1);
        vec3 ld2 = normalize(t2);

        float diff1 = max(dot(n, ld1), 0.0);
        float diff2 = max(dot(n, ld2), 0.0);

        // Specular for shine
        vec3 h1 = normalize(ld1 + viewDir);
        vec3 h2 = normalize(ld2 + viewDir);
        float spec1 = pow(max(dot(n, h1), 0.0), 80.0);
        float spec2 = pow(max(dot(n, h2), 0.0), 80.0);

        // Gradient from gold (top) to dark background (bottom)
        float gradientFactor = smoothstep(-2.0, 2.0, vY);
        vec3 goldBase = vec3(0.65, 0.42, 0.10);
        vec3 darkBase = vec3(0.04, 0.05, 0.08);
        vec3 base = mix(darkBase, goldBase, gradientFactor);
        
        vec3 c = base * 0.08;
        c += base * diff1 * 1.0 * att1;
        c += base * diff2 * 1.0 * att2;

        // Specular color also gradients
        vec3 goldSpec = vec3(0.80, 0.60, 0.18);
        vec3 darkSpec = vec3(0.15, 0.15, 0.20);
        vec3 specCol = mix(darkSpec, goldSpec, gradientFactor);
        c += specCol * spec1 * 0.35 * att1;
        c += specCol * spec2 * 0.35 * att2;

        // Strong fresnel rim
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
        c += base * fresnel * 0.15;

        gl_FragColor = vec4(c, 1.0);
      }
    `,
    side: THREE.FrontSide,
  })
}

const _invMat = new THREE.Matrix4()

export default function TrophyCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const w = el.clientWidth, h = el.clientHeight

    let _renderer: THREE.WebGLRenderer | null = null
    try {
      _renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      })
    } catch { return }
    if (!_renderer) return
    const renderer = _renderer

    const SCALE = 1.0
    renderer.setSize(w * SCALE, h * SCALE, false)
    renderer.domElement.style.width = w + 'px'
    renderer.domElement.style.height = h + 'px'
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const canvas = renderer.domElement
    let contextLost = false
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); contextLost = true })
    canvas.addEventListener("webglcontextrestored", () => { contextLost = false })

    const scene = new THREE.Scene()

    const cam = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
    cam.position.set(0, 0.5, 5)
    cam.lookAt(0, 0, 0)
    cam.updateMatrixWorld()

    // === 2 point lights - gold theme ===
    const sphereGeo = new THREE.SphereGeometry(0.05, 12, 6)

    const light1 = new THREE.PointLight(0xffd280, 1600)
    light1.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xffd280 })))
    scene.add(light1)

    const light2 = new THREE.PointLight(0xffbf60, 1200)
    light2.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xffbf60 })))
    scene.add(light2)

    // Subtle warm ambient
    scene.add(new THREE.AmbientLight(0xffd280, 0.03))

    // === Materials ===
    const { mat: bodyMat, uniforms } = createMaterial(light1, light2)
    const plinthMat = createPlinthMaterial(light1, light2)

    // === Trophy group ===
    const loader = new GLTFLoader()
    let mergedMesh: THREE.Mesh | null = null
    let plinthMesh: THREE.Mesh | null = null
    const trophyGroup = new THREE.Group()
    trophyGroup.scale.setScalar(0.8)
    trophyGroup.position.set(-0.03, -0.1, 0)
    trophyGroup.rotation.x = THREE.MathUtils.degToRad(5)

    let loaded = 0
    const bodyGeos: THREE.BufferGeometry[] = []
    const plinthGeos: THREE.BufferGeometry[] = []

    function onAllLoaded() {
      loaded++
      if (loaded < 2) return

      const combinedBox = new THREE.Box3()
      bodyGeos.forEach(g => { g.computeBoundingBox(); combinedBox.union(g.boundingBox!) })
      plinthGeos.forEach(g => { g.computeBoundingBox(); combinedBox.union(g.boundingBox!) })

      const size = new THREE.Vector3()
      combinedBox.getSize(size)
      const scaleFactor = 3.0 / Math.max(size.x, size.y, size.z)

      const center = new THREE.Vector3()
      combinedBox.getCenter(center)
      const tx = -center.x * scaleFactor
      const ty = -center.y * scaleFactor
      const tz = -center.z * scaleFactor

      if (bodyGeos.length > 0) {
        const bodyMerged = mergeGeometries(bodyGeos)
        if (bodyMerged) {
          bodyMerged.scale(scaleFactor, scaleFactor, scaleFactor)
          bodyMerged.translate(tx, ty, tz)
          mergedMesh = new THREE.Mesh(bodyMerged, bodyMat)
          mergedMesh.frustumCulled = false
          trophyGroup.add(mergedMesh)
        }
      }

      if (plinthGeos.length > 0) {
        const plinthMerged = mergeGeometries(plinthGeos)
        if (plinthMerged) {
          plinthMerged.scale(scaleFactor, scaleFactor, scaleFactor)
          plinthMerged.translate(tx, ty, tz)
          plinthMesh = new THREE.Mesh(plinthMerged, plinthMat)
          plinthMesh.frustumCulled = false
          trophyGroup.add(plinthMesh)
        }
      }

      bodyGeos.forEach(g => g.dispose())
      plinthGeos.forEach(g => g.dispose())
      scene.add(trophyGroup)
    }

    // Body: tetrahedron fragmentation
    loader.load(BODY_PATH, (gltf: { scene: THREE.Group }) => {
      gltf.scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          const fragGeo = createGeometry(m.geometry)
          m.updateWorldMatrix(true, false)
          fragGeo.applyMatrix4(m.matrixWorld)
          bodyGeos.push(fragGeo)
          m.geometry.dispose()
          if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose())
          else (m.material as THREE.Material).dispose()
        }
      })
      onAllLoaded()
    }, undefined, (err: Error) => { console.error("BODY load error:", err) })

    // Plinth: solid
    loader.load(PLINTH_PATH, (gltf: { scene: THREE.Group }) => {
      gltf.scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          const geo = m.geometry.clone()
          geo.computeVertexNormals()
          m.updateWorldMatrix(true, false)
          geo.applyMatrix4(m.matrixWorld)
          plinthGeos.push(geo)
          m.geometry.dispose()
          if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose())
          else (m.material as THREE.Material).dispose()
        }
      })
      onAllLoaded()
    }, undefined, (err: Error) => { console.error("PLINTH load error:", err) })

    // === Animation loop ===
    const clock = new THREE.Clock()
    let frameId = 0
    let isVisible = true
    let lastFrame = 0
    const FRAME_INTERVAL = 1 / 45 // cap 45fps for smoother animation

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(el)

    function animate() {
      frameId = requestAnimationFrame(animate)
      if (!isVisible || contextLost) return

      const now = clock.getElapsedTime()
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now

      const t = now * 0.5

      // slow rotation
      trophyGroup.rotation.y += 0.003
      trophyGroup.updateMatrixWorld()

      // orbit lights around trophy (same pattern as example)
      const r = 2.5
      light1.position.set(Math.sin(t) * r, Math.cos(t * 0.75) * 1.5, Math.cos(t * 0.5) * r)
      light2.position.set(-Math.sin(t) * r, -Math.cos(t * 0.75) * 1.5, -Math.cos(t * 0.5) * r)

      // update shader uniforms
      uniforms.uTime.value = t
      _invMat.copy(trophyGroup.matrixWorld).invert()
      uniforms.uInv.value.copy(_invMat)

      renderer.render(scene, cam)
    }
    animate()

    let resizeTimer = 0
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (!el) return
        const nw = el.clientWidth, nh = el.clientHeight
        cam.aspect = nw / nh
        cam.updateProjectionMatrix()
        renderer.setSize(nw * SCALE, nh * SCALE, false)
        renderer.domElement.style.width = nw + 'px'
        renderer.domElement.style.height = nh + 'px'
      }, 100)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(resizeTimer)
      observer.disconnect()
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      bodyMat.dispose()
      plinthMat.dispose()
      sphereGeo.dispose()
      if (mergedMesh) mergedMesh.geometry.dispose()
      if (plinthMesh) plinthMesh.geometry.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
