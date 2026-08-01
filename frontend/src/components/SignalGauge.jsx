const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 96;
const START_ANGLE = 200; // degrees, sweeps from bottom-left to bottom-right
const SWEEP = 220;

function polarToCartesian(angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
}

function describeArc(startAngle, endAngle) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

// probability: 0..1
export default function SignalGauge({ probability, label }) {
  const angle = START_ANGLE + SWEEP * probability;
  const needleTip = polarToCartesian(angle);
  const needleBase1 = polarToCartesian(angle - 90);
  const needleBase2 = polarToCartesian(angle + 90);

  const zoneBounds = [0, 0.4, 0.7, 1];
  const zoneColors = ["var(--accent-safe)", "var(--accent-watch)", "var(--accent-risk)"];

  const tone =
    probability >= 0.7 ? "risk" : probability >= 0.4 ? "watch" : "safe";

  return (
    <div className="gauge">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="gauge__svg">
        {zoneBounds.slice(0, -1).map((start, i) => {
          const end = zoneBounds[i + 1];
          return (
            <path
              key={i}
              d={describeArc(START_ANGLE + SWEEP * start, START_ANGLE + SWEEP * end)}
              stroke={zoneColors[i]}
              strokeOpacity="0.85"
              strokeWidth="10"
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}

        {Array.from({ length: 11 }).map((_, i) => {
          const t = i / 10;
          const a = START_ANGLE + SWEEP * t;
          const outer = polarToCartesian(a);
          const rad = ((a - 90) * Math.PI) / 180;
          const inner = {
            x: CENTER + (RADIUS - 14) * Math.cos(rad),
            y: CENTER + (RADIUS - 14) * Math.sin(rad),
          };
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--text-faint)"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}

        <line
          x1={needleBase1.x}
          y1={needleBase1.y - (needleBase1.y - CENTER) * 0.85}
          x2={needleTip.x}
          y2={needleTip.y}
          className="gauge__needle-line"
        />
        <line
          x1={CENTER}
          y1={CENTER}
          x2={needleTip.x}
          y2={needleTip.y}
          className="gauge__needle-line"
        />
        <circle cx={CENTER} cy={CENTER} r="7" className="gauge__hub" />
      </svg>

      <div className="gauge__readout">
        <span className={`gauge__value gauge__value--${tone}`}>
          {(probability * 100).toFixed(1)}
          <span className="gauge__percent">%</span>
        </span>
        <span className="gauge__caption">{label}</span>
      </div>
    </div>
  );
}
