import json
from typing import List, Dict, Any
from app.risk_state import RiskState
from app.historical_analyzer import HistoricalAnalyzer

class RiskProcessor:
    def __init__(self, umd_db_path: str, gpt4_mini_client: Any):
        """Initialize the risk processor with necessary components"""
        self.state = RiskState()
        self.historical_analyzer = HistoricalAnalyzer(umd_db_path)
        self.gpt4_mini = gpt4_mini_client
    
    def process_initial_input(self, revenue: float, employees: int, 
                            industry: str, location: str, 
                            additional_factors: List[str] = None) -> Dict:
        """Step 1: Process initial input and generate scenarios"""
        # Store user inputs
        self.state.set_user_inputs(revenue, employees, industry, 
                                 location, additional_factors)
        
        # Generate prompt for GPT-4-mini
        prompt = f"""As a cybersecurity risk analyst following ISO 27001 and FAIR methodology, analyze:
        Industry: {industry}
        Location: {location}
        Company Size: {employees} employees
        Revenue: ${revenue:,.2f}
        Additional Factors: {', '.join(additional_factors or [])}
        
        Provide a JSON response with the following structure:
        {{
            "scenarios": [
                {{ "description": "Scenario 1 description" }},
                {{ "description": "Scenario 2 description" }},
                {{ "description": "Scenario 3 description" }}
            ],
            "selected_scenario": {{
                "description": "Description of highest risk scenario",
                "risk_level": "HIGH/MEDIUM/LOW",
                "potential_impact": "Description of potential impact"
            }},
            "risk_metrics": {{
                "primary_loss_event_frequency": {{
                    "threat_event_frequency": {{ "min": 0.1, "likely": 0.3, "max": 0.5, "confidence": 0.8 }},
                    "vulnerability": {{ "min": 0.2, "likely": 0.4, "max": 0.6, "confidence": 0.7 }}
                }},
                "secondary_loss_event_frequency": {{
                    "SLEF": {{ "min": 0.1, "likely": 0.2, "max": 0.4, "confidence": 0.7 }}
                }},
                "primary_loss_magnitude": {{
                    "productivity": {{ "min": 50000, "likely": 100000, "max": 200000, "confidence": 0.8 }},
                    "response": {{ "min": 25000, "likely": 50000, "max": 100000, "confidence": 0.7 }},
                    "replacement": {{ "min": 10000, "likely": 25000, "max": 50000, "confidence": 0.9 }},
                    "competitive_advantage": {{ "min": 5000, "likely": 15000, "max": 30000, "confidence": 0.6 }},
                    "fines_and_judgements": {{ "min": 100000, "likely": 250000, "max": 500000, "confidence": 0.8 }},
                    "reputation": {{ "min": 200000, "likely": 400000, "max": 800000, "confidence": 0.7 }}
                }},
                "secondary_loss_magnitude": {{
                    "productivity": {{ "min": 25000, "likely": 50000, "max": 100000, "confidence": 0.7 }},
                    "response": {{ "min": 10000, "likely": 25000, "max": 50000, "confidence": 0.8 }},
                    "replacement": {{ "min": 5000, "likely": 15000, "max": 30000, "confidence": 0.7 }},
                    "competitive_advantage": {{ "min": 2500, "likely": 7500, "max": 15000, "confidence": 0.6 }},
                    "fines_and_judgements": {{ "min": 50000, "likely": 125000, "max": 250000, "confidence": 0.7 }},
                    "reputation": {{ "min": 100000, "likely": 200000, "max": 400000, "confidence": 0.6 }}
                }}
            }},
            "questions": [
                "Question 1?",
                "Question 2?",
                "Question 3?",
                "Question 4?",
                "Question 5?",
                "Question 6?"
            ]
        }}"""
        
        try:
            # Get GPT-4-mini analysis
            response = self.gpt4_mini.generate(prompt)
            analysis = json.loads(response)
            
            # Update state with GPT-4-mini analysis
            self.state.set_selected_scenario(
                analysis['scenarios'],
                analysis['selected_scenario']['description'],
                analysis['selected_scenario']['risk_level'],
                analysis['selected_scenario']['potential_impact']
            )
            
            # Extract risk metrics from the response
            risk_metrics = analysis.get('risk_metrics', {})
            
            # Update risk metrics with proper structure
            self.state.update_risk_metrics(
                primary_loss_event_frequency=risk_metrics.get('primary_loss_event_frequency', {
                    'threat_event_frequency': {'min': 0.1, 'likely': 0.3, 'max': 0.5, 'confidence': 0.8},
                    'vulnerability': {'min': 0.2, 'likely': 0.4, 'max': 0.6, 'confidence': 0.7}
                }),
                secondary_loss_event_frequency=risk_metrics.get('secondary_loss_event_frequency', {
                    'SLEF': {'min': 0.1, 'likely': 0.2, 'max': 0.4, 'confidence': 0.7}
                }),
                primary_loss_magnitude=risk_metrics.get('primary_loss_magnitude', {
                    'productivity': {'min': 50000, 'likely': 100000, 'max': 200000, 'confidence': 0.8},
                    'response': {'min': 25000, 'likely': 50000, 'max': 100000, 'confidence': 0.7},
                    'replacement': {'min': 10000, 'likely': 25000, 'max': 50000, 'confidence': 0.9},
                    'competitive_advantage': {'min': 5000, 'likely': 15000, 'max': 30000, 'confidence': 0.6},
                    'fines_and_judgements': {'min': 100000, 'likely': 250000, 'max': 500000, 'confidence': 0.8},
                    'reputation': {'min': 200000, 'likely': 400000, 'max': 800000, 'confidence': 0.7}
                }),
                secondary_loss_magnitude=risk_metrics.get('secondary_loss_magnitude', {
                    'productivity': {'min': 25000, 'likely': 50000, 'max': 100000, 'confidence': 0.7},
                    'response': {'min': 10000, 'likely': 25000, 'max': 50000, 'confidence': 0.8},
                    'replacement': {'min': 5000, 'likely': 15000, 'max': 30000, 'confidence': 0.7},
                    'competitive_advantage': {'min': 2500, 'likely': 7500, 'max': 15000, 'confidence': 0.6},
                    'fines_and_judgements': {'min': 50000, 'likely': 125000, 'max': 250000, 'confidence': 0.7},
                    'reputation': {'min': 100000, 'likely': 200000, 'max': 400000, 'confidence': 0.6}
                })
            )
            
            self.state.set_dynamic_questions(analysis.get('questions', [
                "What security controls are currently in place?",
                "Has the organization experienced similar incidents in the past?",
                "What is the current backup strategy?",
                "Are there incident response plans in place?",
                "What is the level of security awareness training?",
                "How often are systems patched?"
            ]))
            
            return self.state.get_current_state()
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse GPT-4-mini response: {str(e)}")
        except KeyError as e:
            raise Exception(f"Missing required field in GPT-4-mini response: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing initial input: {str(e)}")
    
    def process_dynamic_questions(self, answers: Dict[str, str]) -> Dict:
        """Step 2: Process answers to dynamic questions"""
        # Store answers
        for question, answer in answers.items():
            self.state.add_question_answer(question, answer)
        
        # Generate prompt for GPT-4-mini to analyze answers
        prompt = f"""As a cybersecurity risk analyst, analyze these answers:
        
        All Potential Scenarios:
        1. {self.state.scenarios[0]['description']}
        2. {self.state.scenarios[1]['description']}
        3. {self.state.scenarios[2]['description']}
        
        Selected High-Risk Scenario for Analysis:
        {self.state.selected_scenario['description']}
        Risk Level: {self.state.selected_scenario['risk_level']}
        Potential Impact: {self.state.selected_scenario['potential_impact']}
        
        Current Risk Metrics: {json.dumps(self.state.get_current_state()['risk_metrics'])}
        
        Questions and Answers:
        {json.dumps(answers, indent=2)}
        
        Based on these answers, adjust the PLEF, SLEF, PLEM, SLEM values.
        Explain your adjustments.
        Format response as JSON with keys: risk_metrics, explanation"""
        
        # Get GPT-4-mini analysis
        response = self.gpt4_mini.generate(prompt)
        analysis = json.loads(response)
        
        # Update risk metrics
        self.state.update_risk_metrics(**analysis['risk_metrics'])
        
        return self.state.get_current_state()
    
    def process_industry_reports(self) -> Dict:
        """Step 3: Analyze industry reports and trends"""
        # Get historical analysis
        risk_factors = self.historical_analyzer.calculate_risk_factors(
            self.state.user_inputs['industry'],
            None,  # NAICS code could be added later
            self.state.user_inputs['employees']
        )
        
        # Generate prompt for GPT-4-mini
        prompt = f"""As a cybersecurity risk analyst, analyze this industry data:
        Current Risk Metrics: {json.dumps(self.state.get_current_state()['risk_metrics'])}
        Historical Analysis: {json.dumps(risk_factors, indent=2)}
        
        Based on this industry data, adjust the PLEF, SLEF, PLEM, SLEM values.
        Explain your adjustments.
        Format response as JSON with keys: risk_metrics, explanation"""
        
        # Get GPT-4-mini analysis
        response = self.gpt4_mini.generate(prompt)
        analysis = json.loads(response)
        
        # Update state
        self.state.update_risk_metrics(**analysis['risk_metrics'])
        self.state.update_industry_analysis(risk_factors)
        
        return self.state.get_current_state()
    
    def process_historical_data(self) -> Dict:
        """Step 4: Analyze historical data and generate remediation"""
        # Get similar historical incidents
        similar_incidents = self.historical_analyzer.get_similar_incidents(
            self.state.selected_scenario['description'],
            self.state.user_inputs['industry']
        )
        
        # Generate prompt for GPT-4-mini
        prompt = f"""As a cybersecurity risk analyst, analyze:
        Current Risk Metrics: {json.dumps(self.state.get_current_state()['risk_metrics'])}
        Similar Historical Incidents: {json.dumps(similar_incidents, indent=2)}
        
        Based on this data:
        1. Adjust the PLEF, SLEF, PLEM, SLEM values
        2. Generate 3 specific remediation suggestions
        3. Summarize historical trends
        
        Format response as JSON with keys: risk_metrics, remediations, trends"""
        
        # Get GPT-4-mini analysis
        response = self.gpt4_mini.generate(prompt)
        analysis = json.loads(response)
        
        # Update state
        self.state.update_risk_metrics(**analysis['risk_metrics'])
        self.state.set_remediation_suggestions(analysis['remediations'])
        self.state.update_historical_analysis({
            'similar_incidents': similar_incidents,
            'trends': analysis['trends']
        })
        
        return self.state.get_current_state() 