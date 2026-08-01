import SignalGauge from "./SignalGauge.jsx";

const TONE_COPY = {
  safe: {
    heading: "Stable signal",
    body: "This customer shows a low likelihood of churning. Standard engagement is sufficient.",
  },
  watch: {
    heading: "Weakening signal",
    body: "Some churn risk is present. Consider a proactive check-in or a small retention offer.",
  },
  risk: {
    heading: "Signal at risk",
    body: "High churn probability. Prioritize this account for retention outreach.",
  },
};

function toneFor(p) {
  if (p >= 0.7) return "risk";
  if (p >= 0.4) return "watch";
  return "safe";
}

export default function ResultPanel({ result, error, loading }) {
  return (
    <div className="result">
      <div className="result__header">
        <span className="result__eyebrow">Readout</span>
        <h2 className="result__title">Churn signal</h2>
      </div>

      {error && <div className="result__error">{error}</div>}

      {!result && !error && !loading && (
        <div className="result__empty">
          <p>Fill in the customer profile and run a prediction to see the churn signal here.</p>
        </div>
      )}

      {loading && (
        <div className="result__empty">
          <p>Reading the signal…</p>
        </div>
      )}

      {result && !loading && (
        <>
          <SignalGauge
            probability={result.probability_churn}
            label={result.churn ? "Likely to churn" : "Likely to stay"}
          />

          <div className={`result__badge result__badge--${toneFor(result.probability_churn)}`}>
            {TONE_COPY[toneFor(result.probability_churn)].heading}
          </div>
          <p className="result__body">{TONE_COPY[toneFor(result.probability_churn)].body}</p>

          <dl className="result__stats">
            <div>
              <dt>P(stay)</dt>
              <dd>{(result.probability_no_churn * 100).toFixed(1)}%</dd>
            </div>
            <div>
              <dt>P(churn)</dt>
              <dd>{(result.probability_churn * 100).toFixed(1)}%</dd>
            </div>
          </dl>
        </>
      )}
    </div>
  );
}
