import { useEffect, useState } from 'react';

import { formatVisitorLabel } from './footer-format';

export default function Footer() {
  const [visitors, setVisitors] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadVisitors() {
      try {
        const res = await fetch('/api/analytics/visitors');
        const data = await res.json().catch(() => null);
        if (!res.ok || typeof data?.visitors !== 'number') return;
        if (isActive) setVisitors(data.visitors);
      } catch {
        // Keep the copyright line visible if analytics is unavailable.
      }
    }

    loadVisitors();
    return () => {
      isActive = false;
    };
  }, []);

  const visitorLabel = formatVisitorLabel(visitors);

  return (
    <footer className="footer">
      <p id="footer_p">© 2026 devesh krishan | portfolio.</p>
      {visitorLabel ? (
        <p className="footer-visitors" aria-live="polite">
          {visitorLabel}
        </p>
      ) : null}
    </footer>
  );
}
