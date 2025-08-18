"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useControls } from "./components/useController"
import { createPlayer } from "./components/players"
import { createFloor } from "./components/floor"
import { createObstacle } from "./components/obstacle"


export default function RunnerGame() {
  const mountRef = useRef<HTMLDivElement>(null)
  const lane = useControls()
  const obstacles: THREE.Mesh[] = []
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)

    // Lights
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
    scene.add(light)

    // Player
    const player = createPlayer()
    scene.add(player)

    // Floor
    const floor = createFloor()
    scene.add(floor)

    camera.position.y = 2
    camera.position.z = 5

    const laneDistance = 2
    let lastSpawn = 0
    let scoreCounter = 0

    function spawnObstacle() {
      const obs = createObstacle()
      scene.add(obs)
      obstacles.push(obs)
    }

    function animate(time: number) {
      if (gameOver) return
      requestAnimationFrame(animate)

      // Player lane movement
      player.position.x += (lane * laneDistance - player.position.x) * 0.2

      // Spawn obstacles
      if (time - lastSpawn > 2000) {
        spawnObstacle()
        lastSpawn = time
      }

      // Move obstacles & check collision
      for (let obs of obstacles) {
        obs.position.z += 0.2
        if (
          Math.abs(player.position.x - obs.position.x) < 1 &&
          Math.abs(player.position.z - obs.position.z) < 1
        ) {
          setGameOver(true)
          alert("💀 Game Over! Your Score: " + scoreCounter)
          return
        }
      }

      // Update score
      scoreCounter += 1
      if (scoreCounter % 5 === 0) {
        setScore((prev) => prev + 1) // score UI-г update хийх
      }

      renderer.render(scene, camera)
    }
    animate(0)

    return () => {
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [lane, gameOver])

  return (
    <div className="relative w-full h-screen bg-black">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Score UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-2xl font-bold">
        Score: {score}
      </div>

      {/* Game Over UI */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-3xl font-bold">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  )
}