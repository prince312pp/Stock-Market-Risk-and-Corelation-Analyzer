import logging
import random
import numpy as np
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, RANDOM_SEED
from app.database import init_db
from app.routes import health, stocks, market_data, analysis

# Fixed random seed for deterministic mathematical reproducibility
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("stock_market_analyzer")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Stock Market Risk & Correlation Analyzer Backend...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning("Database init failed on startup (will retry on requests): %s", e)
    yield
    logger.info("Shutting down backend...")


app = FastAPI(
    title="Stock Market Risk & Correlation Analyzer API",
    description="Academic API for fetching historical NSE stock data, calculating return/risk statistics, and analyzing portfolio correlation.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(stocks.router, prefix="/api", tags=["Stocks"])
app.include_router(market_data.router, prefix="/api", tags=["Market Data"])
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])


@app.get("/")
def root():
    return {
        "app": "Stock Market Risk & Correlation Analyzer",
        "version": "1.0.0",
        "docs": "/docs",
        "api_status": "/api/health",
    }
