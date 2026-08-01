import pandas as pd
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.sav")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

FEATURE_COLUMNS = list(model.feature_names_in_)

CATEGORICAL_FIELDS = {
    "gender": ["Female", "Male"],
    "Partner": ["No", "Yes"],
    "Dependents": ["No", "Yes"],
    "PhoneService": ["No", "Yes"],
    "MultipleLines": ["No", "No phone service", "Yes"],
    "InternetService": ["DSL", "Fiber optic", "No"],
    "OnlineSecurity": ["No", "No internet service", "Yes"],
    "OnlineBackup": ["No", "No internet service", "Yes"],
    "DeviceProtection": ["No", "No internet service", "Yes"],
    "TechSupport": ["No", "No internet service", "Yes"],
    "StreamingTV": ["No", "No internet service", "Yes"],
    "StreamingMovies": ["No", "No internet service", "Yes"],
    "Contract": ["Month-to-month", "One year", "Two year"],
    "PaperlessBilling": ["No", "Yes"],
    "PaymentMethod": ["Bank transfer (automatic)", "Credit card (automatic)", "Electronic check", "Mailed check"],
}

TENURE_LABELS = ["{0} - {1}".format(i, i + 11) for i in range(1, 72, 12)]
TENURE_BINS = list(range(1, 80, 12))

REQUIRED_FIELDS = [
    "gender", "SeniorCitizen", "Partner", "Dependents", "tenure", "PhoneService",
    "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
    "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
    "Contract", "PaperlessBilling", "PaymentMethod", "MonthlyCharges", "TotalCharges",
]


class ValidationError(Exception):
    pass


def validate_input(data):
    missing = [f for f in REQUIRED_FIELDS if f not in data or data[f] in (None, "")]
    if missing:
        raise ValidationError(f"Missing required fields: {', '.join(missing)}")

    for field, allowed in CATEGORICAL_FIELDS.items():
        if data[field] not in allowed:
            raise ValidationError(f"Invalid value for '{field}': {data[field]!r}. Allowed values: {allowed}")

    try:
        int(data["SeniorCitizen"])
        float(data["tenure"])
        float(data["MonthlyCharges"])
        float(data["TotalCharges"])
    except (ValueError, TypeError):
        raise ValidationError("SeniorCitizen, tenure, MonthlyCharges and TotalCharges must be numeric")


def tenure_to_group(tenure):
    tenure = int(float(tenure))
    for i in range(len(TENURE_BINS) - 1):
        lo, hi = TENURE_BINS[i], TENURE_BINS[i + 1]
        if lo <= tenure < hi:
            return TENURE_LABELS[i]
    if tenure >= TENURE_BINS[-1]:
        return TENURE_LABELS[-1]
    return None


def build_feature_row(data):
    row = {col: 0 for col in FEATURE_COLUMNS}
    row["SeniorCitizen"] = int(data["SeniorCitizen"])
    row["MonthlyCharges"] = float(data["MonthlyCharges"])
    row["TotalCharges"] = float(data["TotalCharges"])

    for field in CATEGORICAL_FIELDS:
        col_name = f"{field}_{data[field]}"
        if col_name in row:
            row[col_name] = 1

    tenure_group = tenure_to_group(data["tenure"])
    if tenure_group:
        col_name = f"tenure_group_{tenure_group}"
        if col_name in row:
            row[col_name] = 1

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def predict_churn(data):
    validate_input(data)
    X = build_feature_row(data)
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    return {
        "churn": bool(pred),
        "churn_label": "Yes" if pred == 1 else "No",
        "probability_no_churn": round(float(proba[0]), 4),
        "probability_churn": round(float(proba[1]), 4),
    }
