import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(callback) {
  const observerRef = useRef();

  useEffect(() => {
    let currentNode;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
      currentNode = observerRef.current;
    }

    return () => {
      if (currentNode) observer.unobserve(currentNode);
    };
  }, [callback]);

  return observerRef;
}
