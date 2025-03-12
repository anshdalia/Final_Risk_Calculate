import json
from typing import List, Dict, Any
from app.risk_state import RiskState
from app.historical_analyzer import HistoricalAnalyzer
import logging

logger = logging.getLogger(__name__)

class RiskProcessor:
    def __init__(self, umd_db_path: str, gpt4_mini_client: Any):
        """Initialize the risk processor with necessary components"""
        self.state = RiskState()
        self.historical_analyzer = HistoricalAnalyzer(umd_db_path)
        self.gpt4_mini = gpt4_mini_client
    
    def process_initial_input(self, revenue: float, employees: int, 
                            industry: str, location: str, 
                            additional_factors: List[str] = None) -> Dict:
        """Step 1: Process initial input and get initial GPT estimates"""
        # Store user inputs
        self.state.set_user_inputs(revenue, employees, industry, 
                                 location, additional_factors)
        
        # Generate prompt for GPT-4-mini to get initial estimates
        prompt = f"""As a cybersecurity risk analyst, estimate ALL initial risk metrics for:
        Industry: {industry}
        Location: {location}
        Company Size: {employees} employees
        Revenue: ${revenue:,.2f}
        Additional Factors: {', '.join(additional_factors or [])}
        
        Provide comprehensive initial risk estimates for ALL metrics, considering the company profile.
        Include 6 specific questions about their security measures that would help refine these estimates.
        
        Format response as JSON with:
        {{
            "risk_metrics": {{
                "primary_loss_event_frequency": {{
                    "threat_event_frequency": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "vulnerability": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }},
                "secondary_loss_event_frequency": {{
                    "SLEF": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }},
                "primary_loss_magnitude": {{
                    "productivity": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "response": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "replacement": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "competitive_advantage": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "fines_and_judgements": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "reputation": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }},
                "secondary_loss_magnitude": {{
                    "productivity": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "response": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "replacement": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "competitive_advantage": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "fines_and_judgements": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "reputation": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }}
            }},
            "explanation": "Detailed explanation of your estimates, including industry factors and size considerations",
            "scenarios": [
                {{ "description": str, "severity_level": "HIGH", "potential_impact": str }},
                {{ "description": str, "severity_level": "MEDIUM", "potential_impact": str }},
                {{ "description": str, "severity_level": "LOW", "potential_impact": str }}
            ],
            "questions": [
                "Question about security controls?",
                "Question about incident history?",
                "Question about data protection?",
                "Question about response plans?",
                "Question about training?",
                "Question about technical measures?"
            ]
        }}"""
        
        try:
            # Get GPT-4-mini analysis
            response = self.gpt4_mini.generate(prompt)
            analysis = json.loads(response)
            
            # Log initial estimates
            logger.info("=== Initial GPT Risk Estimates ===")
            logger.info(f"Company Profile: {industry} company, {employees} employees")
            logger.info(f"Risk Factors: {', '.join(additional_factors or [])}")
            logger.info("\nInitial Risk Metrics:")
            logger.info(json.dumps(analysis['risk_metrics'], indent=2))
            logger.info(f"\nExplanation: {analysis['explanation']}")
            logger.info("\nDynamic Questions:")
            for i, q in enumerate(analysis['questions'], 1):
                logger.info(f"{i}. {q}")
            logger.info("=====================================")
            
            # Update state
            self.state.set_selected_scenario(
                analysis['scenarios'],
                analysis['scenarios'][0]['description'],
                analysis['scenarios'][0]['severity_level'],
                analysis['scenarios'][0]['potential_impact']
            )
            
            # Store ALL initial metrics
            self.state.update_risk_metrics(**analysis['risk_metrics'])
            
            # Store questions
            self.state.set_dynamic_questions(analysis['questions'])
            
            return self.state.get_current_state()
            
        except Exception as e:
            logger.error(f"Error getting initial estimates: {str(e)}")
            raise
    
    def _calculate_initial_tef(self, industry: str, employees: int, additional_factors: List[str] = None) -> Dict:
        """Calculate initial threat event frequency based on inputs"""
        # Base TEF by industry
        industry_base_tef = {
            "Technology": 0.4,
            "Healthcare": 0.5,
            "Finance": 0.6,
            "Retail": 0.3,
            "Manufacturing": 0.2
        }.get(industry, 0.3)  # Default to 0.3 for unknown industries
        
        # Adjust for company size
        size_factor = 1 + (employees / 1000)  # Increases with company size
        
        # Adjust for risk factors
        risk_factor = 1.0
        if additional_factors:
            if "Remote workforce" in additional_factors:
                risk_factor *= 1.2
            if "Cloud infrastructure" in additional_factors:
                risk_factor *= 1.1
            if "Customer PII data" in additional_factors:
                risk_factor *= 1.3
        
        # Calculate final TEF
        likely_tef = min(industry_base_tef * size_factor * risk_factor, 0.9)
        
        return {
            "min": max(0.1, likely_tef * 0.7),
            "likely": likely_tef,
            "max": min(1.0, likely_tef * 1.3),
            "confidence": 0.8
        }
    
    def _calculate_initial_vulnerability(self, additional_factors: List[str] = None) -> Dict:
        """Calculate initial vulnerability based on risk factors"""
        base_vuln = 0.3  # Base vulnerability
        
        # Adjust for risk factors
        if additional_factors:
            if "Remote workforce" in additional_factors:
                base_vuln += 0.1
            if "Cloud infrastructure" in additional_factors:
                base_vuln += 0.05
            if "Customer PII data" in additional_factors:
                base_vuln += 0.15
        
        likely_vuln = min(base_vuln, 0.9)
        
        return {
            "min": max(0.1, likely_vuln * 0.7),
            "likely": likely_vuln,
            "max": min(1.0, likely_vuln * 1.3),
            "confidence": 0.7
        }
    
    def process_dynamic_questions(self, answers: Dict[str, str]) -> Dict:
        """Step 2: Process answers and adjust risk metrics"""
        # Store answers
        for question, answer in answers.items():
            self.state.add_question_answer(question, answer)
        
        # Get current metrics for comparison
        current_metrics = self.state.get_current_state()['risk_metrics']
        
        # Generate prompt for GPT-4-mini
        prompt = f"""As a cybersecurity risk analyst, review these security measures and adjust ALL risk metrics:
        
        Current Risk Metrics:
        {json.dumps(current_metrics, indent=2)}
        
        Security Measures Implemented:
        {json.dumps(answers, indent=2)}
        
        Based on these security measures, adjust ALL risk metrics.
        Explain specifically how each measure affects the metrics.
        
        Format response as JSON with:
        {{
            "risk_metrics": {{
                "primary_loss_event_frequency": {{
                    "threat_event_frequency": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "vulnerability": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }},
                "secondary_loss_event_frequency": {{
                    "SLEF": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }},
                "primary_loss_magnitude": {{
                    "productivity": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "response": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "replacement": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "competitive_advantage": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "fines_and_judgements": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "reputation": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }},
                "secondary_loss_magnitude": {{
                    "productivity": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "response": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "replacement": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "competitive_advantage": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "fines_and_judgements": {{ "min": float, "likely": float, "max": float, "confidence": float }},
                    "reputation": {{ "min": float, "likely": float, "max": float, "confidence": float }}
                }}
            }},
            "adjustments": [
                {{ "measure": str, "metric": str, "impact": str, "effect": str }}
            ]
        }}"""
        
        # Get GPT-4-mini analysis
        response = self.gpt4_mini.generate(prompt)
        analysis = json.loads(response)
        
        # Log the changes
        logger.info("=== Risk Metric Adjustments Based on Security Measures ===")
        new_metrics = analysis['risk_metrics']
        
        # Log PLEF changes
        logger.info("\nPrimary Loss Event Frequency Changes:")
        for metric_type in ['threat_event_frequency', 'vulnerability']:
            for value_type in ['min', 'likely', 'max']:
                old_val = current_metrics['primary_loss_event_frequency'][metric_type][value_type]
                new_val = new_metrics['primary_loss_event_frequency'][metric_type][value_type]
                change = new_val - old_val
                direction = "increased" if change > 0 else "decreased" if change < 0 else "unchanged"
                logger.info(f"{metric_type} {value_type}: {old_val:.3f} -> {new_val:.3f} ({direction} by {abs(change):.3f})")
        
        # Log SLEF changes
        logger.info("\nSecondary Loss Event Frequency Changes:")
        for value_type in ['min', 'likely', 'max']:
            old_val = current_metrics['secondary_loss_event_frequency']['SLEF'][value_type]
            new_val = new_metrics['secondary_loss_event_frequency']['SLEF'][value_type]
            change = new_val - old_val
            direction = "increased" if change > 0 else "decreased" if change < 0 else "unchanged"
            logger.info(f"SLEF {value_type}: {old_val:.3f} -> {new_val:.3f} ({direction} by {abs(change):.3f})")
        
        # Log Loss Magnitude changes
        for magnitude_type in ['primary_loss_magnitude', 'secondary_loss_magnitude']:
            logger.info(f"\n{magnitude_type.replace('_', ' ').title()} Changes:")
            for category in ['productivity', 'response', 'replacement', 'competitive_advantage', 'fines_and_judgements', 'reputation']:
                for value_type in ['min', 'likely', 'max']:
                    old_val = current_metrics[magnitude_type][category][value_type]
                    new_val = new_metrics[magnitude_type][category][value_type]
                    change = new_val - old_val
                    direction = "increased" if change > 0 else "decreased" if change < 0 else "unchanged"
                    logger.info(f"{category} {value_type}: ${old_val:,.2f} -> ${new_val:,.2f} ({direction} by ${abs(change):,.2f})")
        
        logger.info("\nAdjustment Explanations:")
        for adj in analysis['adjustments']:
            logger.info(f"- {adj['measure']} -> {adj['metric']}: {adj['impact']} ({adj['effect']})")
        logger.info("=====================================")
        
        # Update ALL metrics
        self.state.update_risk_metrics(**new_metrics)
        
        return self.state.get_current_state()
    
    def process_industry_reports(self) -> Dict:
        """Step 3: Compare against industry standards and adjust metrics"""
        # Get current state after security measures
        current_state = self.state.get_current_state()
        
        # Generate prompt for GPT-4-mini
        prompt = f"""As a cybersecurity risk analyst, analyze this company's risk profile against industry standards:

Company Profile:
Industry: {self.state.user_inputs['industry']}
Location: {self.state.user_inputs['location']}
Size: {self.state.user_inputs['employees']} employees
Revenue: ${self.state.user_inputs['revenue']:,.2f}

Current Risk Metrics (after security measures assessment):
{json.dumps(current_state['risk_metrics'], indent=2)}

Compare these metrics against:
1. FBI Internet Crime Report (IC3) {self.state.user_inputs['industry']} statistics
2. Verizon Data Breach Investigations Report (DBIR) findings for {self.state.user_inputs['industry']}
3. IBM Cost of a Data Breach Report metrics for {self.state.user_inputs['industry']}

Consider and adjust values based on:
- Average breach costs for this industry and company size (adjust breach_cost.amount accordingly)
- Typical attack patterns and frequencies (adjust attack_vectors percentages based on DBIR data)
- Industry-specific vulnerability statistics (adjust risk_metrics based on industry averages)
- Regional factors for {self.state.user_inputs['location']} (include in regional_cyber_crimes)
- Company size impact on likelihood and magnitude (scale metrics appropriately)
- Top cyber crimes and their impact in {self.state.user_inputs['location']} (reflect in regional_cyber_crimes)

Important: Ensure all numerical values in the response reflect actual industry statistics and regional data.
If a specific industry or region shows higher/lower metrics, adjust the values accordingly.

Provide detailed analysis including:
1. Industry-specific insights with current statistics (use real industry averages)
2. Regional cyber crime trends and statistics (based on actual regional data)
3. Risk metric adjustments based on industry standards (scale according to industry benchmarks)

Format response as JSON with:
{{
    "risk_metrics": {{
        "primary_loss_event_frequency": {{
            "threat_event_frequency": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "vulnerability": {{ "min": float, "likely": float, "max": float, "confidence": float }}
        }},
        "secondary_loss_event_frequency": {{
            "SLEF": {{ "min": float, "likely": float, "max": float, "confidence": float }}
        }},
        "primary_loss_magnitude": {{
            "productivity": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "response": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "replacement": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "competitive_advantage": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "fines_and_judgements": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "reputation": {{ "min": float, "likely": float, "max": float, "confidence": float }}
        }},
        "secondary_loss_magnitude": {{
            "productivity": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "response": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "replacement": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "competitive_advantage": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "fines_and_judgements": {{ "min": float, "likely": float, "max": float, "confidence": float }},
            "reputation": {{ "min": float, "likely": float, "max": float, "confidence": float }}
        }}
    }},
    "industry_insights": {{
        "breach_cost": {{
            "amount": float,
            "year": int,
            "source": str
        }},
        "attack_vectors": [
            {{
                "type": str,
                "percentage": float,
                "source": str
            }}
        ],
        "response_times": {{
            "time_to_identify": int,
            "time_to_contain": int,
            "source": str
        }}
    }},
    "regional_cyber_crimes": [
        {{
            "crime_type": str,
            "statistics": str,
            "year": int
        }}
    ]
}}"""

        try:
            # Get GPT-4-mini analysis
            response = self.gpt4_mini.generate(prompt)
            analysis = json.loads(response)
            
            # Log the changes
            logger.info("\n=== Industry Analysis Phase Changes ===")
            current_metrics = current_state['risk_metrics']
            new_metrics = analysis['risk_metrics']
            
            # Calculate and log percentage changes for key metrics
            def calculate_percentage_change(old_val, new_val):
                return ((new_val - old_val) / old_val) * 100 if old_val != 0 else 0

            # Log PLEF changes
            logger.info("\nPrimary Loss Event Frequency Changes:")
            for metric_type in ['threat_event_frequency', 'vulnerability']:
                old_val = current_metrics['primary_loss_event_frequency'][metric_type]['likely']
                new_val = new_metrics['primary_loss_event_frequency'][metric_type]['likely']
                pct_change = calculate_percentage_change(old_val, new_val)
                logger.info(f"{metric_type}: {old_val:.3f} -> {new_val:.3f} ({pct_change:+.1f}% change)")

            # Log SLEF changes
            logger.info("\nSecondary Loss Event Frequency Changes:")
            old_val = current_metrics['secondary_loss_event_frequency']['SLEF']['likely']
            new_val = new_metrics['secondary_loss_event_frequency']['SLEF']['likely']
            pct_change = calculate_percentage_change(old_val, new_val)
            logger.info(f"SLEF: {old_val:.3f} -> {new_val:.3f} ({pct_change:+.1f}% change)")

            # Log Loss Magnitude changes
            for magnitude_type in ['primary_loss_magnitude', 'secondary_loss_magnitude']:
                logger.info(f"\n{magnitude_type.replace('_', ' ').title()} Changes:")
                for category in ['productivity', 'response', 'replacement', 'competitive_advantage', 'fines_and_judgements', 'reputation']:
                    old_val = current_metrics[magnitude_type][category]['likely']
                    new_val = new_metrics[magnitude_type][category]['likely']
                    pct_change = calculate_percentage_change(old_val, new_val)
                    logger.info(f"{category}: ${old_val:,.2f} -> ${new_val:,.2f} ({pct_change:+.1f}% change)")

            # Log industry insights and regional cyber crimes
            logger.info("\nIndustry Insights:")
            logger.info(f"Breach Cost: ${analysis['industry_insights']['breach_cost']['amount']:,.2f} ({analysis['industry_insights']['breach_cost']['year']})")
            logger.info("\nAttack Vectors:")
            for vector in analysis['industry_insights']['attack_vectors']:
                logger.info(f"- {vector['type']}: {vector['percentage']}%")
            logger.info(f"\nResponse Times:")
            logger.info(f"Time to Identify: {analysis['industry_insights']['response_times']['time_to_identify']} days")
            logger.info(f"Time to Contain: {analysis['industry_insights']['response_times']['time_to_contain']} days")

            logger.info("\nRegional Cyber Crimes:")
            for crime in analysis['regional_cyber_crimes']:
                logger.info(f"- {crime['crime_type']}: {crime['statistics']} ({crime['year']})")

            logger.info("\n=====================================")
            
            # Update state with new metrics and analysis
            self.state.update_risk_metrics(**new_metrics)
            self.state.update_industry_analysis({
                'insights': analysis['industry_insights'],
                'regional_cyber_crimes': analysis['regional_cyber_crimes']
            })
            
            return self.state.get_current_state()
            
        except Exception as e:
            logger.error(f"Error processing industry standards: {str(e)}")
            raise
    
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