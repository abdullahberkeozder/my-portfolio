import PropTypes from "prop-types";

const LOGO_VARIANTS = Object.freeze({
  mark: { src: "/umut-usta-logo.svg", ratio: 1 },
  compact: { src: "/umut-usta-logo-compact.svg", ratio: 4 },
  horizontal: { src: "/umut-usta-logo-horizontal.svg", ratio: 2040 / 520 },
  monochrome: { src: "/umut-usta-logo-monochrome.svg", ratio: 1 },
  textured: { src: "/umut-usta-logo.png", ratio: 1 },
});

function BrandLogo({ variant = "mark", size = 3.6, style, alt = "Umut Usta", ...rest }) {
  const logo = LOGO_VARIANTS[variant] || LOGO_VARIANTS.mark;
  const height = `${size}rem`;
  const width = `${size * logo.ratio}rem`;

  return (
    <img
      src={logo.src}
      alt={alt}
      data-brand-logo={variant}
      width={Math.round(size * logo.ratio * 10)}
      height={Math.round(size * 10)}
      style={{
        width,
        height,
        objectFit: "contain",
        filter: variant === "textured" ? "none" : "var(--brand-logo-filter)",
        ...style,
      }}
      {...rest}
    />
  );
}

BrandLogo.propTypes = {
  alt: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
  variant: PropTypes.oneOf(Object.keys(LOGO_VARIANTS)),
};

export default BrandLogo;
