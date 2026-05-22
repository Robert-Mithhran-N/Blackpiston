import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollToTop Component
 * 
 * Implements a global scroll restoration / scroll-to-top system for React Router.
 * Ensures that whenever a user navigates to a new page or product, the page 
 * automatically starts from the top. Handles dynamic routes, query params, 
 * filter updates, and pagination changes.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // If the user presses the Browser Back or Forward button (POP),
    // we abort the manual scroll to top so the browser's native scroll
    // restoration can return them to their previous exact scroll position.
    if (navType === "POP") {
      return;
    }

    // We use requestAnimationFrame and a slight timeout to ensure this runs 
    // after any new content is rendered and the DOM is painted, preventing
    // weird jump behavior or partial renders on mobile.
    const scroll = () => {
      // Instant scroll is used to match Amazon/Nike UX where the new page
      // starts "cleanly from the top" immediately without a distracting scroll animation.
      window.scrollTo(0, 0);
    };

    // Use requestAnimationFrame for smoother integration with the browser's paint cycle
    const rafId = requestAnimationFrame(() => {
      // Small timeout as a fallback for heavy React renders
      setTimeout(scroll, 10);
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, navType]); // Re-run on route changes AND query param changes (pagination/filters)

  return null;
}
