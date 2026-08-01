// Mirrors backend/model_utils.py CATEGORICAL_FIELDS + numeric fields.
// Grouped into sections purely for a friendlier form layout.

export const initialCustomer = {
  gender: "Female",
  SeniorCitizen: "0",
  Partner: "No",
  Dependents: "No",
  tenure: "12",
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: "70.35",
  TotalCharges: "845.5",
};

export const formSections = [
  {
    title: "Account",
    eyebrow: "01",
    fields: [
      { name: "gender", label: "Gender", type: "select", options: ["Female", "Male"] },
      {
        name: "SeniorCitizen",
        label: "Senior citizen",
        type: "select",
        options: [
          { value: "0", label: "No" },
          { value: "1", label: "Yes" },
        ],
      },
      { name: "Partner", label: "Has partner", type: "select", options: ["Yes", "No"] },
      { name: "Dependents", label: "Has dependents", type: "select", options: ["Yes", "No"] },
      { name: "tenure", label: "Tenure (months)", type: "number", min: 0, max: 100, step: 1 },
    ],
  },
  {
    title: "Services",
    eyebrow: "02",
    fields: [
      { name: "PhoneService", label: "Phone service", type: "select", options: ["Yes", "No"] },
      {
        name: "MultipleLines",
        label: "Multiple lines",
        type: "select",
        options: ["No", "Yes", "No phone service"],
      },
      {
        name: "InternetService",
        label: "Internet service",
        type: "select",
        options: ["DSL", "Fiber optic", "No"],
      },
      {
        name: "OnlineSecurity",
        label: "Online security",
        type: "select",
        options: ["No", "Yes", "No internet service"],
      },
      {
        name: "OnlineBackup",
        label: "Online backup",
        type: "select",
        options: ["No", "Yes", "No internet service"],
      },
      {
        name: "DeviceProtection",
        label: "Device protection",
        type: "select",
        options: ["No", "Yes", "No internet service"],
      },
      {
        name: "TechSupport",
        label: "Tech support",
        type: "select",
        options: ["No", "Yes", "No internet service"],
      },
      {
        name: "StreamingTV",
        label: "Streaming TV",
        type: "select",
        options: ["No", "Yes", "No internet service"],
      },
      {
        name: "StreamingMovies",
        label: "Streaming movies",
        type: "select",
        options: ["No", "Yes", "No internet service"],
      },
    ],
  },
  {
    title: "Billing",
    eyebrow: "03",
    fields: [
      {
        name: "Contract",
        label: "Contract",
        type: "select",
        options: ["Month-to-month", "One year", "Two year"],
      },
      { name: "PaperlessBilling", label: "Paperless billing", type: "select", options: ["Yes", "No"] },
      {
        name: "PaymentMethod",
        label: "Payment method",
        type: "select",
        options: [
          "Electronic check",
          "Mailed check",
          "Bank transfer (automatic)",
          "Credit card (automatic)",
        ],
      },
      { name: "MonthlyCharges", label: "Monthly charges ($)", type: "number", min: 0, step: 0.05 },
      { name: "TotalCharges", label: "Total charges ($)", type: "number", min: 0, step: 0.05 },
    ],
  },
];
