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
            'industry': 0.4,  # Increased from 0.3
            'description': 0.3,  # Decreased from 0.4
            'recency': 0.2,
            'size': 0.1
        }
        
        # Industry similarity - now more nuanced
        incident_industry = incident.get('organization', {}).get('industry', '').lower()
        target_industry = target_industry.lower()
        if incident_industry == target_industry:
            score += weights['industry']  # Exact match
        elif any(word in incident_industry for word in target_industry.split()):
            score += weights['industry'] * 0.7  # Partial match
        
        # Description similarity using TF-IDF with minimum threshold
        if incident.get('incident', {}).get('description'):
            try:
                tfidf_matrix = self.vectorizer.fit_transform([
                    target_scenario,
                    incident['incident']['description']
                ])
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                # Apply a minimum threshold of 0.1 for description similarity
                if similarity > 0.1:
                    score += weights['description'] * similarity
            except:
                pass
        
        # Recency score with more granular decay
        if incident.get('date'):
            try:
                incident_date = datetime.fromisoformat(incident['date'].split('T')[0])
                years_old = (datetime.now() - incident_date).days / 365
                # More granular decay: 
                # - Less than 2 years: full score
                # - 2-5 years: linear decay to 0.7
                # - 5-10 years: linear decay to 0.3
                # - Over 10 years: minimum 0.1
                if years_old <= 2:
                    recency_score = 1.0
                elif years_old <= 5:
                    recency_score = 1.0 - (0.3 * (years_old - 2) / 3)
                elif years_old <= 10:
                    recency_score = 0.7 - (0.4 * (years_old - 5) / 5)
                else:
                    recency_score = 0.1
                score += weights['recency'] * recency_score
            except:
                pass
        
        # Company size similarity
        # Assuming company_size is annual revenue in millions or employee count
        incident_size = incident.get('organization', {}).get('size', 0)
        if incident_size and company_size:
            try:
                # Calculate size difference ratio
                size_ratio = min(incident_size, company_size) / max(incident_size, company_size)
                # Apply sigmoid function to smooth the score
                size_score = 1 / (1 + np.exp(-10 * (size_ratio - 0.5)))
                score += weights['size'] * size_score
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

    def calculate_risk_adjustments(self, similar_incidents: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate risk metric adjustments based on historical incidents."""
        if not similar_incidents:
            return {
                'frequency_factor': 0.0,
                'magnitude_factor': 1.0,
                'confidence': 0.0
            }

        # Calculate frequency factor (normalized by total incidents)
        total_incidents = len(similar_incidents)
        frequency_factor = total_incidents / 100  # Normalize to baseline

        # Calculate magnitude factor from financial impacts
        financial_impacts = [inc.get('financial_impact', 0) for inc in similar_incidents if inc.get('financial_impact') is not None]
        magnitude_factor = float(np.mean(financial_impacts) / 1000000) if financial_impacts else 1.0

        # Calculate confidence based on similarity scores with minimum threshold
        similarity_scores = [inc.get('similarity_score', 0) for inc in similar_incidents]
        if similarity_scores:
            # Apply minimum threshold of 0.3 for confidence
            base_confidence = float(np.mean(similarity_scores))
            confidence = max(base_confidence, 0.3)  # Never go below 30% confidence
            
            # Boost confidence if we have multiple similar incidents
            if len(similar_incidents) >= 2:
                confidence = min(confidence * 1.2, 1.0)  # Boost by 20% but cap at 1.0
        else:
            confidence = 0.0

        adjustments = {
            'frequency_factor': float(frequency_factor),
            'magnitude_factor': float(magnitude_factor),
            'confidence': float(confidence)
        }

        # Handle any NaN values
        for key in adjustments:
            if np.isnan(adjustments[key]):
                adjustments[key] = 0.0

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