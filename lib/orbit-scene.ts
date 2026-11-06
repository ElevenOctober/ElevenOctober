import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

type Pose = { x: number; y: number; z: number; rotation: number }

const poses: Pose[] = [
  { x: 0, y: 0, z: 8.3, rotation: 0.02 },
  { x: 0, y: 0, z: 8.3, rotation: 0.02 },
  { x: 1.05, y: 0.05, z: 8.4, rotation: 0.09 },
  { x: 0.62, y: -0.12, z: 8.6, rotation: 0.2 },
  { x: 0.08, y: 0.1, z: 8.8, rotation: 0.34 },
  { x: -0.48, y: -0.05, z: 9, rotation: 0.48 },
  { x: -0.9, y: 0.04, z: 9.25, rotation: 0.62 },
  { x: -0.42, y: -0.2, z: 9.55, rotation: 0.78 },
  { x: 0.15, y: -0.16, z: 10.4, rotation: 0.92 },
]

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount

function readStoryProgress(sections: HTMLElement[]) {
  const marker = window.scrollY + Math.min(120, window.innerHeight * 0.15)
  let index = 0
  while (index < sections.length - 1 && marker >= sections[index + 1].offsetTop) index += 1
  const start = sections[index]?.offsetTop ?? 0
  const end = sections[index + 1]?.offsetTop ?? start + 1
  const local = index === sections.length - 1 ? 0 : clamp((marker - start) / Math.max(1, end - start), 0, 1)
  return clamp((index + local) / Math.max(1, sections.length - 1), 0, 1)
}

function poseAt(progress: number, mobile: boolean) {
  const position = progress * (poses.length - 1)
  const index = Math.min(poses.length - 2, Math.floor(position))
  const fraction = position - index
  const pose = {
    x: lerp(poses[index].x, poses[index + 1].x, fraction),
    y: lerp(poses[index].y, poses[index + 1].y, fraction),
    z: lerp(poses[index].z, poses[index + 1].z, fraction),
    rotation: lerp(poses[index].rotation, poses[index + 1].rotation, fraction),
  }
  if (mobile) return { ...pose, x: 0, y: pose.y - clamp((progress - 0.25) / 0.125, 0, 1) * 2.1, z: pose.z + 0.8 }
  return pose
}

export function mountOrbitScene(canvas: HTMLCanvasElement, shell: HTMLDivElement, projectSlugs: string[]) {
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let renderer: THREE.WebGLRenderer

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: 'high-performance' })
  } catch {
    return () => undefined
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 60)
  camera.position.z = 8.3

  const system = new THREE.Group()
  scene.add(system)

  const coreMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float edge = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 4.2);
        vec3 base = vec3(0.008, 0.0075, 0.0068);
        vec3 rim = vec3(0.16, 0.135, 0.095) * edge * 0.38;
        gl_FragColor = vec4(base + rim, 1.0);
      }
    `,
  })
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.56, 64, 48), coreMaterial)
  system.add(core)

  const orbit = new THREE.Group()
  orbit.rotation.x = -1.08
  orbit.rotation.y = -0.08
  system.add(orbit)

  const linePoints = Array.from({ length: 481 }, (_, index) => {
    const angle = (index / 480) * Math.PI * 2
    return new THREE.Vector3(Math.cos(angle) * 2.12, Math.sin(angle) * 2.12, 0)
  })
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#d5c9ad', transparent: true, opacity: mobile ? 0.22 : 0.66, toneMapped: false })
  const orbitLine = new THREE.Line(pathGeometry, lineMaterial)
  orbitLine.geometry.setDrawRange(0, 1)
  orbit.add(orbitLine)

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: '#cbbf9f', transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending,
    depthWrite: false, toneMapped: false,
  })
  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.035, 5, 240), glowMaterial)
  orbit.add(glowRing)

  const hoverMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff', colorWrite: false, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
  })
  const hoverRing = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.085, 6, 120), hoverMaterial)
  orbit.add(hoverRing)

  const trailPositions = new Float32Array(97 * 3)
  const trailGeometry = new THREE.BufferGeometry()
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
  trailGeometry.setDrawRange(0, 97)
  const trailMaterial = new THREE.LineBasicMaterial({ color: '#e5dcc7', transparent: true, opacity: 0.34, toneMapped: false })
  const trail = new THREE.Line(trailGeometry, trailMaterial)
  orbit.add(trail)

  const markerMaterial = new THREE.MeshBasicMaterial({ color: '#f2ecdf', toneMapped: false })
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.047, 20, 16), markerMaterial)
  orbit.add(marker)
  const markerLight = new THREE.PointLight('#eee3cc', 1.5, 1.25, 2)
  markerLight.position.set(2.12, 0, 0)
  orbit.add(markerLight)

  let seed = 11
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const debris = new THREE.Group()
  orbit.add(debris)

  const rockCount = mobile ? 12 : 26
  const rockGeometry = new THREE.IcosahedronGeometry(1, 0)
  const rockVertices = rockGeometry.attributes.position
  for (let index = 0; index < rockVertices.count; index += 1) {
    const shape = 0.78 + random() * 0.46
    rockVertices.setXYZ(index, rockVertices.getX(index) * shape, rockVertices.getY(index) * shape, rockVertices.getZ(index) * shape)
  }
  rockGeometry.computeVertexNormals()
  const rockMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, flatShading: true })
  const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, rockCount)
  rocks.instanceMatrix.setUsage(THREE.StaticDrawUsage)
  const rockData: Array<{ x: number; y: number; z: number; size: number }> = []
  const rockTransform = new THREE.Object3D()
  for (let index = 0; index < rockCount; index += 1) {
    const angle = (index / rockCount) * Math.PI * 2 + (random() - 0.5) * 0.12
    const radius = 2.4 + random() * 0.7
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const z = (random() - 0.5) * 0.3
    const size = 0.075 + random() * 0.065
    rockTransform.position.set(x, y, z)
    rockTransform.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI)
    rockTransform.scale.set(size * (0.72 + random() * 0.5), size * (0.65 + random() * 0.5), size * (0.75 + random() * 0.5))
    rockTransform.updateMatrix()
    rocks.setMatrixAt(index, rockTransform.matrix)
    rocks.setColorAt(index, new THREE.Color('#b4a98f').multiplyScalar(0.88 + random() * 0.12))
    rockData.push({ x, y, z, size })
  }
  rocks.instanceMatrix.needsUpdate = true
  rocks.frustumCulled = false
  if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true
  debris.add(rocks)

  let disposed = false
  const spacecraft = new THREE.Group()
  spacecraft.rotation.x = -0.3
  system.add(spacecraft)
  const spacecraftData: Array<{ group: THREE.Group; radius: number; phase: number; speed: number }> = []
  const dracoLoader = new DRACOLoader().setDecoderPath('/draco/')
  const modelLoader = new GLTFLoader().setDRACOLoader(dracoLoader)
  modelLoader.load('/models/eros.glb', ({ scene: model }) => {
    if (disposed) return
    model.updateMatrixWorld(true)
    let source: THREE.Mesh | undefined
    model.traverse((object) => {
      if (!source && object instanceof THREE.Mesh) source = object
    })
    if (!source) return

    const geometry = source.geometry.clone().applyMatrix4(source.matrixWorld)
    geometry.computeBoundingBox()
    const bounds = geometry.boundingBox
    if (!bounds) {
      geometry.dispose()
      return
    }
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    const scale = 2 / Math.max(size.x, size.y, size.z)
    geometry.translate(-center.x, -center.y, -center.z).scale(scale, scale, scale)
    const material = Array.isArray(source.material) ? source.material.map((entry) => entry.clone()) : source.material.clone()
    const materials = Array.isArray(material) ? material : [material]
    materials.forEach((entry) => {
      if (entry instanceof THREE.MeshStandardMaterial) entry.color.set('#ffffff')
    })
    const modeledRocks = new THREE.InstancedMesh(geometry, material, rockCount)
    modeledRocks.instanceMatrix.setUsage(THREE.StaticDrawUsage)
    const color = new THREE.Color()
    for (let index = 0; index < rockCount; index += 1) {
      rocks.getMatrixAt(index, rockTransform.matrix)
      modeledRocks.setMatrixAt(index, rockTransform.matrix)
      rocks.getColorAt(index, color)
      modeledRocks.setColorAt(index, color)
    }
    modeledRocks.instanceMatrix.needsUpdate = true
    modeledRocks.instanceColor!.needsUpdate = true
    modeledRocks.frustumCulled = false
    debris.remove(rocks)
    rocks.geometry.dispose()
    rockMaterial.dispose()
    debris.add(modeledRocks)
  })
  const loadSpacecraft = (path: string, radius: number, phase: number, speed: number, size: number) => {
    modelLoader.load(path, ({ scene: model }) => {
      if (disposed) return
      const centeredModel = new THREE.Group()
      centeredModel.add(model)
      centeredModel.updateMatrixWorld(true)
      const bounds = new THREE.Box3().setFromObject(model)
      const center = bounds.getCenter(new THREE.Vector3())
      const dimensions = bounds.getSize(new THREE.Vector3())
      centeredModel.position.copy(center).negate()
      centeredModel.scale.setScalar(size / Math.max(dimensions.x, dimensions.y, dimensions.z))
      const group = new THREE.Group()
      group.add(centeredModel)
      spacecraft.add(group)
      spacecraftData.push({ group, radius, phase, speed })
    })
  }
  loadSpacecraft('/models/near-shoemaker.glb', 1.9, Math.PI * 0.5, 0.085, 0.3)
  loadSpacecraft('/models/deep-space-1.glb', 2.1, Math.PI * 1.5, -0.06, 0.26)

  scene.add(new THREE.AmbientLight('#b4aa96', 0.55))
  const rockLight = new THREE.DirectionalLight('#e9ddc4', 1.35)
  rockLight.position.set(-3, 4, 5)
  scene.add(rockLight)

  const particleData: Array<{ rock: number; angle: number; radius: number; speed: number; phase: number; z: number; brightness: number }> = []
  rockData.forEach((rock, rockIndex) => {
    const count = mobile ? 5 : 7
    for (let index = 0; index < count; index += 1) {
      particleData.push({
        rock: rockIndex,
        angle: random() * Math.PI * 2,
        radius: rock.size * (1 + random() * 1.8),
        speed: 0.14 + random() * 0.18,
        phase: random() * Math.PI * 2,
        z: (random() - 0.5) * rock.size * 1.4,
        brightness: 0.52 + random() * 0.48,
      })
    }
  })
  const particlePositions = new Float32Array(particleData.length * 3)
  const particleColors = new Float32Array(particleData.length * 3)
  const particleGeometry = new THREE.BufferGeometry()
  const particleAttribute = new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage)
  const particleColorAttribute = new THREE.BufferAttribute(particleColors, 3).setUsage(THREE.DynamicDrawUsage)
  particleGeometry.setAttribute('position', particleAttribute)
  particleGeometry.setAttribute('color', particleColorAttribute)
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    color: '#d5c9ad', vertexColors: true, size: mobile ? 0.026 : 0.028, transparent: true, opacity: 0.5,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }))
  particles.frustumCulled = false
  debris.add(particles)

  const projectSystem = new THREE.Group()
  system.add(projectSystem)
  const projectMarkers: THREE.Mesh[] = []
  projectSlugs.forEach((slug, index) => {
    const radius = 2.8 + (index % 4) * 0.35
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.004, 3, 144),
      new THREE.MeshBasicMaterial({ color: '#c9bea5', transparent: true, opacity: 0.24, toneMapped: false }),
    )
    ring.rotation.set(0.68 + index * 0.11, 0.24 + index * 0.16, index * 0.31)
    projectSystem.add(ring)
    const angle = index * 2.399
    const point = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), new THREE.MeshBasicMaterial({ color: '#eae5dc', toneMapped: false }))
    point.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0)
    point.userData.href = '/projects/' + encodeURIComponent(slug)
    projectSystem.add(point)
    projectMarkers.push(point)
  })

  const dustPositions = new Float32Array((mobile ? 34 : 72) * 3)
  for (let index = 0; index < dustPositions.length; index += 3) {
    dustPositions[index] = (random() - 0.5) * 12
    dustPositions[index + 1] = (random() - 0.5) * 7
    dustPositions[index + 2] = (random() - 0.5) * 4
  }
  const dustGeometry = new THREE.BufferGeometry()
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#a39b88', size: mobile ? 0.012 : 0.014, transparent: true, opacity: 0.25, sizeAttenuation: true, depthWrite: false }))
  scene.add(dust)

  const starCount = mobile ? 220 : 480
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)
  const brightStarPositions: number[] = []
  for (let index = 0; index < starCount; index += 1) {
    const offset = index * 3
    const brightness = 0.45 + Math.pow(random(), 1.6) * 0.55
    const x = random() * 2 - 1
    const y = random() * 2 - 1
    starPositions[offset] = x
    starPositions[offset + 1] = y
    starColors[offset] = brightness
    starColors[offset + 1] = brightness * 0.94
    starColors[offset + 2] = brightness * 0.82
    if (brightness > 0.94) brightStarPositions.push(x, y, 0)
  }
  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
    vertexColors: true, size: 0.08, transparent: true, opacity: 0.88, sizeAttenuation: true,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }))
  const brightStarGeometry = new THREE.BufferGeometry()
  brightStarGeometry.setAttribute('position', new THREE.Float32BufferAttribute(brightStarPositions, 3))
  const brightStars = new THREE.Points(brightStarGeometry, new THREE.PointsMaterial({
    color: '#e9d9b5', size: 0.12, transparent: true, opacity: 0.94, sizeAttenuation: true,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }))
  stars.position.z = -32
  brightStars.position.z = -32
  stars.frustumCulled = false
  brightStars.frustumCulled = false
  camera.add(stars)
  camera.add(brightStars)
  scene.add(camera)
  const fitStarField = () => {
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 32
    const scaleX = (height * camera.aspect) / 2
    const scaleY = height / 2
    stars.scale.set(scaleX, scaleY, 1)
    brightStars.scale.set(scaleX, scaleY, 1)
  }
  fitStarField()

  const sections = Array.from(document.querySelectorAll<HTMLElement>('section[data-scene-index]'))
  const raycaster = new THREE.Raycaster()
  raycaster.params.Line = { threshold: 0.09 }
  const pointer = new THREE.Vector2(10, 10)
  let pointerX = 0
  let pointerY = 0
  let pointerActive = false
  let frameId = 0
  let lastFrame = 0
  let startedAt = performance.now()
  let glow = 0.1
  let scrollProgress = 0
  let lost = false

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    pointerX = pointer.x
    pointerY = pointer.y
    pointerActive = true
  }

  function onPointerLeave() {
    pointerActive = false
    pointer.set(10, 10)
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    lost = true
    shell.removeAttribute('data-ready')
  }

  function onContextRestored() {
    lost = false
    shell.dataset.ready = 'true'
  }

  function resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    const compact = width <= 700
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    fitStarField()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.75))
    renderer.setSize(width, height, false)
  }

  function animate(now: number) {
    frameId = window.requestAnimationFrame(animate)
    if (document.hidden || lost || (mobile && now - lastFrame < 32)) return
    lastFrame = now

    const elapsed = (now - startedAt) / 1000
    const intro = reducedMotion ? 1 : clamp(elapsed / 2.2, 0, 1)
    orbitLine.geometry.setDrawRange(0, Math.max(1, Math.floor(480 * intro)))
    glowMaterial.opacity = lerp(glowMaterial.opacity, 0.08 + glow * 0.12, 0.08)
    scrollProgress = reducedMotion ? 0 : readStoryProgress(sections)
    orbit.rotation.x = lerp(orbit.rotation.x, -1.08 + Math.sin(scrollProgress * Math.PI * 0.5) * 0.1, 0.045)
    const pose = poseAt(scrollProgress, mobile)

    const cameraDriftX = reducedMotion ? 0 : pointerX * 0.12
    const cameraDriftY = reducedMotion ? 0 : pointerY * 0.08
    camera.position.x = lerp(camera.position.x, cameraDriftX, 0.035)
    camera.position.y = lerp(camera.position.y, cameraDriftY, 0.035)
    camera.position.z = lerp(camera.position.z, pose.z, 0.045)
    camera.lookAt(0, 0, 0)

    system.position.x = lerp(system.position.x, pose.x, 0.055)
    system.position.y = lerp(system.position.y, pose.y, 0.055)
    system.rotation.y = lerp(system.rotation.y, reducedMotion ? 0 : pose.rotation + pointerX * 0.035, 0.035)
    system.rotation.x = lerp(system.rotation.x, reducedMotion ? 0 : pointerY * 0.025, 0.035)
    dust.rotation.z = reducedMotion ? 0 : elapsed * 0.003
    debris.rotation.z = reducedMotion ? 0 : elapsed * 0.06
    spacecraftData.forEach(({ group, radius, phase, speed }) => {
      const angle = phase + (reducedMotion ? 0 : elapsed * speed)
      group.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      group.rotation.z = angle + Math.PI * 0.5
    })

    const angle = 0.62 + intro * Math.PI * 2 + (reducedMotion ? 0 : elapsed * 0.12 + scrollProgress * 1.1)
    marker.position.set(Math.cos(angle) * 2.12, Math.sin(angle) * 2.12, 0)
    markerLight.position.copy(marker.position)
    particleData.forEach((particle, index) => {
      const rock = rockData[particle.rock]
      const angle = particle.angle + (reducedMotion ? 0 : elapsed * particle.speed)
      const drift = reducedMotion ? 0 : Math.sin(elapsed * 0.7 + particle.phase) * 0.018
      particlePositions[index * 3] = rock.x + Math.cos(angle) * particle.radius + drift
      particlePositions[index * 3 + 1] = rock.y + Math.sin(angle) * particle.radius - drift
      particlePositions[index * 3 + 2] = rock.z + particle.z + Math.sin(elapsed * 0.5 + particle.phase) * (reducedMotion ? 0 : 0.012)
      const shimmer = particle.brightness * (reducedMotion ? 1 : 0.82 + Math.sin(elapsed * 1.4 + particle.phase) * 0.18)
      particleColors[index * 3] = shimmer
      particleColors[index * 3 + 1] = shimmer
      particleColors[index * 3 + 2] = shimmer
    })
    particleAttribute.needsUpdate = true
    particleColorAttribute.needsUpdate = true
    const trailLength = 0.22 + scrollProgress * 6.06
    for (let index = 0; index <= 96; index += 1) {
      const trailAngle = angle - (index / 96) * trailLength
      trailPositions[index * 3] = Math.cos(trailAngle) * 2.12
      trailPositions[index * 3 + 1] = Math.sin(trailAngle) * 2.12
      trailPositions[index * 3 + 2] = 0.002
    }
    trailGeometry.attributes.position.needsUpdate = true
    trailMaterial.opacity = 0.19 + scrollProgress * 0.17
    projectSystem.visible = projectSlugs.length > 0 && scrollProgress > 0.68

    scene.updateMatrixWorld(true)
    let ringHovered = false
    if (pointerActive) {
      raycaster.setFromCamera(pointer, camera)
      ringHovered = raycaster.intersectObject(hoverRing, false).length > 0
      const projectHit = raycaster.intersectObjects(projectMarkers, false)[0]?.object
      projectMarkers.forEach((point) => {
        const material = point.material as THREE.MeshBasicMaterial
        material.color.set(point === projectHit ? '#ffffff' : '#eae5dc')
      })
    }
    glow = ringHovered ? 1 : 0
    renderer.render(scene, camera)
    if (intro >= 1 && !shell.dataset.ready) shell.dataset.ready = 'true'
  }

  canvas.addEventListener('webglcontextlost', onContextLost)
  canvas.addEventListener('webglcontextrestored', onContextRestored)
  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave)
  shell.dataset.ready = 'true'
  startedAt = performance.now()
  frameId = window.requestAnimationFrame(animate)

  return () => {
    disposed = true
    window.cancelAnimationFrame(frameId)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    canvas.removeEventListener('webglcontextrestored', onContextRestored)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerleave', onPointerLeave)
    const textures = new Set<THREE.Texture>()
    const imageBitmaps = new Set<ImageBitmap>()
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) textures.add(value)
          })
          material.dispose()
        })
      }
    })
    textures.forEach((texture) => {
      if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) imageBitmaps.add(texture.image)
      texture.dispose()
    })
    imageBitmaps.forEach((image) => image.close())
    dracoLoader.dispose()
    renderer.dispose()
  }
}
