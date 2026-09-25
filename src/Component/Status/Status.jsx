export default function Status({ message, action, actionLabel = "إعادة المحاولة" }) {
  return (
    <div className="status-message" role="status">
      <span>{message}</span>
      {action && <button type="button" onClick={action}>{actionLabel}</button>}
    </div>
  );
}

