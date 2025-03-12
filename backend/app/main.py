from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
import os
import json
import math
from dotenv import load_dotenv
from app.risk_processor import RiskProcessor
from app.gpt4_mini_client import GPT4MiniClient
import openai
from .historical_analyzer import HistoricalAnalyzer

# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv('GPT_API_KEY')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Custom JSON encoder to handle NaN values
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
            return 0.0  # Replace NaN/Inf with 0.0
        return super().default(obj)

# Configure CORS with specific origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],  # Add your frontend URLs
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

class RiskScenario(BaseModel):
    description: str
    severity_level: str
    potential_impact: str

class RemediationRequest(BaseModel):
    industry: str
    location: str
    employees: int
    revenue: float
    risk_factors: Optional[List[str]] = None
    risk_scenario: RiskScenario

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
        
        # Convert result to JSON-safe values
        def clean_nan_values(data):
            if isinstance(data, dict):
                return {k: clean_nan_values(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [clean_nan_values(x) for x in data]
            elif isinstance(data, float) and (math.isnan(data) or math.isinf(data)):
                return 0.0
            return data
        
        cleaned_result = clean_nan_values(result)
        logger.info(f"Cleaned result: {cleaned_result}")
        return cleaned_result
        
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

@app.post("/api/get_remediation_strategies")
async def get_remediation_strategies(request: RemediationRequest):
    try:
        logging.info(f"Received request: {request}")
        
        # Construct the prompt for GPT-4-mini
        prompt = f"""Given an organization with the following profile:
        Industry: {request.industry}
        Location: {request.location}
        Number of Employees: {request.employees}
        Annual Revenue: ${request.revenue}M
        Key Risk Factors: {', '.join(request.risk_factors)}
        
        For the following high-risk scenario:
        Description: {request.risk_scenario.description}
        Severity: {request.risk_scenario.severity_level}
        Potential Impact: {request.risk_scenario.potential_impact}
        
        Please provide 3 specific and actionable remediation strategies. Each strategy should include:
        1. A clear description of the action to be taken
        2. The expected impact on risk reduction
        3. Implementation considerations
        
        Format the response as a JSON object with an array of 3 strategies, each containing a title, description, impact, and implementation details."""

        # Use GPT-4-mini client
        response = gpt4_mini.generate(prompt)
        strategies = json.loads(response)
        logging.info(f"Generated strategies: {strategies}")
        
        return strategies
        
    except Exception as e:
        logging.error(f"Error generating remediation strategies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test_remediation")
async def test_remediation():
    """Test endpoint with example data"""
    try:
        example_request = RemediationRequest(
            industry="Retail",
            location="United States",
            employees=500,
            revenue=10000000.0,
            risk_factors=["E-commerce platform", "Customer data storage"],
            risk_scenario=RiskScenario(
                description="Potential data breach through e-commerce platform",
                severity_level="High",
                potential_impact="Loss of customer data and financial information"
            )
        )
        
        logger.info("Testing remediation strategies with example data")
        return await get_remediation_strategies(example_request)
        
    except Exception as e:
        logger.error(f"Error in test endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 