import { useEffect } from "react";
import PropTypes from "prop-types";
import { BUSINESS_URL } from "../config/business";

function SEO({ title, description, canonicalPath, schema }) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);
    }

    // 2. Update Description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = description;
        document.head.appendChild(meta);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute("content", description);
    }

    // 3. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const fullCanonicalUrl = `${BUSINESS_URL}${canonicalPath || ""}`;
    
    if (canonicalLink) {
      canonicalLink.setAttribute("href", fullCanonicalUrl);
    } else {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      canonicalLink.href = fullCanonicalUrl;
      document.head.appendChild(canonicalLink);
    }

    // 4. Inject JSON-LD Schema
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

    // Cleanup function
    return () => {
      // Remove schema script if page changes
      const existingScript = document.getElementById("jsonld-seo-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, canonicalPath, schema]);

  return null;
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonicalPath: PropTypes.string,
  schema: PropTypes.object,
};

export default SEO;
