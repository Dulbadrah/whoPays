import * as THREE from "three"

export function createFloor() {
  const geometry = new THREE.PlaneGeometry(20, 200)
  const material = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide,
  })
  const floor = new THREE.Mesh(geometry, material)
  floor.rotation.x = Math.PI / 2
  floor.position.y = -0.5
  return floor
}
