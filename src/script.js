import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import { Sky } from 'three/addons/objects/Sky.js'
import GUI from 'lil-gui'

const canvas = document.querySelector('canvas.webgl')
const textureLoader = new THREE.TextureLoader()

const loadColorTexture = (path) => {
    const texture = textureLoader.load(path)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

const configureTexture = (texture, repeatX, repeatY, wrapping = true) => {
    texture.repeat.set(repeatX, repeatY)

    if (wrapping) {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
    }

    return texture
}

const splitArmTexture = (texture) => ({
    aoMap: texture,
    roughnessMap: texture,
    metalnessMap: texture
})

const scene = new THREE.Scene()
const fogColor = '#04343f'
scene.fog = new THREE.FogExp2(fogColor, 0.1)

const wallColorTexture = configureTexture(
    loadColorTexture('./wall/red_brick_diff_1k.jpg'),
    2,
    2
)
const wallArmTexture = configureTexture(
    textureLoader.load('./wall/red_brick_arm_1k.jpg'),
    2,
    2
)
const wallNormalTexture = configureTexture(
    textureLoader.load('./wall/red_brick_nor_gl_1k.jpg'),
    2,
    2
)

const roofColorTexture = configureTexture(
    loadColorTexture('./roof/ceramic_roof_01_diff_1k.jpg'),
    3,
    1
)
const roofAoTexture = configureTexture(
    textureLoader.load('./roof/ceramic_roof_01_ao_1k.jpg'),
    3,
    1
)
const roofNormalTexture = configureTexture(
    textureLoader.load('./roof/ceramic_roof_01_nor_gl_1k.jpg'),
    3,
    1
)

const floorColorTexture = configureTexture(
    loadColorTexture('./floor/farm_soil_diff_1k.jpg'),
    8,
    8
)
const floorArmTexture = configureTexture(
    textureLoader.load('./floor/farm_soil_arm_1k.jpg'),
    8,
    8
)
const floorNormalTexture = configureTexture(
    textureLoader.load('./floor/farm_soil_nor_gl_1k.jpg'),
    8,
    8
)
const floorDisplacementTexture = configureTexture(
    textureLoader.load('./floor/farm_soil_disp_1k.jpg'),
    8,
    8
)

const bushColorTexture = configureTexture(
    loadColorTexture('./bush/leaves_forest_ground_diff_1k.jpg'),
    2,
    1
)
const bushArmTexture = configureTexture(
    textureLoader.load('./bush/leaves_forest_ground_arm_1k.jpg'),
    2,
    1
)
const bushNormalTexture = configureTexture(
    textureLoader.load('./bush/leaves_forest_ground_nor_gl_1k.jpg'),
    2,
    1
)

const graveColorTexture = configureTexture(
    loadColorTexture('./grave/marble_rock_02_diff_1k.jpg'),
    0.3,
    0.4,
    false
)
const graveArmTexture = configureTexture(
    textureLoader.load('./grave/marble_rock_02_arm_1k.jpg'),
    0.3,
    0.4,
    false
)
const graveNormalTexture = configureTexture(
    textureLoader.load('./grave/marble_rock_02_nor_gl_1k.jpg'),
    0.3,
    0.4,
    false
)

const doorColorTexture = loadColorTexture('./door/door.jpg')

const house = new THREE.Group()
scene.add(house)

const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        normalMap: wallNormalTexture,
        ...splitArmTexture(wallArmTexture)
    })
)
walls.position.y = 1.25
walls.castShadow = true
walls.receiveShadow = true
house.add(walls)

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofAoTexture,
        normalMap: roofNormalTexture
    })
)
roof.position.y = 3.25
roof.rotation.y = Math.PI * 0.25
roof.castShadow = true
roof.receiveShadow = true
house.add(roof)

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true
    })
)
door.position.y = 1
door.position.z = 2.01
door.castShadow = true
door.receiveShadow = true
house.add(door)

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc',
    map: bushColorTexture,
    normalMap: bushNormalTexture,
    ...splitArmTexture(bushArmTexture)
})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

bush1.castShadow = true
bush1.receiveShadow = true
bush2.castShadow = true
bush2.receiveShadow = true
house.add(bush1, bush2)

const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    normalMap: graveNormalTexture,
    ...splitArmTexture(graveArmTexture)
})

for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 4
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)

    grave.position.set(x, Math.random() * 0.4, z)
    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    grave.castShadow = true
    grave.receiveShadow = true
    graves.add(grave)
}

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        map: floorColorTexture,
        normalMap: floorNormalTexture,
        ...splitArmTexture(floorArmTexture),
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2
    })
)
floor.rotation.x = -Math.PI * 0.5
floor.receiveShadow = true
scene.add(floor)

const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
directionalLight.castShadow = true
scene.add(directionalLight)

const doorLight = new THREE.PointLight('#ff7d46', 5, 7)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)

const ghost1 = new THREE.PointLight('#8800ff', 6, 3)
ghost1.castShadow = true
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#ff0088', 6, 3)
ghost2.castShadow = true
scene.add(ghost2)

const sky = new Sky()
sky.scale.set(100, 100, 100)
scene.add(sky)
sky.material.uniforms.turbidity.value = 10
sky.material.uniforms.rayleigh.value = 3
sky.material.uniforms.mieCoefficient.value = 0.1
sky.material.uniforms.mieDirectionalG.value = 0.95
sky.material.uniforms.sunPosition.value.set(0.3, -0.038, -0.95)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
)
camera.position.set(4, 2, 5)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor(fogColor)

const gui = new GUI()
const ghostSettings = { speed: 1 }
gui.add(directionalLight, 'intensity', 0, 5, 0.01).name('Directional light')
gui.add(ambientLight, 'intensity', 0, 2, 0.01).name('Ambient light')
gui.add(ghostSettings, 'speed', 0, 5, 0.01).name('Ghost speed')

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const timer = new Timer()

const tick = () => {
    timer.update()
    const elapsedTime = timer.getElapsed()
    const animationTime = elapsedTime * ghostSettings.speed

    const ghost1Angle = animationTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(animationTime * 3)

    const ghost2Angle = -animationTime * 0.38
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y =
        Math.sin(animationTime * 4) + Math.sin(animationTime * 2.5)

    doorLight.intensity = Math.random() > 0.8 ? 0 : 5

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
