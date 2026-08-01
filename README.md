## Overview

**Churn Radar** predicts whether a telecom customer is likely to cancel their service, using a Decision Tree classifier trained on the [IBM Telco Customer Churn dataset](https://www.kaggle.com/datasets/blastchar/telco-customer-churn). The project takes that model out of a notebook and wraps it in a real application: a validated REST API and a polished React interface, ready to demo or deploy.

---

## Why this project stands out

| | |
|---|---|
| 🔁 **Two interchangeable backends** | The same prediction logic is implemented in both **Flask** and **FastAPI**, sharing a single `model_utils.py` module — demonstrating framework versatility and clean separation of concerns. |
| ✅ **Verified correctness** | The feature-encoding pipeline was validated row-for-row against the original training data (`tel_churn.csv`) to guarantee the API's predictions exactly match the trained model — not an approximation. |
| 🎯 **Real input validation** | Every request is checked against the model's expected categories and types before it ever reaches the model, returning clear `422` errors instead of silent failures or crashes. |
| 🎨 **Thoughtful frontend design** | A custom animated signal-gauge visualizes churn probability, built from scratch in SVG — not just numbers in a table. |
| 📦 **Batch predictions** | Supports scoring a single customer or a full list in one request, closer to how this would be used in a real retention workflow. |
| 📖 **Self-documenting API** | FastAPI's interactive Swagger docs (`/docs`) let anyone explore and test the API with zero setup. |

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Custom CSS design system (no UI framework — every component hand-built)
- Hand-rolled SVG data visualization (signal gauge)

**Backend**
- FastAPI (Pydantic-validated schemas, async-ready, auto-generated OpenAPI docs)
- Flask (lightweight alternative implementation, same contract)
- Shared preprocessing module across both backends

**Machine Learning**
- scikit-learn `DecisionTreeClassifier`
- Class imbalance handled with `imblearn.SMOTEENN`
- Feature engineering: one-hot encoding + tenure bucketing, reconstructed at inference time to exactly match training

---

## Architecture

```
┌─────────────────────┐        HTTP / JSON        ┌──────────────────────────┐
│   React + Vite SPA   │ ─────────────────────────▶│  FastAPI  or  Flask API   │
│  (Churn Radar UI)     │◀───────────────────────── │  /api/predict             │
└─────────────────────┘                            │  /api/predict/batch       │
                                                     │  /api/health, /api/schema │
                                                     └────────────┬─────────────┘
                                                                  │
                                                     ┌────────────▼─────────────┐
                                                     │   model_utils.py          │
                                                     │   • input validation      │
                                                     │   • feature encoding      │
                                                     │   • model.sav inference   │
                                                     └────────────────────────────┘
```

---

## Project Structure

```
churn-app/
├── backend-flask/
│   ├── app.py                 # Flask routes
│   ├── model_utils.py         # Shared preprocessing + prediction logic
│   ├── model.sav               # Trained Decision Tree model
│   └── requirements.txt
│
├── backend-fastapi/
│   ├── main.py                 # FastAPI routes + Pydantic schemas
│   ├── model_utils.py         # Shared preprocessing + prediction logic
│   ├── model.sav               # Trained Decision Tree model
│   └── requirements.txt
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx             # Root component
        ├── api.js              # API client for backend calls
        ├── fieldConfig.js      # Form field definitions
        └── components/
            ├── CustomerForm.jsx    # Customer input form
            ├── ResultPanel.jsx     # Prediction result display
            └── SignalGauge.jsx     # Churn probability gauge visualization
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Service and model status |
| `GET`  | `/api/schema` | Field names and allowed categorical values |
| `POST` | `/api/predict` | Predict churn for a single customer |
| `POST` | `/api/predict/batch` | Predict churn for a list of customers |

**Example request** — `POST /api/predict`

```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": 1,
  "PhoneService": "No",
  "MultipleLines": "No phone service",
  "InternetService": "DSL",
  "OnlineSecurity": "No",
  "OnlineBackup": "Yes",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 29.85,
  "TotalCharges": 29.85
}
```

**Example response**

```json
{
  "churn": true,
  "churn_label": "Yes",
  "probability_no_churn": 0.0316,
  "probability_churn": 0.9684
}
```

---

## Getting Started

### Prerequisites
- Python 3.11 or 3.12
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/churn-app.git
cd churn-app
```

### 2. Run a backend

**FastAPI** (recommended — includes interactive docs at `/docs`)

```bash
cd backend-fastapi
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**or Flask**

```bash
cd backend-flask
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. By default it talks to FastAPI on port 8000 — update `vite.config.js` or `.env` to point at Flask (`:5000`) instead.

### 4. Build for production

```bash
cd frontend
npm run build
npm run preview
```

---

## Engineering Notes

- **Exact feature parity with training data.** The model was trained with `feature_names_in_` stored on it, so `model_utils.py` reconstructs a DataFrame with those precise 50 columns, in the exact order the model expects — eliminating a common source of silent prediction bugs.
- **Faithful tenure bucketing.** Reproduces the original notebook's binning: `pd.cut(tenure, range(1, 80, 12), right=False, labels=[...])`.
- **Fail-fast validation.** Unknown categorical values or missing/non-numeric fields are rejected with a `422` before ever reaching the model.

 

---

<div align="center">
<sub>Built as a hands-on demonstration of shipping a machine learning model as a real, usable product — from notebook to API to interface.</sub>
</div>
