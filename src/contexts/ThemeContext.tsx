"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("nori-farm-theme") as Theme
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setThemeState(savedTheme)
      } else {
        // Check system preference
        if (typeof window !== "undefined" && window.matchMedia) {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          setThemeState(prefersDark ? "dark" : "light")
        }
      }
    } catch (error) {
      // Fallback to light theme if localStorage fails
      console.warn("Failed to load theme from localStorage:", error)
    }
    setMounted(true)
  }, [])

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      localStorage.setItem("nori-farm-theme", theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(prev => prev === "light" ? "dark" : "light")
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // During SSR or if used outside provider, return default values
    return {
      theme: "light" as const,
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }
  return context
} 