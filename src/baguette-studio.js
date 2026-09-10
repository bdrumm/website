import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function installBaguetteStudio(renderer, scene, camera) {
  // Broad studio reflections reveal the silk finish without bleaching the gold.
  renderer.toneMappingExposure = 1.05;
  scene.children.forEach(object => {
    if (object.isHemisphereLight) object.intensity = 1.05;
    else if (object.isDirectionalLight) object.intensity *= .55;
  });
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .85;
  room.dispose();
  pmrem.dispose();
  camera.position.y = 2.8;
  return { dispose: () => environment.dispose() };
}
