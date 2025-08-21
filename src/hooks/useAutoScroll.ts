import { useEffect, useRef, useCallback } from 'react';

export function useAutoScroll<T extends HTMLElement>(dependency: any) {
  const ref = useRef<T>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    if (ref.current && !isUserScrollingRef.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  // Auto-scroll when dependency changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [dependency, scrollToBottom]);

  // Track user scrolling
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (!isAtBottom) {
        isUserScrollingRef.current = true;
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false;
        }, 1000);
      } else {
        isUserScrollingRef.current = false;
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, scrollToBottom };
}