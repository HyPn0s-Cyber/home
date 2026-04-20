import { useEffect, useRef, useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  aspect?: string;
};

export default function LazyImage({ src, alt, aspect = '16/9', className = '', ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { rootMargin: '200px' },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-[#0b0f14] ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[#1a222d] font-mono text-xs">
          <div className="animate-pulse">[loading…]</div>
        </div>
      )}
      {visible && (
        <img
          {...rest}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
