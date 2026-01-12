"use client"
import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-foreground/20 ${className}`}
    >
      <div className="relative h-full">{children}</div>
    </div>
  )
}