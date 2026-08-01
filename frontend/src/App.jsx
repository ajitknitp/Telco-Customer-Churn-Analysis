import { useEffect, useState } from "react";
import CustomerForm from "./components/CustomerForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import { initialCustomer } from "./fieldConfig.js";
import { checkHealth, predictChurn } from "./api.js";
import "./App.css";

export default function App() {
  const [values, setValues] = useState(initialCustomer);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...values,
        SeniorCitizen: Number(values.SeniorCitizen),
        tenure: Number(values.tenure),
        MonthlyCharges: Number(values.MonthlyCharges),
        TotalCharges: Number(values.TotalCharges),
      };
      const data = await predictChurn(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true" />
          <span className="topbar__name">Churn Radar</span>
        </div>
        <div className={`status status--${apiStatus}`}>
          <span className="status__dot" />
          {apiStatus === "online" && "API connected"}
          {apiStatus === "offline" && "API unreachable — start the backend"}
          {apiStatus === "checking" && "Checking API…"}
        </div>
      </header>

      <main className="layout">
        <section className="panel panel--form">
          <div className="panel__intro">
            <span className="panel__eyebrow">Customer profile</span>
            <h1 className="panel__title">Predict retention risk</h1>
            <p className="panel__subtitle">
              Enter the account, service, and billing details for a telecom customer to estimate
              their likelihood of churning.
            </p>
          </div>
          <CustomerForm values={values} onChange={setValues} onSubmit={handleSubmit} loading={loading} />
        </section>

        <aside className="panel panel--result">
          <ResultPanel result={result} error={error} loading={loading} />
        </aside>
      </main>

      <footer className="footer">
        <span>Decision tree model · trained on IBM Telco Customer Churn dataset</span>
      </footer>
    </div>
  );
}
