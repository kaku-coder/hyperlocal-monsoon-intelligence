from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.prediction import PredictionRequest, PredictionResponse, ExplainabilityResponse, NowcastRequest, NowcastResponse
from app.schemas.ml_tasks import HistoricalMLRequest, SystemHealthMLRequest
from app.services.predictor import predictor
from app.services.explainer import explainer
from app.services.nowcaster import nowcaster
from app.services.historical_ml import historical_analyzer
from app.services.system_health_ml import system_health_ml

app = FastAPI(
    title="Hyperlocal Monsoon ML Prediction Service",
    description="MoES / NCMRWF Block-Level Probabilistic Monsoon Onset, Break, and Heavy Rain Forecasting API + Historical XAI + System Health ML",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Hyperlocal Monsoon ML Service (FastAPI)",
        "organization": "MoES / NCMRWF Prototype",
        "models": {
            "onset_classifier": "Ensemble-Calibrated-Probabilistic-v1.2",
            "break_spell_regressor": "RandomForest-Climatic-Surrogate-v1.2",
            "heavy_rain_estimator": "Convective-Index-v1.2",
            "historical_ml": "historical-ml-v1.0 (Trend+Anomaly+Analog)",
            "xai_engine": "xai-v2.0-dynamic (Perturbation-SHAP + Counterfactual)",
            "system_health_ml": "system-health-ml-v1.0 (Latency-Anomaly + Drift + Failure-Forecast)"
        },
        "is_prototype": True
    }

@app.post("/predict", response_model=PredictionResponse)
def get_prediction(req: PredictionRequest):
    try:
        return predictor.predict(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain", response_model=ExplainabilityResponse)
def get_explanation(req: PredictionRequest):
    try:
        return explainer.explain(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain/advanced")
def get_advanced_explanation(req: PredictionRequest):
    """Dynamic XAI: perturbation SHAP + counterfactual + trilingual narrative."""
    try:
        return explainer.explain_advanced(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nowcast", response_model=NowcastResponse)
def get_nowcast(req: NowcastRequest):
    """
    Real-time 12-hour rainfall & heavy-rain nowcast.
    Ingest live Open-Meteo hourly data -> condition ML model -> alert decision with
    multilingual broadcast messages for farmer SMS dispatch.
    """
    try:
        return nowcaster.nowcast(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nowcast failed: {e}")

@app.post("/historical/analyze")
def historical_analyze(req: HistoricalMLRequest):
    """Historical Analysis ML: trend + anomaly + analog + climatology + outlook."""
    try:
        result = historical_analyzer.analyze(req.yearly_records, req.current)
        result["location"] = {"district": req.district_name, "block": req.block_name}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Historical ML failed: {e}")

@app.post("/system/health-ml")
def system_health_analyze(req: SystemHealthMLRequest):
    """System Health ML: latency anomaly + health score + drift + failure forecast."""
    try:
        subs = [s.model_dump() for s in req.subsystems]
        return system_health_ml.analyze(subs, req.recent_break_probabilities)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"System Health ML failed: {e}")

@app.get("/climate-indices/current")
def get_current_climate_indices():
    return {
        "enso": {
            "nino_34_anomaly": 0.8,
            "status": "Warm Anomaly (El Niño Watch)",
            "trend": "Slightly weakening over East Pacific",
            "impact_on_monsoon": "Tends to suppress convective activity and induce intra-seasonal dry breaks across eastern and central India."
        },
        "iod": {
            "dmi_value": -0.4,
            "status": "Negative IOD",
            "trend": "Persisting in eastern tropical Indian Ocean",
            "impact_on_monsoon": "Reduces moisture flux into the Bay of Bengal, prolonging dry intervals between active spells."
        },
        "mjo": {
            "phase": 4,
            "amplitude": 1.48,
            "status": "Active (Phase 4 - Maritime Continent / Bay of Bengal)",
            "trend": "Propagating eastward at ~4 m/s",
            "impact_on_monsoon": "Favorable for localized convective rainfall, providing short windows of showers despite macro subsidence."
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True)