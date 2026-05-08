import { useState, useEffect, useRef, useCallback } from "react";

export function useScrollSpy(
  sectionIds: string[],
  containerRef?: React.RefObject<HTMLElement>,
  options?: { offset?: number }
) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] || null);
  const offset = options?.offset ?? 80;
  const currentTargetRef = useRef<HTMLElement | Window | null>(null);

  const handleScroll = useCallback(() => {
    if (sectionIds.length === 0) return;

    const container = containerRef?.current;

    let currentSection = sectionIds[0];

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const containerRect = container?.getBoundingClientRect();
        
        const elementTop = container 
          ? rect.top - (containerRect?.top || 0)
          : rect.top;
        
        if (elementTop <= offset + 4) {
          currentSection = id;
        }
      }
    }

    setActiveId(currentSection);
  }, [sectionIds, containerRef, offset]);

  // Effect to attach/reattach scroll listener when container becomes available
  useEffect(() => {
    const checkAndAttach = () => {
      const desiredTarget = containerRef?.current || window;
      
      // If target changed, remove old listener and add new one
      if (currentTargetRef.current !== desiredTarget) {
        if (currentTargetRef.current) {
          currentTargetRef.current.removeEventListener("scroll", handleScroll);
        }
        
        desiredTarget.addEventListener("scroll", handleScroll, { passive: true });
        currentTargetRef.current = desiredTarget;
        
        // Call immediately to set initial state
        handleScroll();
      }
    };

    // Check immediately
    checkAndAttach();

    // Also check after a short delay (in case container mounts after this effect)
    const timeoutId = setTimeout(checkAndAttach, 100);

    // Use MutationObserver to detect when the container element becomes available
    const observer = new MutationObserver(() => {
      if (containerRef?.current && currentTargetRef.current !== containerRef.current) {
        checkAndAttach();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      if (currentTargetRef.current) {
        currentTargetRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [containerRef, handleScroll]);

  return activeId;
}
