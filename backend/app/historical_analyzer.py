import json
from datetime import datetime
import logging
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
import pandas as pd

logger = logging.getLogger(__name__)

class HistoricalAnalyzer:
    def __init__(self, umd_path: str = 'UMD_Cyber Events Database.csv', 
                 provided_path: str = 'Provided DB Trimmed.csv'):
        """Initialize with paths to CSV databases"""
        logger.info("Initializing HistoricalAnalyzer")
        try:
            # Load UMD database
            logger.info(f"Attempting to load UMD database from {umd_path}")
            if not os.path.exists(umd_path):
                raise FileNotFoundError(f"UMD database file not found at {umd_path}")
            
            # Read CSV file
            umd_df = pd.read_csv(umd_path)
            self.umd_data = {
                'incidents': []
            }
            
            # Convert DataFrame to our expected format
            for _, row in umd_df.iterrows():
                incident = {
                    'date': row['event_date'],
                    'organization': {
                        'name': row['organization'],
                        'industry': row['industry']
                    },
                    'incident': {
                        'type': row['event_type'],
                        'subtype': row['event_subtype'],
                        'description': row['description']
                    }
                }
                self.umd_data['incidents'].append(incident)
            
            logger.info(f"Loaded UMD database with {len(self.umd_data['incidents'])} incidents")
            
            # Load Provided database
            logger.info(f"Attempting to load Provided database from {provided_path}")
            if not os.path.exists(provided_path):
                raise FileNotFoundError(f"Provided database file not found at {provided_path}")
            
            # Read CSV file
            provided_df = pd.read_csv(provided_path)
            self.provided_data = {
                'incidents': []
            }
            
            # Convert DataFrame to our expected format
            for _, row in provided_df.iterrows():
                incident = {
                    'incident': {
                        'start_date': row['FIRST_NOTICE_DATE'],
                        'attack_vector': row['ATTACK_VECTOR'],
                        'description': row['CASE_DESCRIPTION']
                    },
                    'organization': {
                        'industry': row['NAICS_DESC']
                    },
                    'impact': {
                        'total_amount': row['TOTAL_AMOUNT'],
                        'affected_count': row['AFFECTED_COUNT']
                    }
                }
                self.provided_data['incidents'].append(incident)
            
            logger.info(f"Loaded Provided database with {len(self.provided_data['incidents'])} incidents")
            
            # Initialize TF-IDF vectorizer for description matching
            self.vectorizer = TfidfVectorizer(stop_words='english')
            
        except Exception as e:
            logger.error(f"Error loading databases: {str(e)}")
            logger.error(f"Current working directory: {os.getcwd()}")
            raise

    def _calculate_similarity_score(self, incident: Dict, target_industry: str, 
                                 target_scenario: str, company_size: int) -> float:
        """Calculate similarity score between incident and target criteria"""
        score = 0.0
        weights = {
            'industry': 0.3,
            'description': 0.4,
            'recency': 0.2,
            'size': 0.1
        }
        
        # Industry similarity
        if incident.get('organization', {}).get('industry', '').lower() == target_industry.lower():
            score += weights['industry']
        
        # Description similarity using TF-IDF
        if incident.get('incident', {}).get('description'):
            try:
                tfidf_matrix = self.vectorizer.fit_transform([
                    target_scenario,
                    incident['incident']['description']
                ])
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                score += weights['description'] * similarity
            except:
                pass
        
        # Recency score
        if incident.get('date'):
            try:
                incident_date = datetime.fromisoformat(incident['date'].split('T')[0])
                years_old = (datetime.now() - incident_date).days / 365
                recency_score = max(0, 1 - (years_old / 10))  # Linear decay over 10 years
                score += weights['recency'] * recency_score
            except:
                pass
        
        return score

    def find_similar_incidents(self, target_industry: str, target_scenario: str,
                             company_size: int, limit: int = 3) -> List[Dict]:
        """Find similar historical incidents based on multiple criteria"""
        logger.info(f"Finding similar incidents for {target_industry}")
        
        all_incidents = []
        
        # Process UMD incidents
        for incident in self.umd_data['incidents']:
            similarity = self._calculate_similarity_score(
                incident, target_industry, target_scenario, company_size
            )
            if similarity > 0:
                all_incidents.append({
                    'similarity': similarity,
                    'source': 'umd',
                    'incident': incident
                })
        
        # Process Provided incidents
        for incident in self.provided_data['incidents']:
            similarity = self._calculate_similarity_score(
                incident, target_industry, target_scenario, company_size
            )
            if similarity > 0:
                all_incidents.append({
                    'similarity': similarity,
                    'source': 'provided',
                    'incident': incident
                })
        
        # Sort by similarity score and get top matches
        all_incidents.sort(key=lambda x: x['similarity'], reverse=True)
        top_matches = all_incidents[:limit]
        
        # Format results
        results = []
        for match in top_matches:
            incident = match['incident']
            if match['source'] == 'provided':
                result = {
                    'date': incident['incident']['start_date'],
                    'industry': incident['organization']['industry'],
                    'event_type': incident['incident']['attack_vector'],
                    'description': incident['incident']['description'],
                    'financial_impact': incident['impact']['total_amount'],
                    'affected_count': incident['impact']['affected_count'],
                    'similarity_score': match['similarity']
                }
            else:  # UMD incident
                result = {
                    'date': incident['date'],
                    'industry': incident['organization']['industry'],
                    'event_type': incident['incident']['type'],
                    'description': incident['incident']['description'],
                    'financial_impact': None,  # UMD doesn't have financial data
                    'affected_count': None,
                    'similarity_score': match['similarity']
                }
            results.append(result)
        
        logger.info(f"Found {len(results)} similar incidents")
        return results

    def calculate_risk_adjustments(self, similar_incidents: List[Dict]) -> Dict:
        """Calculate risk metric adjustments based on similar incidents"""
        logger.info("Calculating risk adjustments from historical data")
        
        # Initialize adjustment factors
        adjustments = {
            'frequency_factor': 1.0,
            'magnitude_factor': 1.0,
            'confidence': 0.0
        }
        
        # Only use incidents with financial impact
        incidents_with_impact = [
            inc for inc in similar_incidents 
            if inc['financial_impact'] is not None
        ]
        
        if incidents_with_impact:
            # Calculate average financial impact
            impacts = [inc['financial_impact'] for inc in incidents_with_impact]
            avg_impact = sum(impacts) / len(impacts)
            
            # Calculate magnitude factor based on historical impacts
            adjustments['magnitude_factor'] = avg_impact / 1000000  # Normalize to millions
            
            # Calculate frequency factor based on similarity scores
            similarity_scores = [inc['similarity_score'] for inc in similar_incidents]
            adjustments['frequency_factor'] = sum(similarity_scores) / len(similarity_scores)
            
            # Calculate confidence based on number and similarity of matches
            adjustments['confidence'] = min(
                0.9,  # Cap at 90% confidence
                (len(incidents_with_impact) / 3) * (sum(similarity_scores) / len(similarity_scores))
            )
        
        logger.info(f"Calculated adjustments: {adjustments}")
        return adjustments

    def get_historical_analysis(self, target_industry: str, target_scenario: str,
                              company_size: int) -> Dict:
        """Get complete historical analysis including similar incidents and risk adjustments"""
        logger.info(f"Performing historical analysis for {target_industry}")
        
        # Find similar incidents
        similar_incidents = self.find_similar_incidents(
            target_industry, target_scenario, company_size
        )
        
        # Calculate risk adjustments
        risk_adjustments = self.calculate_risk_adjustments(similar_incidents)
        
        # Calculate average financial impact safely
        financial_impacts = [
            inc['financial_impact'] 
            for inc in similar_incidents 
            if inc['financial_impact'] is not None
        ]
        avg_financial_impact = 0  # Default to 0 if no valid impacts
        if financial_impacts:
            avg = np.mean(financial_impacts)
            avg_financial_impact = float(avg) if not np.isnan(avg) else 0
        
        # Compile analysis results
        analysis = {
            'similar_incidents': similar_incidents,
            'risk_adjustments': risk_adjustments,
            'summary': {
                'total_matches': len(similar_incidents),
                'avg_financial_impact': avg_financial_impact,
                'most_common_type': max(
                    (inc['event_type'] for inc in similar_incidents),
                    key=lambda x: sum(1 for i in similar_incidents if i['event_type'] == x)
                ) if similar_incidents else None
            }
        }
        
        logger.info("Historical analysis completed")
        return analysis 