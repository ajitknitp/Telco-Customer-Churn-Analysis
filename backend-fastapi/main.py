"""
FastAPI backend for the Telco Customer Churn Prediction app.

Run with:
    uvicorn main:app --reload --port 8000

Interactive docs will be available at http://localhost:8000/docs
"""
from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model_utils import (
    predict_churn,
    ValidationError,
    CATEGORICAL_FIELDS,
    REQUIRED_FIELDS,
    FEATURE_COLUMNS,
    model,
)

app = FastAPI(
    title="Telco Churn Prediction API",
    description="Predicts whether a telecom customer is likely to churn.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CustomerInput(BaseModel):
    gender: Literal["Female", "Male"]
    SeniorCitizen: int = Field(..., ge=0, le=1)
    Partner: Literal["No", "Yes"]
    Dependents: Literal["No", "Yes"]
    tenure: float = Field(..., ge=0)
    PhoneService: Literal["No", "Yes"]
    MultipleLines: Literal["No", "No phone service", "Yes"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: Literal["No", "No internet service", "Yes"]
    OnlineBackup: Literal["No", "No internet service", "Yes"]
    DeviceProtection: Literal["No", "No internet service", "Yes"]
    TechSupport: Literal["No", "No internet service", "Yes"]
    StreamingTV: Literal["No", "No internet service", "Yes"]
    StreamingMovies: Literal["No", "No internet service", "Yes"]
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: Literal["No", "Yes"]
    PaymentMethod: Literal[
        "Bank transfer (automatic)",
        "Credit card (automatic)",
        "Electronic check",
        "Mailed check",
    ]
    MonthlyCharges: float
    TotalCharges: float

    class Config:
        json_schema_extra = {
            "example": {
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
                "TotalCharges": 29.85,
            }
        }


class PredictionOutput(BaseModel):
    churn: bool
    churn_label: str
    probability_no_churn: float
    probability_churn: float


class BatchResultItem(BaseModel):
    index: int
    churn: Optional[bool] = None
    churn_label: Optional[str] = None
    probability_no_churn: Optional[float] = None
    probability_churn: Optional[float] = None
    error: Optional[str] = None


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "n_features": len(FEATURE_COLUMNS),
    }


@app.get("/api/schema")
def schema():
    return {
        "required_fields": REQUIRED_FIELDS,
        "categorical_fields": CATEGORICAL_FIELDS,
        "numeric_fields": ["tenure", "MonthlyCharges", "TotalCharges"],
        "binary_fields": ["SeniorCitizen"],
    }


@app.post("/api/predict", response_model=PredictionOutput)
def predict(customer: CustomerInput):
    try:
        return predict_churn(customer.model_dump())
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:  # pragma: no cover - safety net
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.post("/api/predict/batch", response_model=List[BatchResultItem])
def predict_batch(customers: List[CustomerInput]):
    results = []
    for i, customer in enumerate(customers):
        try:
            results.append({"index": i, **predict_churn(customer.model_dump())})
        except ValidationError as e:
            results.append({"index": i, "error": str(e)})
    return results
