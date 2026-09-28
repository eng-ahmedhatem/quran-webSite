import { Component } from "react";
import { FaHome, FaRedoAlt, FaWhatsapp } from "react-icons/fa";
import "./error-boundary.css";

const SUPPORT_URL = `https://wa.me/201090665351?text=${encodeURIComponent("السلام عليكم، ظهرت مشكلة غير متوقعة في تطبيق القرآن الكريم.")}`;

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, details) {
    if (import.meta.env.DEV) console.error("Unhandled application error", error, details);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return <main className="fatal-error" role="alert">
      <img src="/img/logo.png" alt="" />
      <span>حدث توقف غير متوقع</span>
      <h1>تعذّر عرض هذه الصفحة</h1>
      <p>بياناتك المحفوظة لم تُحذف. جرّب إعادة تحميل التطبيق أو العودة للرئيسية.</p>
      <div>
        <button type="button" onClick={() => window.location.reload()}><FaRedoAlt /> إعادة التحميل</button>
        <a href="/"><FaHome /> الرئيسية</a>
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> إبلاغ الدعم</a>
      </div>
    </main>;
  }
}
