from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
import os
from dotenv import load_dotenv
from app.risk_processor import RiskProcessor
from app.gpt4_mini_client import GPT4MiniClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the risk processor
try:
    gpt4_mini = GPT4MiniClient()
    risk_processor = RiskProcessor(
        umd_db_path="UMD_Cyber Events Database.csv",
        gpt4_mini_client=gpt4_mini
    )
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    raise

# Request/Response Models
class InitialInput(BaseModel):
    revenue: float
    employees: int
    industry: str
    location: str
    additional_factors: Optional[List[str]] = None

class QuestionAnswers(BaseModel):
    answers: Dict[str, str]

@app.post("/api/initial-input")
async def process_initial_input(input_data: InitialInput):
    """Step 1: Process initial input and generate scenarios"""
    logger.info("Processing initial input")
    try:
        result = risk_processor.process_initial_input(
            revenue=input_data.revenue,
            employees=input_data.employees,
            industry=input_data.industry,
            location=input_data.location,
            additional_factors=input_data.additional_factors
        )
        logger.info("Initial input processed successfully")
        return result
    except Exception as e:
        logger.error(f"Error processing initial input: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dynamic-questions")
async def process_questions(answers: QuestionAnswers):
    """Step 2: Process answers to dynamic questions"""
    logger.info("Processing dynamic questions")
    try:
        result = risk_processor.process_dynamic_questions(answers.answers)
        logger.info("Dynamic questions processed successfully")
        return result
    except Exception as e:
        logger.error(f"Error processing questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/industry-analysis")
async def process_industry_analysis():
    """Step 3: Process industry analysis"""
    logger.info("Processing industry analysis")
    try:
        result = risk_processor.process_industry_reports()
        logger.info("Industry analysis processed successfully")
        return result
    except Exception as e:
        logger.error(f"Error processing industry analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/historical-analysis")
async def process_historical_analysis():
    """Step 4: Process historical analysis"""
    logger.info("Processing historical analysis")
    try:
        result = risk_processor.process_historical_data()
        logger.info("Historical analysis processed successfully")
        return result
    except Exception as e:
        logger.error(f"Error processing historical analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/current-state")
async def get_current_state():
    """Get current state of the risk assessment"""
    logger.info("Retrieving current state")
    try:
        return risk_processor.state.get_current_state()
    except Exception as e:
        logger.error(f"Error retrieving current state: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 