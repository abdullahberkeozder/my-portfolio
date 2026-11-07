import ProgressiveImage from "./ProgressiveImage";
import { getResponsiveImageProps } from "../utils/responsiveImages";

function ResponsiveImage({ src, sizes, ...props }) {
  return (
    <ProgressiveImage
      {...getResponsiveImageProps(src, sizes)}
      {...props}
    />
  );
}

export default ResponsiveImage;
