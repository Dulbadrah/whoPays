import * as THREE from "three"

export function createObstacle() {
  const geo = new THREE.BoxGeometry(1, 1, 1)
  const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 })
  const obs = new THREE.Mesh(geo, mat)
  obs.position.set(Math.random() > 0.5 ? -2 : 2, 0, -20)
  return obs
}

