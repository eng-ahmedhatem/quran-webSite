import { memo } from 'react';

const SalahCard = memo(({ name, time, next }) => {
  return (
    <article className={`salah-card ${next ? "next" : ""} ${ next && next.name}` } aria-current={next ? "true" : undefined}>
      {next && <span className="nextSalah">الصلاة التالية</span>}
      <h2>{name}</h2>
      {next && <span className="timeNext">{next.timeLeft}</span>}
      <p>{time}</p>
    </article>
  );
});
SalahCard.displayName = "SalahCard";

export default SalahCard;
