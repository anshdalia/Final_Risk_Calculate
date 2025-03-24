import json
from typing import List, Dict, Any
from app.risk_state import RiskState
import logging

logger = logging.getLogger(__name__)

class RiskProcessor:
    def __init__(self, umd_db_path: str, gpt4_mini_client: Any):
        """Initialize the risk processor with necessary components"""
        self.state = RiskState()
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
            
            # Return the current state
            return self.state.get_current_state()
        
        except Exception as e:
            logger.error(f"Error generating initial analysis: {str(e)}")
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
    
    def process_industry_analysis(self) -> Dict:
        """Process industry analysis and adjust risk metrics based on industry reports."""
        try:
            # Get current metrics
            current_metrics = self.state.risk_metrics
            
            # Get industry-specific insights from GPT
            industry_prompt = f"""
            Analyze the following organization's risk profile and provide industry-specific insights:
            Industry: {self.state.user_inputs['industry']}
            Location: {self.state.user_inputs['location']}
            Employee Count: {self.state.user_inputs['employees']}
            
            Current Risk Metrics:
            {json.dumps(current_metrics, indent=2)}
            
            Please provide:
            1. Industry-specific breach costs and sources
            2. Primary attack vectors and their distribution
            3. Mean time to identify and contain breaches
            4. Regional cyber crime patterns
            
            Use data from:
            - IBM Cost of a Data Breach Report (DBIR)
            - FBI Internet Crime Reports
            - Industry-specific cybersecurity reports
            
            Format response as JSON with:
            {{
                "insights": {{
                    "breach_cost": {{
                        "amount": float,
                        "year": int,
                        "source": "string"
                    }},
                    "attack_vectors": [
                        {{ "type": "string", "percentage": float, "source": "string" }}
                    ],
                    "response_times": {{
                        "time_to_identify": int,
                        "time_to_contain": int,
                        "source": "string"
                    }}
                }},
                "regional_cyber_crimes": [
                    {{ "crime_type": "string", "statistics": "string", "year": int }}
                ],
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
                }}
            }}
            """
            
            # Get GPT analysis
            response = self.gpt4_mini.generate(industry_prompt)
            analysis = json.loads(response)
            
            # Extract insights and new metrics
            insights = {
                'insights': analysis['insights'],
                'regional_cyber_crimes': analysis['regional_cyber_crimes']
            }
            
            # Apply new metrics directly
            self._apply_metric_adjustments(current_metrics, analysis['risk_metrics'])
            
            # Update risk state with insights
            self.state.industry_analysis = insights
            
            # Log the changes
            logger.info("=== Industry Analysis Risk Metric Updates ===")
            self._log_metric_changes(current_metrics, analysis['risk_metrics'])
            logger.info("=====================================")
            
            return self.state.get_current_state()
            
        except Exception as e:
            logger.error(f"Error in industry analysis: {str(e)}")
            raise

    def _parse_industry_insights(self, gpt_response: str) -> Dict:
        """Parse GPT response to extract industry insights."""
        try:
            # Extract structured data from GPT response
            insights = {
                'insights': {
                    'breach_cost': {
                        'amount': 0,
                        'year': 2024,
                        'source': ''
                    },
                    'attack_vectors': [],
                    'response_times': {
                        'time_to_identify': 0,
                        'time_to_contain': 0,
                        'source': ''
                    }
                },
                'regional_cyber_crimes': []
            }
            
            # Parse GPT response to populate insights
            # This is a simplified example - you'll need to implement proper parsing
            # based on your GPT response format
            
            return insights
            
        except Exception as e:
            logger.error(f"Error parsing industry insights: {str(e)}")
            raise

    def _adjust_risk_metrics(self, insights: Dict):
        """Adjust all risk metrics based on industry insights."""
        try:
            # Get current metrics
            current_metrics = self.state.risk_metrics
            
            # Generate prompt for GPT to analyze and set appropriate values
            metrics_prompt = f"""
            Based on the following industry insights, analyze and provide appropriate risk metric values:

            Industry Insights:
            - Breach Cost: ${insights['insights']['breach_cost']['amount']} ({insights['insights']['breach_cost']['year']})
            - Attack Vectors: {', '.join([f"{v['type']} ({v['percentage']}%)" for v in insights['insights']['attack_vectors']])}
            - Response Times: {insights['insights']['response_times']['time_to_identify']} days to identify, {insights['insights']['response_times']['time_to_contain']} days to contain
            - Regional Crimes: {', '.join([f"{c['crime_type']} ({c['statistics']})" for c in insights['regional_cyber_crimes']])}

            Current Risk Metrics:
            {json.dumps(current_metrics, indent=2)}

            Please analyze these industry insights and provide appropriate values for each metric.
            Consider:
            1. Use industry breach costs to inform replacement costs
            2. Use response times to inform response costs
            3. Use attack vectors to inform vulnerability metrics
            4. Use regional crime patterns to inform threat event frequency

            IMPORTANT: All confidence values must be numeric percentages between 0 and 1 (e.g., 0.75 for 75% confidence).

            Format response as JSON with direct values for each metric:
            {{
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
            }}
            """
            
            # Get GPT analysis of new values
            response = self.gpt4_mini.generate(metrics_prompt)
            new_metrics = json.loads(response)
            
            # Apply new values directly
            self._apply_metric_adjustments(current_metrics, new_metrics)
            
            # Log the changes
            logger.info("=== Industry Analysis Risk Metric Updates ===")
            self._log_metric_changes(current_metrics, new_metrics)
            logger.info("=====================================")
            
        except Exception as e:
            logger.error(f"Error adjusting risk metrics: {str(e)}")
            raise

    def _apply_metric_adjustments(self, current_metrics: Dict, new_metrics: Dict):
        """Update metrics with new values directly."""
        try:
            # Update primary loss event frequency
            for metric_type in ['threat_event_frequency', 'vulnerability']:
                current_metrics['primary_loss_event_frequency'][metric_type] = new_metrics['primary_loss_event_frequency'][metric_type]
            
            # Update secondary loss event frequency
            current_metrics['secondary_loss_event_frequency']['SLEF'] = new_metrics['secondary_loss_event_frequency']['SLEF']
            
            # Update primary loss magnitude
            for category in ['productivity', 'response', 'replacement', 'competitive_advantage', 
                           'fines_and_judgements', 'reputation']:
                current_metrics['primary_loss_magnitude'][category] = new_metrics['primary_loss_magnitude'][category]
            
            # Update secondary loss magnitude
            for category in ['productivity', 'response', 'replacement', 'competitive_advantage', 
                           'fines_and_judgements', 'reputation']:
                current_metrics['secondary_loss_magnitude'][category] = new_metrics['secondary_loss_magnitude'][category]
            
        except Exception as e:
            logger.error(f"Error updating metrics: {str(e)}")
            raise

    def _log_metric_changes(self, current_metrics: Dict, new_metrics: Dict):
        """Log all metric changes for transparency."""
        try:
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
                for category in ['productivity', 'response', 'replacement', 'competitive_advantage', 
                               'fines_and_judgements', 'reputation']:
                    for value_type in ['min', 'likely', 'max']:
                        old_val = current_metrics[magnitude_type][category][value_type]
                        new_val = new_metrics[magnitude_type][category][value_type]
                        change = new_val - old_val
                        direction = "increased" if change > 0 else "decreased" if change < 0 else "unchanged"
                        logger.info(f"{category} {value_type}: ${old_val:,.2f} -> ${new_val:,.2f} ({direction} by ${abs(change):,.2f})")
            
        except Exception as e:
            logger.error(f"Error logging metric changes: {str(e)}")
            raise 