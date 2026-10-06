import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { DRACOLoader } from "DRACOLoader";
import { RGBELoader } from "RGBELoader";
import { OrbitControls } from "OrbitControls";

// "lamp-3d" 컨테이너 선택
const lampContainer = document.querySelector('.lamp-3d');

// 씬(Scene) 생성
const scene = new THREE.Scene();

// 카메라(Camera) 설정
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 카메라 위치와 각도 설정 (이미지와 유사한 시점으로)
camera.position.set(30, -5, 50); // X, Y, Z 위치를 조정하여 각도 설정
camera.lookAt(0, 0, 0); // 모델의 중심점을 바라보도록 설정

// 렌더러(Renderer) 생성 및 설정
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.09;
lampContainer.appendChild(renderer.domElement);

// 추가적인 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // 부드러운 흰색 조명
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // 강한 방향성 조명
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// DRACOLoader 설정 (압축된 GLB 파일 해제용)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/libs/draco/');

// GLTFLoader 설정 및 DRACOLoader 연결
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// TextureLoader 생성
const textureLoader = new THREE.TextureLoader();

// 텍스처 로드 (파일 이름에 맞게 경로 수정)
const textures = {
    bump: textureLoader.load('./images/mainsection/Lamp/texture/lamp_bump_6.jpg'), // 범프 맵
    diffuse0: textureLoader.load('./images/mainsection/Lamp/texture/lamp_diffuse_0.jpg'),
    diffuse2: textureLoader.load('./images/mainsection/Lamp/texture/lamp_diffuse_2.jpg'),
    diffuse4: textureLoader.load('./images/mainsection/Lamp/texture/lamp_diffuse_4.jpg'),
    diffuse7: textureLoader.load('./images/mainsection/Lamp/texture/lamp_diffuse_7.jpg'),
    roughness1: textureLoader.load('./images/mainsection/Lamp/texture/lamp_rm_1.jpg'),
    roughness3: textureLoader.load('./images/mainsection/Lamp/texture/lamp_rm_3.jpg'),
    roughness5: textureLoader.load('./images/mainsection/Lamp/texture/lamp_rm_5.jpg'),
};

// GLB 모델 로드 및 텍스처 적용
loader.load(
    './images/mainsection/Lamp/Office_Lamp.glb', // GLB 파일 경로
    (gltf) => {
        const model = gltf.scene;

        model.scale.set(130, 130, 130); // 모델 크기 확대

        // 모델 중심점 계산 및 이동
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // 텍스처를 적용할 각 파트를 식별하고 텍스처 적용
        model.traverse((child) => {
            if (child.isMesh) {
                // 이름이나 구조에 따라 특정 파트를 식별
                if (child.name.includes('Spring')) {
                    child.material.map = textures.diffuse0; // 스프링에 diffuse0 텍스처 적용
                } else if (child.name.includes('Bulb')) {
                    child.material.map = textures.diffuse2; // 전구에 diffuse2 텍스처 적용
                    child.material.emissiveMap = textures.diffuse7; // 발광 텍스처 설정
                    child.material.emissive = new THREE.Color(0xffffff); // 발광 색상
                } else if (child.name.includes('StandInner')) {
                    child.material.map = textures.diffuse4; // 스탠드 안쪽 텍스처 적용
                    child.material.roughnessMap = textures.roughness3; // 거칠기 텍스처 적용
                } else {
                    // 기본 재질
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x333333,
                        roughness: 0.5,
                        metalness: 0.8,
                    });
                }
            }
        });

        scene.add(model); // 씬에 모델 추가
        console.log('모델 로드 성공:', model);
    },
    undefined,
    (error) => {
        console.error('GLB 모델 로드 중 오류 발생:', error);
    }
);

// OrbitControls 추가 (사용자 인터랙션)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 애니메이션 루프 생성 (렌더링 반복)
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}
animate();

// 창 크기 변경 / 기기 회전 시 캔버스 대응
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});