import logging
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RiskState:
    def __init__(self):
        # Initialize detailed risk metrics
        self.risk_metrics = {
            "primary_loss_event_frequency": {
                "threat_event_frequency": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "vulnerability": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0}
            },
            "secondary_loss_event_frequency": {
                "SLEF": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0}
            },
            "primary_loss_magnitude": {
                "productivity": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "response": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "replacement": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "competitive_advantage": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "fines_and_judgements": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "reputation": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0}
            },
            "secondary_loss_magnitude": {
                "productivity": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "response": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "replacement": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "competitive_advantage": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "fines_and_judgements": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0},
                "reputation": {"min": 0.0, "likely": 0.0, "max": 0.0, "confidence": 0.0}
            }
        }
        
        # User inputs
        self.user_inputs = {
            "revenue": 0,
            "employees": 0,
            "industry": "",
            "location": "",
            "additional_factors": []
        }
        
        # All scenarios
        self.scenarios = []
        
        # Selected risk scenario
        self.selected_scenario = {
            "description": "",
            "severity_level": "",
            "potential_impact": ""
        }
        
        # Dynamic questions and answers
        self.dynamic_questions = []
        self.question_answers = {}
        
        # Analysis results
        self.industry_analysis = {}
        self.remediation_suggestions = []
    
    def update_risk_metrics(self, primary_loss_event_frequency: Dict = None,
                         secondary_loss_event_frequency: Dict = None,
                         primary_loss_magnitude: Dict = None,
                         secondary_loss_magnitude: Dict = None):
        """Update risk metrics with new values"""
        logger.info("Updating risk metrics")
        logger.debug(f"Previous metrics: {self.risk_metrics}")
        
        if primary_loss_event_frequency:
            self.risk_metrics["primary_loss_event_frequency"] = primary_loss_event_frequency
            
        if secondary_loss_event_frequency:
            self.risk_metrics["secondary_loss_event_frequency"] = secondary_loss_event_frequency
            
        if primary_loss_magnitude:
            self.risk_metrics["primary_loss_magnitude"] = primary_loss_magnitude
            
        if secondary_loss_magnitude:
            self.risk_metrics["secondary_loss_magnitude"] = secondary_loss_magnitude
        
        logger.debug(f"Updated metrics: {self.risk_metrics}")
        logger.info("Risk metrics update completed")
    
    def set_user_inputs(self, revenue: float, employees: int, industry: str, 
                       location: str, additional_factors: List[str] = None):
        """Set initial user inputs"""
        logger.info("Setting user inputs")
        self.user_inputs["revenue"] = revenue
        self.user_inputs["employees"] = employees
        self.user_inputs["industry"] = industry
        self.user_inputs["location"] = location
        if additional_factors:
            self.user_inputs["additional_factors"] = additional_factors
        logger.debug(f"User inputs set: {self.user_inputs}")
    
    def set_selected_scenario(self, scenarios: List[Dict], selected_description: str, severity_level: str, potential_impact: str):
        """Set the selected risk scenario and store all scenarios"""
        logger.info("Setting selected scenario and storing all scenarios")
        
        # Store all scenarios
        self.scenarios = scenarios
        
        # Set the selected scenario
        self.selected_scenario = {
            "description": selected_description,
            "severity_level": severity_level,
            "potential_impact": potential_impact
        }
        logger.info(f"Selected scenario set: {self.selected_scenario}")
    
    def set_dynamic_questions(self, questions: List[str]):
        """Set dynamically generated questions"""
        logger.info("Setting dynamic questions")
        self.dynamic_questions = questions
        logger.debug(f"Questions set: {questions}")
    
    def add_question_answer(self, question: str, answer: str):
        """Add an answer to a dynamic question"""
        logger.info(f"Adding answer for question: {question}")
        self.question_answers[question] = answer
        logger.debug(f"Current Q&A state: {self.question_answers}")
    
    def update_industry_analysis(self, analysis_data: Dict):
        """Update industry analysis results"""
        logger.info("Updating industry analysis")
        self.industry_analysis = analysis_data
        logger.debug(f"Industry analysis updated: {analysis_data}")
    
    def set_remediation_suggestions(self, suggestions: List[str]):
        """Set remediation suggestions"""
        logger.info("Setting remediation suggestions")
        self.remediation_suggestions = suggestions
        logger.debug(f"Remediation suggestions set: {suggestions}")
    
    def get_current_state(self) -> Dict:
        """Get complete current state"""
        return {
            "risk_metrics": self.risk_metrics,
            "user_inputs": self.user_inputs,
            "scenarios": self.scenarios,
            "selected_scenario": self.selected_scenario,
            "dynamic_questions": self.dynamic_questions,
            "question_answers": self.question_answers,
            "industry_analysis": self.industry_analysis,
            "remediation_suggestions": self.remediation_suggestions
        } 