import { useEffect, useState } from "react"

export function useControls() {
  const [lane, setLane] = useState(0) // -1 = left, 0 = middle, 1 = right

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && lane > -1) setLane((prev) => prev - 1)
      if (e.key === "ArrowRight" && lane < 1) setLane((prev) => prev + 1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lane])

  return lane
}
