"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(
  onLoadMore: () => Promise<void>,
  hasMore: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0, rootMargin = "200px" } = options;
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            setIsLoading(true);
            await onLoadMore();
            setIsLoading(false);
          }
        },
        { threshold, rootMargin }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, threshold, rootMargin]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return { lastElementRef, isLoading };
}
