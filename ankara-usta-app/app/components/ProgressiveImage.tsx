'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

export default function ProgressiveImage({ className = '', onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={props.alt ?? ''}
      className={`${className} ${loaded ? '' : 'progressive-image-loading'}`.trim()}
      onLoad={(event) => { setLoaded(true); onLoad?.(event); }}
    />
  );
}
