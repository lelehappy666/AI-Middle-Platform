import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Loading } from './Loading';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  onLoad,
  onError,
  onClick,
  threshold = 0.1
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onClick={onClick}
    >
      {!isInView ? (
        // 占位符 - 图片还未进入视口
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {placeholder ? (
            <img
              src={placeholder}
              alt={alt}
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          )}
        </div>
      ) : hasError ? (
        // 错误状态
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2" />
            <p className="text-xs">加载失败</p>
          </div>
        </div>
      ) : (
        // 正常图片加载
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <Loading size="sm" />
            </div>
          )}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;