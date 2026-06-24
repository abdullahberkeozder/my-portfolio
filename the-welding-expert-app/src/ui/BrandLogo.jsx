function BrandLogo({ size = 3.6, style, ...rest }) {
  const dimension = `${size}rem`;

  return (
    <img
      src="/umut-usta-logo.png"
      alt="Umut Usta"
      style={{ width: dimension, height: dimension, ...style }}
      {...rest}
    />
  );
}

export default BrandLogo;
