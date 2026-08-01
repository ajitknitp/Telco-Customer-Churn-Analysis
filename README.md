# Churn Radar — Telco Customer Churn Prediction

A full-stack app around your trained `model.sav` (Decision Tree, SMOTEENN-balanced) from the
Telco Customer Churn notebooks:

- **frontend/** — React + Vite single-page app ("Churn Radar") with a form for customer details
  and a live signal-gauge showing churn probability.
- **backend-flask/** — Flask REST API serving the model.
- **backend-fastapi/** — FastAPI REST API serving the same model (with auto-generated docs at
  `/docs`). Pick **either** backend — both expose an identical contract, so the frontend works
  with whichever one is running.

Both backends share the same prediction logic (`model_utils.py`), which:
1. Takes the raw, human-readable customer fields (e.g. `gender: "Female"`, `Contract: "Two year"`).
2. Recreates the exact one-hot encoding + `tenure_group` binning used when the model was trained
   (verified against `tel_churn.csv` row-for-row).
3. Reindexes columns to `model.feature_names_in_` so the column order always matches the model.
4. Returns the churn label and probabilities.

## Project layout

```
churn-app/
├── backend-flask/
│   ├── app.py            # Flask routes
│   ├── model_utils.py     # shared preprocessing + prediction logic
│   ├── model.sav          # your trained model
│   └── requirements.txt
├── backend-fastapi/
│   ├── main.py            # FastAPI routes + Pydantic schemas
│   ├── model_utils.py
│   ├── model.sav
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   ├── fieldConfig.js
    │   └── components/
    │       ├── CustomerForm.jsx
    │       ├── ResultPanel.jsx
    │       └── SignalGauge.jsx
    └── package.json
```

## 1. Run a backend

### Option A — FastAPI (recommended, has interactive docs)

```bash
cd backend-fastapi
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### Option B — Flask

```bash
cd backend-flask
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

- API: http://localhost:5000

Both expose:

| Method | Path                | Description                          |
|--------|---------------------|---------------------------------------|
| GET    | `/api/health`        | Service + model status               |
| GET    | `/api/schema`        | Field names & allowed categorical values |
| POST   | `/api/predict`       | Predict churn for one customer        |
| POST   | `/api/predict/batch` | Predict churn for a list of customers |

Example request body for `/api/predict`:

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

Example response:

```json
{
  "churn": true,
  "churn_label": "Yes",
  "probability_no_churn": 0.0316,
  "probability_churn": 0.9684
}
```

## 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- By default, Vite's dev proxy forwards `/api/*` calls to **FastAPI on port 8000**
  (see `vite.config.js`). To point it at Flask instead, change the `target` to
  `http://localhost:5000`.
- Alternatively, copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend's URL
  (useful for production builds, where there's no dev proxy).

## 3. Production build

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
npm run preview    # serve the build locally to sanity-check it
```

Deploy `frontend/dist` to any static host (Vercel, Netlify, S3 + CloudFront, nginx, etc.), and
deploy a backend (Flask with gunicorn, or FastAPI with uvicorn/gunicorn workers) behind HTTPS.
Set `VITE_API_BASE_URL` at build time to the backend's public URL, and tighten the CORS
`allow_origins` / `flask_cors` config to that frontend's origin.

## Notes

- The model was trained with `feature_names_in_` stored on it, so `model_utils.py` builds a
  pandas DataFrame with those exact 50 columns in the exact order the model expects — no manual
  column-order bookkeeping required.
- `tenure_group` bucketing mirrors the original notebook: `pd.cut(tenure, range(1, 80, 12),
  right=False, labels=[...])`.
- Validation (`ValidationError`) rejects unknown categorical values or missing/non-numeric fields
  with a `422` before ever touching the model.
