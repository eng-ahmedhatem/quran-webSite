import "./skeleton.css";

const Cards = ({ count = 6 }) => <div className="skeleton-grid">{Array.from({ length: count }, (_, index) => <div className="skeleton-card" key={index}><i /><span /><span /></div>)}</div>;

export default function PageSkeleton({ variant = "page", compact = false, label = "جارٍ تحميل المحتوى" }) {
  if (compact) return <div className="skeleton-compact" role="status" aria-label={label}><Cards count={4} /></div>;

  return <section className={`page-skeleton skeleton-${variant}`} role="status" aria-live="polite" aria-label={label}>
    <div className="skeleton-hero"><div><i /><span /><span /><span /></div><b /></div>
    {variant === "reader" && <div className="skeleton-toolbar"><span /><span /><span /></div>}
    {variant === "reader" ? <div className="skeleton-reading">{Array.from({ length: 7 }, (_, index) => <span key={index} />)}</div> : <Cards count={variant === "timing" ? 6 : 5} />}
    <p>نُحضّر لك المحتوى…</p>
  </section>;
}
