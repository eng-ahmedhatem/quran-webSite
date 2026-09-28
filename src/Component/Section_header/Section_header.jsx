export default function SectionHeader({ title, eyebrow, subtitle, as: Heading = "h1" }) {
  return <div className="Section_header">
    {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
    <Heading>{title}</Heading>
    {subtitle && <p>{subtitle}</p>}
  </div>;
}
