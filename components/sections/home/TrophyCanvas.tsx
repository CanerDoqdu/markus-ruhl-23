"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
// @ts-expect-error — three/examples is untyped
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
// @ts-expect-error — three/examples is untyped
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils"

const BODY_PATH   = "/assets/trophy_body_opt.glb"
const PLINTH_PATH = "/assets/trophy_plinth_opt.glb"

/* ── Tessellate into tetrahedra with gap shrinkage ── */
function createFragmentGeometry(srcGeo: THREE.BufferGeometry): THREE.BufferGeometry {
  const src = srcGeo.index ? srcGeo.toNonIndexed() : srcGeo.clone()
  src.computeVertexNormals()
  const p = src.getAttribute("position")
  const triCount = Math.floor(p.count / 3)
  const totalVerts = triCount * 12
  const positions = new Float32Array(totalVerts * 3)
  const timeArr   = new Float32Array(totalVerts)
  const seedArr   = new Float32Array(totalVerts)
  const dnArr     = new Float32Array(totalVerts * 3)

  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3()
  const v3 = new THREE.Vector3(), norm = new THREE.Vector3()
  const plane = new THREE.Plane()
  const SHRINK = 0.88
  let vi = 0, ai = 0

  for (let i = 0; i < p.count; i += 3) {
    v0.fromBufferAttribute(p, i)
    v1.fromBufferAttribute(p, i + 1)
    v2.fromBufferAttribute(p, i + 2)
    plane.setFromCoplanarPoints(v0, v1, v2)
    v3.copy(v0).add(v1).add(v2).divideScalar(3)
    v3.add(norm.copy(plane.normal).multiplyScalar(-0.08))

    const cx = (v0.x + v1.x + v2.x + v3.x) * 0.25
    const cy = (v0.y + v1.y + v2.y + v3.y) * 0.25
    const cz = (v0.z + v1.z + v2.z + v3.z) * 0.25

    const faces = [v0,v1,v2, v3,v1,v0, v3,v2,v1, v3,v0,v2]
    const t = Math.random(), s = Math.random()
    const nx = plane.normal.x, ny = plane.normal.y, nz = plane.normal.z

    for (let f = 0; f < 12; f++) {
      const vert = faces[f]
      positions[vi]     = cx + (vert.x - cx) * SHRINK
      positions[vi + 1] = cy + (vert.y - cy) * SHRINK
      positions[vi + 2] = cz + (vert.z - cz) * SHRINK
      dnArr[vi]     = nx
      dnArr[vi + 1] = ny
      dnArr[vi + 2] = nz
      vi += 3
      timeArr[ai] = t
      seedArr[ai] = s
      ai++
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geo.setAttribute("aTime", new THREE.BufferAttribute(timeArr, 1))
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seedArr, 1))
  geo.setAttribute("aDisplaceNormal", new THREE.BufferAttribute(dnArr, 3))
  geo.computeVertexNormals()
  src.dispose()
  return geo
}

/* ── Shared uniforms — both materials reference the same objects ── */
const sharedUniforms = {
  uTime: { value: 0 },
  uL1:   { value: new THREE.Vector3() },
  uL2:   { value: new THREE.Vector3() },
  uC1:   { value: new THREE.Color(0xffff92) },
  uC2:   { value: new THREE.Color(0x5867b6) },
}

/* ── Fragment shader material (body) ── */
function createMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...sharedUniforms,
      uInv: { value: new THREE.Matrix4() },
    },
    vertexShader: /* glsl */ `
      attribute float aTime;
      attribute float aSeed;
      attribute vec3 aDisplaceNormal;
      uniform float uTime;
      uniform vec3 uL1, uL2;
      uniform mat4 uInv;
      varying vec3 vN, vW;
      varying float vD;
      void main() {
        vN = normalize(normalMatrix * normal);
        float lt = aTime + uTime;
        vec3 l1 = (uInv * vec4(uL1,1.0)).xyz;
        vec3 l2 = (uInv * vec4(uL2,1.0)).xyz;
        float r = 0.8;
        float d1 = max(0.0, r - distance(position,l1)) / 15.0;
        float d2 = max(0.0, r - distance(position,l2)) / 15.0;
        float s = abs(sin(lt*2.0+aSeed)*0.015) + d1 + d2;
        vD = s;
        vec4 wp = modelMatrix * vec4(position + aDisplaceNormal * s, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uL1, uL2, uC1, uC2;
      varying vec3 vN, vW;
      varying float vD;
      void main() {
        vec3 n = normalize(vN);
        vec3 viewDir = normalize(cameraPosition - vW);
        vec3 reflDir = reflect(-viewDir, n);
        float fresnel = 1.0 - max(dot(n, viewDir), 0.0);
        fresnel *= fresnel; // pow 2.0 without pow()

        vec3 t1 = uL1-vW, t2 = uL2-vW;
        float a1 = 60.0/(dot(t1,t1)+1.0);
        float a2 = 60.0/(dot(t2,t2)+1.0);
        vec3 ld1 = normalize(t1), ld2 = normalize(t2);

        float diff1 = max(dot(n, ld1), 0.0);
        float diff2 = max(dot(n, ld2), 0.0);

        vec3 h1 = normalize(ld1 + viewDir);
        vec3 h2 = normalize(ld2 + viewDir);
        float spec1 = pow(max(dot(n, h1), 0.0), 64.0);
        float spec2 = pow(max(dot(n, h2), 0.0), 64.0);

        vec3 c = vec3(0.005, 0.006, 0.01);
        vec3 goldTint = vec3(1.0, 0.85, 0.4);
        c += uC1 * goldTint * diff1 * 0.15 * a1;
        c += uC2 * goldTint * diff2 * 0.08 * a2;

        vec3 specColor = vec3(1.0, 0.95, 0.7);
        c += specColor * spec1 * 0.5 * a1;
        c += specColor * spec2 * 0.3 * a2;

        // Fake env reflection
        float y = reflDir.y * 0.5 + 0.5;
        vec3 sky = mix(vec3(0.01, 0.015, 0.04), vec3(0.03, 0.04, 0.08), y);
        sky += vec3(0.08, 0.07, 0.12) * exp(-abs(reflDir.y) * 8.0) * 0.15;
        c += sky * goldTint * (0.15 + fresnel * 0.3);

        vec3 rimColor = uC1 * a1 * 0.6 + uC2 * a2 * 0.4;
        c += rimColor * fresnel * 0.35;
        c += rimColor * smoothstep(0.0, 0.12, vD) * 0.1;

        c *= 0.95 + 0.05 * sin(uTime * 1.5);
        c = c * (2.51 * c + 0.03) / (c * (2.43 * c + 0.59) + 0.14);
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }
    `,
    side: THREE.FrontSide,
  })
}

/* ── Solid plinth material — same lighting, no displacement ── */
function createPlinthMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { ...sharedUniforms },
    vertexShader: /* glsl */ `
      varying vec3 vN, vW;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uL1, uL2, uC1, uC2;
      varying vec3 vN, vW;
      void main() {
        vec3 n = normalize(vN);
        vec3 viewDir = normalize(cameraPosition - vW);
        vec3 reflDir = reflect(-viewDir, n);
        float fresnel = 1.0 - max(dot(n, viewDir), 0.0);
        fresnel = fresnel * fresnel * fresnel; // pow 3.0

        vec3 t1 = uL1-vW, t2 = uL2-vW;
        float a1 = 60.0/(dot(t1,t1)+1.0);
        float a2 = 60.0/(dot(t2,t2)+1.0);
        vec3 ld1 = normalize(t1), ld2 = normalize(t2);

        float diff1 = max(dot(n, ld1), 0.0);
        float diff2 = max(dot(n, ld2), 0.0);

        vec3 h1 = normalize(ld1 + viewDir);
        vec3 h2 = normalize(ld2 + viewDir);
        float spec1 = pow(max(dot(n, h1), 0.0), 80.0);
        float spec2 = pow(max(dot(n, h2), 0.0), 80.0);

        vec3 c = vec3(0.008, 0.009, 0.015);
        vec3 goldTint = vec3(1.0, 0.85, 0.4);
        c += uC1 * goldTint * diff1 * 0.18 * a1;
        c += uC2 * goldTint * diff2 * 0.10 * a2;

        vec3 specColor = vec3(1.0, 0.95, 0.7);
        c += specColor * spec1 * 0.6 * a1;
        c += specColor * spec2 * 0.35 * a2;

        float y = reflDir.y * 0.5 + 0.5;
        vec3 env = mix(vec3(0.01, 0.015, 0.04), vec3(0.03, 0.04, 0.08), y) * goldTint;
        c += env * (0.1 + fresnel * 0.25);

        vec3 rimColor = uC1 * a1 * 0.5 + uC2 * a2 * 0.5;
        c += rimColor * fresnel * 0.15;

        c *= 0.95 + 0.05 * sin(uTime * 1.5);
        c = c * (2.51 * c + 0.03) / (c * (2.43 * c + 0.59) + 0.14);
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }
    `,
    side: THREE.FrontSide,
  })
}

// Reusable statics — zero per-frame allocation
const _invMat = new THREE.Matrix4()
const _lp1 = new THREE.Vector3()
const _lp2 = new THREE.Vector3()

export default function TrophyCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const w = el.clientWidth, h = el.clientHeight

    // --- Renderer: max performance ---
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      stencil: false,        // unused → save GPU memory
      depth: true,
    })
    renderer.setSize(w, h)
    renderer.setPixelRatio(1) // always 1x — biggest perf win on HiDPI
    renderer.autoClear = true
    renderer.sortObjects = false // we have 2 opaque objects, skip sort
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.matrixAutoUpdate = false // we manage matrices manually

    const cam = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
    cam.position.set(0, 0.5, 5)
    cam.lookAt(0, 0, 0)
    cam.updateMatrixWorld()

    // --- Light indicator spheres ---
    const sg = new THREE.SphereGeometry(0.04, 3, 2)
    const lm1 = new THREE.MeshBasicMaterial({ color: 0xffff92 })
    const lm2 = new THREE.MeshBasicMaterial({ color: 0x5867b6 })
    const light1Mesh = new THREE.Mesh(sg, lm1)
    const light2Mesh = new THREE.Mesh(sg, lm2)
    light1Mesh.matrixAutoUpdate = true
    light2Mesh.matrixAutoUpdate = true
    scene.add(light1Mesh, light2Mesh)

    const mat = createMaterial()
    const plinthMat = createPlinthMaterial()

    // Pre-compile shaders while loading models (GPU warm-up)
    renderer.compile(scene, cam)

    const loader = new GLTFLoader()
    let mergedMesh: THREE.Mesh | null = null
    let plinthMesh: THREE.Mesh | null = null
    const trophyGroup = new THREE.Group()
    trophyGroup.scale.setScalar(0.8)
    trophyGroup.position.set(0, -0.1, 0)
    trophyGroup.rotation.x = THREE.MathUtils.degToRad(5)
    trophyGroup.matrixAutoUpdate = true

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
      const maxDim = Math.max(size.x, size.y, size.z)
      const scaleFactor = 3.0 / maxDim

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
          mergedMesh = new THREE.Mesh(bodyMerged, mat)
          mergedMesh.frustumCulled = false
          mergedMesh.matrixAutoUpdate = false
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
          plinthMesh.matrixAutoUpdate = false
          trophyGroup.add(plinthMesh)
        }
      }

      bodyGeos.forEach(g => g.dispose())
      plinthGeos.forEach(g => g.dispose())
      scene.add(trophyGroup)

      // Force shader compile with actual geometry now
      renderer.compile(scene, cam)
    }

    // Body — fragmented
    loader.load(BODY_PATH, (gltf: { scene: THREE.Group }) => {
      gltf.scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          const fragGeo = createFragmentGeometry(m.geometry)
          m.updateWorldMatrix(true, false)
          fragGeo.applyMatrix4(m.matrixWorld)
          bodyGeos.push(fragGeo)
          m.geometry.dispose()
          if (Array.isArray(m.material)) m.material.forEach(mt => mt.dispose())
          else (m.material as THREE.Material).dispose()
        }
      })
      onAllLoaded()
    }, undefined, (err: Error) => { console.error('BODY load error:', err) })

    // Plinth — solid (keep index buffer for GPU vertex cache)
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
    }, undefined, (err: Error) => { console.error('PLINTH load error:', err) })

    // --- Animation loop ---
    const clock = new THREE.Clock()
    let frameId = 0
    let isVisible = true

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(el)

    function animate() {
      frameId = requestAnimationFrame(animate)
      if (!isVisible) return

      const t = clock.getElapsedTime() * 0.5
      trophyGroup.rotation.y += 0.003
      trophyGroup.updateMatrixWorld()

      const r = 2.5
      _lp1.set(Math.sin(t) * r, Math.cos(t * 0.75) * 1.5, Math.cos(t * 0.5) * r)
      _lp2.set(-Math.sin(t) * r, -Math.cos(t * 0.75) * 1.5, -Math.cos(t * 0.5) * r)
      light1Mesh.position.copy(_lp1)
      light2Mesh.position.copy(_lp2)

      // Shared uniforms — written once, both materials see it
      sharedUniforms.uTime.value = t
      sharedUniforms.uL1.value.copy(_lp1)
      sharedUniforms.uL2.value.copy(_lp2)

      _invMat.copy(trophyGroup.matrixWorld).invert()
      mat.uniforms.uInv.value.copy(_invMat)

      renderer.render(scene, cam)
    }
    animate()

    // Debounced resize — avoids layout thrash
    let resizeTimer = 0
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (!el) return
        const nw = el.clientWidth, nh = el.clientHeight
        cam.aspect = nw / nh
        cam.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      }, 100)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(resizeTimer)
      observer.disconnect()
      window.removeEventListener("resize", onResize)
      renderer.dispose()
      sg.dispose()
      lm1.dispose()
      lm2.dispose()
      mat.dispose()
      plinthMat.dispose()
      if (mergedMesh) mergedMesh.geometry.dispose()
      if (plinthMesh) plinthMesh.geometry.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
