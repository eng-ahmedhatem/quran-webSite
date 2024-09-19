import React, { memo } from 'react';

const SalahCard = memo(({ name, time, next }) => {
  return (
    <div className={`salah-card ${next ? "next" : ""} ${ next && next.name}` } >
      {next && <span className="nextSalah">الصلاة التالية</span>}
      <h2>{name}</h2>
      {next && <span className="timeNext">{next.timeLeft}</span>}
      <p>{time}</p>
    </div>
  );
});

export default SalahCard;
