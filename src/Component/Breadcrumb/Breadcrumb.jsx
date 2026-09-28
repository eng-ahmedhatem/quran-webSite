import { FaChevronLeft, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./breadcrumb.css";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="page-breadcrumb" aria-label="مسار الصفحة">
      <ol>
        <li><Link to="/"><FaHome aria-hidden="true" /><span>الرئيسية</span></Link></li>
        {items.map((item, index) => <li key={`${item.label}-${index}`}>
          <FaChevronLeft className="breadcrumb-separator" aria-hidden="true" />
          {item.to && index < items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}
        </li>)}
      </ol>
    </nav>
  );
}
