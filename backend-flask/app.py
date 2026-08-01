"""
Flask backend for the Telco Customer Churn Prediction app.

Endpoints
---------
GET  /api/health          -> service + model status
GET  /api/schema          -> field names / allowed values (used to build the frontend form)
POST /api/predict         -> run a single prediction
POST /api/predict/batch   -> run predictions for a list of customers
"""
from flask import Flask, request, jsonify
from flask_cors import CORS

from model_utils import (
    predict_churn,
    ValidationError,
    CATEGORICAL_FIELDS,
    REQUIRED_FIELDS,
    FEATURE_COLUMNS,
    model,
)

app = Flask(__name__)
CORS(app)  # allow the Vite dev server (and any frontend) to call this API


@app.get("/api/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "model_loaded": model is not None,
            "n_features": len(FEATURE_COLUMNS),
        }
    )


@app.get("/api/schema")
def schema():
    """Tells the frontend which fields to render and which options are valid."""
    return jsonify(
        {
            "required_fields": REQUIRED_FIELDS,
            "categorical_fields": CATEGORICAL_FIELDS,
            "numeric_fields": ["tenure", "MonthlyCharges", "TotalCharges"],
            "binary_fields": ["SeniorCitizen"],
        }
    )


@app.post("/api/predict")
def predict():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        result = predict_churn(data)
        return jsonify(result), 200
    except ValidationError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:  # pragma: no cover - safety net
        return jsonify({"error": f"Prediction failed: {e}"}), 500


@app.post("/api/predict/batch")
def predict_batch():
    payload = request.get_json(silent=True)
    if not isinstance(payload, list):
        return jsonify({"error": "Request body must be a JSON array of customer objects"}), 400

    results = []
    for i, record in enumerate(payload):
        try:
            results.append({"index": i, **predict_churn(record)})
        except ValidationError as e:
            results.append({"index": i, "error": str(e)})
    return jsonify({"results": results}), 200


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    # Runs on http://localhost:5000
    app.run(host="0.0.0.0", port=5000, debug=True)
