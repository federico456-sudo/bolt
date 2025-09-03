import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  onIntersect: () => void
  threshold?: number
  rootMargin?: string
}

export const useIntersectionObserver = ({
  onIntersect,
  threshold = 0,
  rootMargin = '0px'
}: UseIntersectionObserverProps) => {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (element) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onIntersect()
          }
        },
        { threshold, rootMargin }
      )

      observer.current.observe(element)

      return () => {
        if (observer.current) {
          observer.current.disconnect()
        }
      }
    }
  }, [element, onIntersect, threshold, rootMargin])

  return [setElement] as const
}