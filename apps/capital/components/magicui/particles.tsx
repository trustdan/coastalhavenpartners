"use client"

import { useCallback, useEffect, useRef, RefObject } from "react"

import { cn } from "@/lib/utils"

interface ParticlesProps {
  className?: string
  quantity?: number
  size?: number
  color?: string
  vx?: number
  vy?: number
  /** Radius around cursor where particles are affected */
  interactionRadius?: number
  /** How strongly particles are pushed away (0 = disabled) */
  interactionStrength?: number
  /** External container ref to track mouse on (for when particles are behind other content) */
  mouseContainerRef?: RefObject<HTMLElement | null>
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "")

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("")
  }

  const hexInt = parseInt(hex, 16)
  const red = (hexInt >> 16) & 255
  const green = (hexInt >> 8) & 255
  const blue = hexInt & 255
  return [red, green, blue]
}

type Circle = {
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
}

export function Particles({
  className = "",
  quantity = 100,
  size = 0.4,
  color = "#ffffff",
  vx = 0,
  vy = 0,
  interactionRadius = 120,
  interactionStrength = 0.8,
  mouseContainerRef,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<Circle[]>([])
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const mouse = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1
  const animationFrameId = useRef<number | null>(null)

  const rgb = hexToRgb(color)

  const remapValue = useCallback(
    (
      value: number,
      start1: number,
      end1: number,
      start2: number,
      end2: number
    ): number => {
      const remapped =
        ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
      return remapped > 0 ? remapped : 0
    },
    []
  )

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w)
    const y = Math.floor(Math.random() * canvasSize.current.h)
    const pSize = Math.floor(Math.random() * 2) + size
    const alpha = 0
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1))
    // Slow, gentle drift
    const dx = (Math.random() - 0.5) * 0.15
    const dy = (Math.random() - 0.5) * 0.15
    return {
      x,
      y,
      baseX: x,
      baseY: y,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
    }
  }, [size])

  const drawCircle = useCallback(
    (circle: Circle, update = false) => {
      if (context.current) {
        const { x, y, size: circleSize, alpha } = circle
        context.current.beginPath()
        context.current.arc(x, y, circleSize, 0, 2 * Math.PI)
        context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`
        context.current.fill()

        if (!update) {
          circles.current.push(circle)
        }
      }
    },
    [rgb]
  )

  const clearContext = useCallback(() => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h
      )
    }
  }, [])

  const drawParticles = useCallback(() => {
    clearContext()
    const particleCount = quantity
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams()
      drawCircle(circle)
    }
  }, [clearContext, quantity, circleParams, drawCircle])

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0
      canvasSize.current.w = canvasContainerRef.current.offsetWidth
      canvasSize.current.h = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = canvasSize.current.w * dpr
      canvasRef.current.height = canvasSize.current.h * dpr
      canvasRef.current.style.width = `${canvasSize.current.w}px`
      canvasRef.current.style.height = `${canvasSize.current.h}px`
      context.current.scale(dpr, dpr)
    }
  }, [dpr])

  const initCanvas = useCallback(() => {
    resizeCanvas()
    drawParticles()
  }, [resizeCanvas, drawParticles])

  const animate = useCallback(() => {
    clearContext()
    
    circles.current.forEach((circle: Circle, i: number) => {
      // Update base position with drift
      circle.baseX += circle.dx + vx
      circle.baseY += circle.dy + vy

      // Calculate distance-based mouse interaction
      let targetX = circle.baseX
      let targetY = circle.baseY

      if (mouse.current.active && interactionStrength > 0) {
        const dx = circle.baseX - mouse.current.x
        const dy = circle.baseY - mouse.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < interactionRadius) {
          // Particles within radius get pushed away from cursor
          const force = (1 - distance / interactionRadius) * interactionStrength
          const angle = Math.atan2(dy, dx)
          targetX = circle.baseX + Math.cos(angle) * force * 50
          targetY = circle.baseY + Math.sin(angle) * force * 50
        }
      }

      // Smoothly interpolate to target position
      circle.x += (targetX - circle.x) * 0.1
      circle.y += (targetY - circle.y) * 0.1

      // Fade in based on distance from edges
      const edge = [
        circle.x - circle.size,
        canvasSize.current.w - circle.x - circle.size,
        circle.y - circle.size,
        canvasSize.current.h - circle.y - circle.size,
      ]
      const closestEdge = edge.reduce((a, b) => Math.min(a, b))
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      )
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge
      }

      drawCircle(circle, true)

      // Respawn particles that go off-screen
      if (
        circle.baseX < -circle.size - 50 ||
        circle.baseX > canvasSize.current.w + circle.size + 50 ||
        circle.baseY < -circle.size - 50 ||
        circle.baseY > canvasSize.current.h + circle.size + 50
      ) {
        circles.current.splice(i, 1)
        const newCircle = circleParams()
        drawCircle(newCircle)
      }
    })
    animationFrameId.current = window.requestAnimationFrame(animate)
  }, [clearContext, drawCircle, circleParams, vx, vy, remapValue, interactionRadius, interactionStrength])

  // Mouse event handlers - use canvas container position for coordinate calculation
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
      mouse.current.active = true
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouse.current.active = false
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvas()
    animationFrameId.current = window.requestAnimationFrame(animate)
    
    // Use external container if provided, otherwise use canvas container
    const mouseTarget = mouseContainerRef?.current || canvasContainerRef.current
    
    if (mouseTarget) {
      mouseTarget.addEventListener("mousemove", handleMouseMove)
      mouseTarget.addEventListener("mouseleave", handleMouseLeave)
    }
    
    window.addEventListener("resize", initCanvas)

    return () => {
      window.removeEventListener("resize", initCanvas)
      if (mouseTarget) {
        mouseTarget.removeEventListener("mousemove", handleMouseMove)
        mouseTarget.removeEventListener("mouseleave", handleMouseLeave)
      }
      if (animationFrameId.current !== null) {
        window.cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [color, initCanvas, animate, handleMouseMove, handleMouseLeave, mouseContainerRef])

  return (
    <div
      className={cn("pointer-events-none h-full w-full", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
