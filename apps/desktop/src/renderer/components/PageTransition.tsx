// ============================================================================
// BLOCKS Desktop - Page Transition Component
// Smooth transitions between pages
// ============================================================================

import { useState, useEffect, ReactNode } from "react";
import { cn } from "@blocks/ui";

// ============================================================================
// Types
// ============================================================================

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
  direction?: "left" | "right" | "up" | "down" | "fade";
  duration?: number;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function PageTransition({
  children,
  pageKey,
  direction = "fade",
  duration = 200,
  className,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [currentKey, setCurrentKey] = useState(pageKey);
  
  useEffect(() => {
    if (pageKey !== currentKey) {
      // Fade out
      setIsVisible(false);
      
      // After fade out, update content and fade in
      const timeout = setTimeout(() => {
        setCurrentChildren(children);
        setCurrentKey(pageKey);
        
        // Fade in after a frame
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, duration);
      
      return () => clearTimeout(timeout);
    }
  }, [pageKey, children, currentKey, duration]);
  
  useEffect(() => {
    // Initial fade in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);
  
  const getTransformClass = () => {
    switch (direction) {
      case "left":
        return isVisible ? "translate-x-0" : "translate-x-4";
      case "right":
        return isVisible ? "translate-x-0" : "-translate-x-4";
      case "up":
        return isVisible ? "translate-y-0" : "translate-y-4";
      case "down":
        return isVisible ? "translate-y-0" : "-translate-y-4";
      default:
        return "";
    }
  };
  
  return (
    <div
      className={cn(
        "transition-all",
        getTransformClass(),
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {currentChildren}
    </div>
  );
}

// ============================================================================
// Animation variants
// ============================================================================

export function FadeIn({
  children,
  delay = 0,
  duration = 300,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  
  return (
    <div
      className={cn(
        "transition-opacity",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

export function SlideIn({
  children,
  from = "bottom",
  delay = 0,
  duration = 300,
  distance = 20,
  className,
}: {
  children: ReactNode;
  from?: "top" | "bottom" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  
  const getTransform = () => {
    if (isVisible) return "translate(0, 0)";
    
    switch (from) {
      case "top":
        return `translateY(-${distance}px)`;
      case "bottom":
        return `translateY(${distance}px)`;
      case "left":
        return `translateX(-${distance}px)`;
      case "right":
        return `translateX(${distance}px)`;
    }
  };
  
  return (
    <div
      className={cn("transition-all", className)}
      style={{
        transitionDuration: `${duration}ms`,
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  from = 0.95,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);
  
  return (
    <div
      className={cn("transition-all", className)}
      style={{
        transitionDuration: `${duration}ms`,
        transform: isVisible ? "scale(1)" : `scale(${from})`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Stagger animation for lists
// ============================================================================

export function StaggeredList({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  className,
}: {
  children: ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <SlideIn
          key={index}
          from="bottom"
          delay={initialDelay + index * staggerDelay}
          distance={10}
        >
          {child}
        </SlideIn>
      ))}
    </div>
  );
}

