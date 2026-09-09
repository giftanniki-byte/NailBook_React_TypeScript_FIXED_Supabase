import { useEffect } from "react";

/**
 * Sets the browser tab title and the page's meta description on mount.
 * Drop this at the top of any page component to give it its own SEO
 * title/description instead of the one static pair in index.html.
 *
 * Usage:
 *   <PageMeta title="Find a Nail Artist | NailBook" description="Browse..." />
 */
export default function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [title, description]);

  return null;
}
