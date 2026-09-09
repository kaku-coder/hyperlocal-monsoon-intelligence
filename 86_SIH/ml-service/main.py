from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.prediction import PredictionRequest, PredictionResponse, ExplainabilityResponse
from app.services.predictor import predictor
from app.services.explainer import explainer

app = FastAPI(
    title="Hyperlocal Monsoon ML Prediction Service",
    description="MoES / NCMRWF Block-Level Probabilistic Monsoon Onset, Break, and Heavy Rain Forecasting API",
    version="1.2.0"
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
            "heavy_rain_estimator": "Convective-Index-v1.2"
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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
