"""
MARQUE — Event Turnout Forecasting ML Microservice
===================================================
Endpoints:
  GET  /health          → liveness check
  POST /train           → train / retrain the Random Forest model
  POST /predict         → predict attendance count for an event
"""

import os
import pickle
import logging
from datetime import datetime
import threading
import time

from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
MONGODB_URI = os.getenv("MONGODB_URI")
PORT = int(os.getenv("PORT", 5002))
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
MIN_TRAINING_SAMPLES = 3

# ─── MongoDB ──────────────────────────────────────────────────────────────────
client = MongoClient(MONGODB_URI)
# Extract DB name from URI (last path segment before query string)
_db_name = MONGODB_URI.split("/")[-1].split("?")[0] if MONGODB_URI else None
db = client[_db_name] if _db_name else None

# ─── Encoding map ─────────────────────────────────────────────────────────────
ORG_TYPE_MAP = {
    "Unit Organization": 0,
    "Mother Organization": 1,
    "FAESO Organization": 2,
}

FEATURE_COLS = [
    "is_mandatory",
    "day_of_week",
    "month",
    "duration_hours",
    "org_type_encoded",
    "audience_size",
    "org_avg_present_count",
    "org_event_count",
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return None


def save_model(model):
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)


def get_audience_size(org: dict, dept: dict) -> tuple[int, str]:
    """
    Apply scoping rules to determine the eligible student population.

    Rules (in priority order):
      1. Dept name == 'University Student Government'  OR  org_type == 'FAESO Organization'
         → ALL students
      2. Dept name contains 'student council' (case-insensitive)
         → Students in same college as the department
      3. org_type == 'Unit Organization'
         → Students in same department as the org
      4. Fallback
         → Students in same college as the org's department
    """
    dept_name = (dept.get("department_name") or "") if dept else ""
    org_type  = org.get("org_type") or ""
    dept_id   = org.get("department_id")
    college_id = dept.get("college_id") if dept else None

    is_usg   = "university student government" in dept_name.lower()
    is_faeso = org_type == "FAESO Organization"

    if is_usg or is_faeso:
        count = db.students.count_documents({})
        return count, "All Students (University-wide)"

    if "student council" in dept_name.lower() and college_id:
        count = db.students.count_documents({"college_id": college_id})
        return count, "College Students"

    if org_type == "Unit Organization" and dept_id:
        count = db.students.count_documents({"department_id": dept_id})
        return count, "Department Students"

    # Fallback: college-level
    if college_id:
        count = db.students.count_documents({"college_id": college_id})
        return count, "College Students"

    count = db.students.count_documents({})
    return count, "All Students"


def get_org_history(org_id, exclude_event_id=None) -> tuple[float, int]:
    """Return (avg_present_count, num_past_events) for an org."""
    query = {"organization_id": org_id, "status": "Concluded"}
    if exclude_event_id:
        query["_id"] = {"$ne": exclude_event_id}

    past_events = list(db.events.find(query, {"_id": 1}))
    if not past_events:
        return 0.0, 0

    counts = []
    for ev in past_events:
        n = db.attendance_logs.count_documents(
            {"event_id": ev["_id"], "status": "Present"}
        )
        counts.append(n)

    return float(np.mean(counts)), len(past_events)


def build_feature_row(event: dict, org: dict, dept: dict,
                      audience_size: int, org_avg_present: float,
                      org_event_count: int) -> dict:
    event_date  = event.get("event_date")
    start_time  = event.get("start_time")
    end_time    = event.get("end_time")

    day_of_week = event_date.weekday() if event_date else 0  # Mon=0 … Sun=6
    month       = event_date.month if event_date else 1

    duration_hours = 0.0
    if start_time and end_time:
        duration_hours = (end_time - start_time).total_seconds() / 3600

    is_mandatory    = 1 if event.get("is_mandatory") else 0
    org_type_enc    = ORG_TYPE_MAP.get(org.get("org_type", ""), 1)

    return {
        "is_mandatory":         is_mandatory,
        "day_of_week":          day_of_week,
        "month":                month,
        "duration_hours":       round(duration_hours, 2),
        "org_type_encoded":     org_type_enc,
        "audience_size":        audience_size,
        "org_avg_present_count": round(org_avg_present, 2),
        "org_event_count":      org_event_count,
    }


def _run_training() -> dict:
    """Core training logic. Returns a result dict."""
    concluded = list(db.events.find({"status": "Concluded"}))

    if len(concluded) < MIN_TRAINING_SAMPLES:
        return {
            "success": False,
            "message": (
                f"Insufficient training data. Need ≥ {MIN_TRAINING_SAMPLES} "
                f"concluded events, found {len(concluded)}."
            ),
            "sample_count": len(concluded),
        }

    rows = []
    for event in concluded:
        try:
            org_id = event.get("organization_id")
            if not org_id:
                continue

            org = db.organizations.find_one({"_id": org_id})
            if not org:
                continue

            dept_id = org.get("department_id")
            dept    = db.departments.find_one({"_id": dept_id}) if dept_id else None

            audience_size, _scope = get_audience_size(org, dept)
            org_avg_present, org_event_count = get_org_history(org_id, event["_id"])

            features = build_feature_row(
                event, org, dept,
                audience_size, org_avg_present, org_event_count
            )

            actual_count = db.attendance_logs.count_documents(
                {"event_id": event["_id"], "status": "Present"}
            )
            features["actual_count"] = actual_count
            rows.append(features)

        except Exception as exc:
            logger.warning(f"Skipping event {event.get('_id')}: {exc}")

    if len(rows) < MIN_TRAINING_SAMPLES:
        return {
            "success": False,
            "message": f"Only {len(rows)} valid samples after processing (need ≥ {MIN_TRAINING_SAMPLES}).",
            "sample_count": len(rows),
        }

    df = pd.DataFrame(rows)
    X  = df[FEATURE_COLS]
    y  = df["actual_count"]

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        min_samples_leaf=1,
    )
    model.fit(X, y)

    y_pred = model.predict(X)
    mae    = mean_absolute_error(y, y_pred)
    rmse   = float(np.sqrt(mean_squared_error(y, y_pred)))
    r2     = r2_score(y, y_pred)

    cv_mae_mean = cv_mae_std = None
    if len(rows) >= 5:
        cv_folds = min(5, len(rows))
        cv_scores = cross_val_score(
            model, X, y, cv=cv_folds, scoring="neg_mean_absolute_error"
        )
        cv_mae_mean = round(float(-cv_scores.mean()), 2)
        cv_mae_std  = round(float(cv_scores.std()), 2)

    importances = dict(zip(FEATURE_COLS, model.feature_importances_.tolist()))
    save_model(model)
    logger.info(f"Model trained on {len(rows)} samples. MAE={mae:.2f}, R²={r2:.4f}")

    return {
        "success": True,
        "sample_count": len(rows),
        "metrics": {
            "mae":          round(mae, 2),
            "rmse":         round(rmse, 2),
            "r2":           round(r2, 4),
            "cv_mae_mean":  cv_mae_mean,
            "cv_mae_std":   cv_mae_std,
        },
        "feature_importances": importances,
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    model = load_model()
    return jsonify({
        "status":       "ok",
        "model_loaded": model is not None,
        "db_connected": db is not None,
    })


@app.route("/train", methods=["POST"])
def train():
    try:
        result = _run_training()
        status_code = 200 if result["success"] else 422
        return jsonify(result), status_code
    except Exception as exc:
        logger.error(f"Training error: {exc}")
        return jsonify({"success": False, "message": str(exc)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    try:
        model = load_model()
        if model is None:
            return jsonify({
                "success": False,
                "message": "Model not trained yet. Call POST /train first.",
                "predicted_count": None,
            }), 503

        data = request.get_json(force=True) or {}

        features = pd.DataFrame([[
            int(data.get("is_mandatory", 0)),
            int(data.get("day_of_week", 0)),
            int(data.get("month", 1)),
            float(data.get("duration_hours", 2.0)),
            int(data.get("org_type_encoded", 1)),
            int(data.get("audience_size", 0)),
            float(data.get("org_avg_present_count", 0.0)),
            int(data.get("org_event_count", 0)),
        ]], columns=FEATURE_COLS)

        raw_pred       = model.predict(features)[0]
        predicted_count = max(0, round(float(raw_pred)))

        audience_size = int(data.get("audience_size", 0))
        rate = (predicted_count / audience_size * 100) if audience_size > 0 else 0.0

        # Confidence based on how much historical data the model has for this org
        org_event_count = int(data.get("org_event_count", 0))
        if   org_event_count >= 10:  confidence = "High"
        elif org_event_count >= 5:   confidence = "Medium"
        elif org_event_count >= 2:   confidence = "Low"
        else:                        confidence = "Very Low"

        return jsonify({
            "success":               True,
            "predicted_count":       predicted_count,
            "predicted_rate_percent": round(rate, 1),
            "confidence":            confidence,
        })

    except Exception as exc:
        logger.error(f"Prediction error: {exc}")
        return jsonify({"success": False, "message": str(exc)}), 500


# ─── Startup ──────────────────────────────────────────────────────────────────

def start_auto_retrainer(interval_seconds=300):
    def retrain_loop():
        # First train immediately on startup so we always have the latest data
        logger.info("Background retrainer: Performing initial train...")
        try:
            res = _run_training()
            if res["success"]:
                logger.info(f"Background retrainer: Initial train succeeded ({res['sample_count']} samples).")
            else:
                logger.warning(f"Background retrainer: Initial train skipped ({res['message']}).")
        except Exception as e:
            logger.error(f"Background retrainer error: {e}")

        # Then run periodic loop
        while True:
            time.sleep(interval_seconds)
            logger.info("Background retrainer: Training model...")
            try:
                res = _run_training()
                if res["success"]:
                    logger.info(f"Background retrainer: Training succeeded ({res['sample_count']} samples).")
                else:
                    logger.warning(f"Background retrainer: Training skipped ({res['message']}).")
            except Exception as e:
                logger.error(f"Background retrainer error: {e}")

    thread = threading.Thread(target=retrain_loop, daemon=True)
    thread.start()


if __name__ == "__main__":
    logger.info("Starting background auto-retrainer (interval: 5 mins)...")
    start_auto_retrainer(300)

    app.run(host="0.0.0.0", port=PORT, debug=False)
