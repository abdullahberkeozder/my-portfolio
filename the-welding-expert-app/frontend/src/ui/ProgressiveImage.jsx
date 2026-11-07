import { useState } from "react";
import styled, { css } from "styled-components";
import { HiOutlinePhoto } from "react-icons/hi2";

const Frame = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--color-grey-100);
  isolation: isolate;
  ${(props) =>
    props.$aspectRatio &&
    css`
      aspect-ratio: ${props.$aspectRatio};
    `}

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(145deg, var(--color-grey-100), var(--color-grey-200));
    opacity: ${(props) => (props.$loaded || props.$failed ? 0 : 1)};
    transition: opacity var(--motion-base) var(--ease-standard);
  }

  ${(props) =>
    props.$loaded &&
    css`
      background: transparent;
    `}

`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: ${(props) => props.$fit};
  object-position: ${(props) => props.$position};
  opacity: ${(props) => (props.$loaded ? 1 : 0)};
  transform: ${(props) => (props.$loaded ? "scale(1)" : "scale(1.008)")};
  transition:
    opacity var(--motion-slow) var(--ease-out),
    transform var(--motion-slow) var(--ease-out);
`;

const Picture = styled.picture`
  display: contents;
`;

const ErrorState = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-grey-500);
  background: var(--color-grey-100);

  & svg {
    width: 2.4rem;
    height: 2.4rem;
  }
`;

function ProgressiveImage({
  src,
  fallbackSrc,
  alt,
  className,
  fit = "cover",
  position = "center",
  sources = [],
  frameProps = {},
  aspectRatio,
  revealImmediately = false,
  onLoad,
  onError,
  ...imageProps
}) {
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const [fallbackForSrc, setFallbackForSrc] = useState(null);
  const activeSrc =
    fallbackSrc && fallbackForSrc === src ? fallbackSrc : src;
  const loaded = revealImmediately || loadedSrc === activeSrc;
  const failed = failedSrc === activeSrc;

  return (
    <Frame
      {...frameProps}
      className={className}
      $loaded={loaded}
      $failed={failed}
      $aspectRatio={aspectRatio}
      aria-busy={!loaded && !failed}>
      <Picture>
        {sources.map((source) => (
          <source
            key={`${source.type}-${source.media || "all"}`}
            type={source.type}
            srcSet={source.srcSet}
            sizes={source.sizes || imageProps.sizes}
            media={source.media}
          />
        ))}
        <Image
          src={activeSrc}
          alt={alt}
          $fit={fit}
          $position={position}
          $loaded={loaded}
          onLoad={(event) => {
            setLoadedSrc(activeSrc);
            setFailedSrc(null);
            onLoad?.(event);
          }}
          onError={(event) => {
            if (fallbackSrc && activeSrc !== fallbackSrc) {
              setFallbackForSrc(src);
              setFailedSrc(null);
              setLoadedSrc(null);
              return;
            }

            setFailedSrc(activeSrc);
            setLoadedSrc(null);
            onError?.(event);
          }}
          {...imageProps}
        />
      </Picture>
      {failed && (
        <ErrorState role="img" aria-label={`${alt} görseli yüklenemedi`}>
          <HiOutlinePhoto aria-hidden="true" />
        </ErrorState>
      )}
    </Frame>
  );
}

export default ProgressiveImage;
