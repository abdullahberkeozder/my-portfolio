import { useEffect } from "react";
import PropTypes from "prop-types";
import { BUSINESS_URL } from "../config/business";

const DEFAULT_SOCIAL_IMAGE = `${BUSINESS_URL}/umut-usta-logo.png`;

function upsertMeta(selector, attributes) {
  let meta = document.querySelector(selector);

  if (!meta) {
    meta = document.createElement("meta");
    document.head.appendChild(meta);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    meta.setAttribute(name, value);
  });
}

function SEO({
  title,
  description,
  canonicalPath,
  schema,
  socialImage = DEFAULT_SOCIAL_IMAGE,
  noIndex = false,
}) {
  useEffect(() => {
    const resolvedPath = canonicalPath || window.location.pathname;
    const fullCanonicalUrl = `${BUSINESS_URL}${resolvedPath === "/" ? "/appointment" : resolvedPath}`;

    if (title) {
      document.title = title;
      upsertMeta('meta[property="og:title"]', {
        property: "og:title",
        content: title,
      });
      upsertMeta('meta[name="twitter:title"]', {
        name: "twitter:title",
        content: title,
      });
    }

    if (description) {
      upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
      });
      upsertMeta('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
      upsertMeta('meta[name="twitter:description"]', {
        name: "twitter:description",
        content: description,
      });
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]');

    if (canonicalLink) {
      canonicalLink.setAttribute("href", fullCanonicalUrl);
    } else {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      canonicalLink.href = fullCanonicalUrl;
      document.head.appendChild(canonicalLink);
    }

    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: fullCanonicalUrl,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: socialImage,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: socialImage,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : "index, follow",
    });

    let scriptTag = document.getElementById("jsonld-seo-schema");
    if (schema) {
      if (scriptTag) {
        scriptTag.textContent = JSON.stringify(schema);
      } else {
        scriptTag = document.createElement("script");
        scriptTag.id = "jsonld-seo-schema";
        scriptTag.type = "application/ld+json";
        scriptTag.textContent = JSON.stringify(schema);
        document.head.appendChild(scriptTag);
      }
    }

    return () => {
      const existingScript = document.getElementById("jsonld-seo-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, canonicalPath, schema, socialImage, noIndex]);

  return null;
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonicalPath: PropTypes.string,
  schema: PropTypes.object,
  socialImage: PropTypes.string,
  noIndex: PropTypes.bool,
};

export default SEO;
