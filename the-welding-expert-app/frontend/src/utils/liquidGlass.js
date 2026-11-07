const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const DEFINITIONS_ID = "welding-liquid-glass-definitions";
let filterSequence = 0;

export const NAVBAR_GLASS_CONFIG = Object.freeze({
  glassThickness: 80,
  bezelWidth: 40,
  ior: 1.4,
  scaleRatio: 1,
  blur: 1,
  specularOpacity: 0.6,
  specularSat: 0,
  tintColor: "255,255,255",
  tintOpacity: 0,
  innerShadow: "rgba(255,255,255,0)",
  innerShadowBlur: 0,
  innerShadowSpread: 0,
  balancedSpecular: false,
});

export const SWITCHER_GLASS_CONFIG = Object.freeze({
  glassThickness: 30,
  bezelWidth: 40,
  ior: 1.4,
  scaleRatio: 1,
  blur: 0,
  specularOpacity: 0.5,
  specularSat: 0,
  tintColor: "255,255,255",
  tintOpacity: 0,
  innerShadow: "rgba(255,255,255,0)",
  innerShadowBlur: 0,
  innerShadowSpread: 0,
  balancedSpecular: true,
});

function surface(x) {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

function calculateRefractionProfile(glassThickness, bezelWidth, ior, samples = 128) {
  const eta = 1 / ior;
  const profile = new Float64Array(samples);

  function refract(normalX, normalY) {
    const dot = normalY;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null;
    const root = Math.sqrt(k);
    return [
      -(eta * dot + root) * normalX,
      eta - (eta * dot + root) * normalY,
    ];
  }

  for (let index = 0; index < samples; index += 1) {
    const x = index / samples;
    const y = surface(x);
    const delta = x < 1 ? 0.0001 : -0.0001;
    const derivative = (surface(x + delta) - y) / delta;
    const magnitude = Math.sqrt(derivative * derivative + 1);
    const refraction = refract(-derivative / magnitude, -1 / magnitude);
    profile[index] = refraction
      ? refraction[0] * ((y * bezelWidth + glassThickness) / refraction[1])
      : 0;
  }

  return profile;
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, context: canvas.getContext("2d") };
}

function generateDisplacementMap(width, height, radius, bezelWidth, profile, maxDisplacement) {
  const { canvas, context } = createCanvas(width, height);
  const image = context.createImageData(width, height);
  const pixels = image.data;

  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = 128;
    pixels[index + 1] = 128;
    pixels[index + 2] = 0;
    pixels[index + 3] = 255;
  }

  const radiusSquared = radius * radius;
  const outerSquared = (radius + 1) ** 2;
  const innerSquared = Math.max(radius - bezelWidth, 0) ** 2;
  const horizontalBody = width - radius * 2;
  const verticalBody = height - radius * 2;

  for (let yPosition = 0; yPosition < height; yPosition += 1) {
    for (let xPosition = 0; xPosition < width; xPosition += 1) {
      const x = xPosition < radius
        ? xPosition - radius
        : xPosition >= width - radius ? xPosition - radius - horizontalBody : 0;
      const y = yPosition < radius
        ? yPosition - radius
        : yPosition >= height - radius ? yPosition - radius - verticalBody : 0;
      const distanceSquared = x * x + y * y;
      if (distanceSquared > outerSquared || distanceSquared < innerSquared) continue;

      const distance = Math.sqrt(distanceSquared);
      const distanceFromEdge = radius - distance;
      const opacity = distanceSquared < radiusSquared
        ? 1
        : 1 - ((distance - Math.sqrt(radiusSquared))
          / (Math.sqrt(outerSquared) - Math.sqrt(radiusSquared)));
      if (opacity <= 0 || distance === 0) continue;

      const cosine = x / distance;
      const sine = y / distance;
      const profileIndex = Math.min(
        Math.floor((distanceFromEdge / bezelWidth) * profile.length),
        profile.length - 1,
      );
      const displacement = profile[profileIndex] || 0;
      const displacementX = (-cosine * displacement) / maxDisplacement;
      const displacementY = (-sine * displacement) / maxDisplacement;
      const pixelIndex = (yPosition * width + xPosition) * 4;
      pixels[pixelIndex] = 128 + displacementX * 127 * opacity;
      pixels[pixelIndex + 1] = 128 + displacementY * 127 * opacity;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

function generateSpecularMap(width, height, radius, bezelWidth, balanced) {
  const angle = Math.PI / 3;
  const { canvas, context } = createCanvas(width, height);
  const image = context.createImageData(width, height);
  const pixels = image.data;
  pixels.fill(0);

  const radiusSquared = radius * radius;
  const outerSquared = (radius + 1) ** 2;
  const innerSquared = Math.max(radius - bezelWidth, 0) ** 2;
  const horizontalBody = width - radius * 2;
  const verticalBody = height - radius * 2;
  const specularVector = [Math.cos(angle), Math.sin(angle)];

  for (let yPosition = 0; yPosition < height; yPosition += 1) {
    for (let xPosition = 0; xPosition < width; xPosition += 1) {
      const x = xPosition < radius
        ? xPosition - radius
        : xPosition >= width - radius ? xPosition - radius - horizontalBody : 0;
      const y = yPosition < radius
        ? yPosition - radius
        : yPosition >= height - radius ? yPosition - radius - verticalBody : 0;
      const distanceSquared = x * x + y * y;
      if (distanceSquared > outerSquared || distanceSquared < innerSquared) continue;

      const distance = Math.sqrt(distanceSquared);
      const distanceFromEdge = radius - distance;
      const opacity = distanceSquared < radiusSquared
        ? 1
        : 1 - ((distance - Math.sqrt(radiusSquared))
          / (Math.sqrt(outerSquared) - Math.sqrt(radiusSquared)));
      if (opacity <= 0 || distance === 0) continue;

      const cosine = x / distance;
      const sine = -y / distance;
      const dot = balanced
        ? 1
        : Math.abs(cosine * specularVector[0] + sine * specularVector[1]);
      const edge = Math.sqrt(Math.max(0, 1 - (1 - distanceFromEdge) ** 2));
      const coefficient = dot * edge;
      const color = Math.floor(255 * coefficient);
      const alpha = Math.floor(color * coefficient * opacity);
      const pixelIndex = (yPosition * width + xPosition) * 4;
      pixels[pixelIndex] = color;
      pixels[pixelIndex + 1] = color;
      pixels[pixelIndex + 2] = color;
      pixels[pixelIndex + 3] = alpha;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

function svgElement(tag, attributes) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  return element;
}

function ensureDefinitions() {
  const existing = document.getElementById(DEFINITIONS_ID);
  if (existing && document.documentElement.contains(existing)) return existing;

  const svg = svgElement("svg", {
    width: "0",
    height: "0",
    "aria-hidden": "true",
  });
  svg.classList.add("liquid-glass-definitions");
  const definitions = svgElement("defs", { id: DEFINITIONS_ID });
  svg.appendChild(definitions);
  document.documentElement.appendChild(svg);
  return definitions;
}

function buildFilter(id, width, height, radius, config) {
  const bezelWidth = Math.max(
    1,
    Math.min(config.bezelWidth, radius - 1, Math.min(width, height) / 2 - 1),
  );
  const profile = calculateRefractionProfile(
    config.glassThickness,
    bezelWidth,
    config.ior,
  );
  const maxDisplacement = Math.max(...Array.from(profile).map(Math.abs)) || 1;
  const displacementUrl = generateDisplacementMap(
    width,
    height,
    radius,
    bezelWidth,
    profile,
    maxDisplacement,
  );
  const specularUrl = generateSpecularMap(
    width,
    height,
    radius,
    bezelWidth * 2.5,
    Boolean(config.balancedSpecular),
  );
  const scale = maxDisplacement * config.scaleRatio;
  const padding = config.balancedSpecular ? 0.36 : 0;
  const filter = svgElement("filter", {
    id,
    x: String(Math.round(-width * padding)),
    y: String(Math.round(-height * padding)),
    width: String(Math.round(width * (1 + padding * 2))),
    height: String(Math.round(height * (1 + padding * 2))),
    filterUnits: "userSpaceOnUse",
    primitiveUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  });

  const blur = svgElement("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: String(config.blur),
    result: "blurred",
  });
  const displacementImage = svgElement("feImage", {
    href: displacementUrl,
    x: "0",
    y: "0",
    width: String(width),
    height: String(height),
    result: "displacement-map",
  });
  const displacement = svgElement("feDisplacementMap", {
    in: "blurred",
    in2: "displacement-map",
    scale: String(scale),
    xChannelSelector: "R",
    yChannelSelector: "G",
    result: "displaced",
  });
  const saturation = svgElement("feColorMatrix", {
    in: "displaced",
    type: "saturate",
    values: String(config.specularSat),
    result: "displaced-saturation",
  });
  const specular = svgElement("feImage", {
    href: specularUrl,
    x: "0",
    y: "0",
    width: String(width),
    height: String(height),
    result: "specular-layer",
  });
  const specularMask = svgElement("feComposite", {
    in: "displaced-saturation",
    in2: "specular-layer",
    operator: "in",
    result: "specular-masked",
  });
  const transfer = svgElement("feComponentTransfer", {
    in: "specular-layer",
    result: "specular-faded",
  });
  transfer.appendChild(svgElement("feFuncA", {
    type: "linear",
    slope: String(config.specularOpacity),
  }));
  const saturationBlend = svgElement("feBlend", {
    in: "specular-masked",
    in2: "displaced",
    mode: "normal",
    result: "with-saturation",
  });
  const finalBlend = svgElement("feBlend", {
    in: "specular-faded",
    in2: "with-saturation",
    mode: "normal",
  });

  filter.append(
    blur,
    displacementImage,
    displacement,
    saturation,
    specular,
    specularMask,
    transfer,
    saturationBlend,
    finalBlend,
  );
  return filter;
}

export function attachLiquidGlass(element, config = NAVBAR_GLASS_CONFIG) {
  if (!element || typeof ResizeObserver === "undefined") {
    return { rebuild() {}, destroy() {} };
  }

  if (getComputedStyle(element).position === "static") {
    element.style.position = "relative";
  }

  const refractionLayer = document.createElement("span");
  refractionLayer.className = "liquid-glass-layer liquid-glass-refraction";
  const tintLayer = document.createElement("span");
  tintLayer.className = "liquid-glass-layer liquid-glass-tint";
  element.prepend(tintLayer);
  element.prepend(refractionLayer);

  let filterNode = null;
  let rebuildTimer = null;

  function elevateContent() {
    Array.from(element.children).forEach((child) => {
      if (child === refractionLayer || child === tintLayer) return;
      if (getComputedStyle(child).position === "static") {
        child.style.position = "relative";
      }
      if (!child.style.zIndex) child.style.zIndex = "1";
    });
  }

  function rebuild() {
    const definitions = ensureDefinitions();
    const bounds = element.getBoundingClientRect();
    const width = Math.round(element.offsetWidth || bounds.width);
    const height = Math.round(element.offsetHeight || bounds.height);
    if (width < 4 || height < 4) return;

    const declaredRadius = Number.parseFloat(element.dataset.radius || "0");
    const computedRadius = Number.parseFloat(
      getComputedStyle(element).borderTopLeftRadius || "0",
    );
    const radius = Math.max(
      2,
      Math.min(declaredRadius || computedRadius || 24, width / 2, height / 2),
    );

    filterNode?.remove();
    const filterId = `welding-liquid-glass-${filterSequence += 1}`;
    filterNode = buildFilter(filterId, width, height, radius, config);
    definitions.appendChild(filterNode);

    refractionLayer.style.borderRadius = `${radius}px`;
    refractionLayer.style.backdropFilter = `url(#${filterId})`;
    refractionLayer.style.webkitBackdropFilter = `url(#${filterId})`;
    tintLayer.style.borderRadius = `${radius}px`;
    tintLayer.style.backgroundColor = `rgba(${config.tintColor},${config.tintOpacity})`;
    tintLayer.style.boxShadow = `inset 0 0 ${config.innerShadowBlur}px ${config.innerShadowSpread}px ${config.innerShadow}`;
    elevateContent();
  }

  function scheduleRebuild() {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(rebuild, 16);
  }

  const observer = new ResizeObserver(scheduleRebuild);
  observer.observe(element);
  rebuild();

  return {
    rebuild,
    destroy() {
      window.clearTimeout(rebuildTimer);
      observer.disconnect();
      filterNode?.remove();
      refractionLayer.remove();
      tintLayer.remove();
    },
  };
}
