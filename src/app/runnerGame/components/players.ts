import * as THREE from "three"

export function createPlayer() {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  const player = new THREE.Mesh(geometry, material)
  player.position.z = 0
  return player
}
