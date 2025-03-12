import pandas as pd
from datetime import datetime
import numpy as np

class HistoricalAnalyzer:
    def __init__(self, umd_db_path):
        """Initialize with path to UMD Cyber Events database"""
        self.df = pd.read_csv(umd_db_path)
        self.df['event_date'] = pd.to_datetime(self.df['event_date'])
    
    def analyze_industry_risks(self, target_industry, target_naics, lookback_years=10):
        """Analyze historical risks for specific industry"""
        current_date = datetime.now()
        cutoff_date = current_date.replace(year=current_date.year - lookback_years)
        
        # Filter relevant records
        industry_data = self.df[
            ((self.df['industry'] == target_industry) | 
             (self.df['NAICS_Code'] == target_naics)) &
            (self.df['event_date'] >= cutoff_date)
        ]
        
        analysis = {
            'total_incidents': len(industry_data),
            'actor_distribution': industry_data['actor_type'].value_counts().to_dict(),
            'event_types': industry_data['event_type'].value_counts().to_dict(),
            'recent_incidents': industry_data.sort_values('event_date', ascending=False).head(5)[
                ['event_date', 'event_type', 'event_subtype/description']
            ].to_dict('records'),
            'geographical_distribution': industry_data['country'].value_counts().to_dict()
        }
        
        return analysis
    
    def calculate_risk_factors(self, target_industry, target_naics, company_size):
        """Calculate risk factors based on historical data"""
        industry_analysis = self.analyze_industry_risks(target_industry, target_naics)
        
        # Calculate base frequency factors
        total_incidents = industry_analysis['total_incidents']
        incident_frequency = total_incidents / 10  # per year over last 10 years
        
        # Size-based adjustment factor (simplified)
        if company_size < 50:
            size_factor = 0.7
        elif company_size < 250:
            size_factor = 1.0
        else:
            size_factor = 1.3
            
        # Calculate risk metrics
        plef_factor = incident_frequency * size_factor / 10  # Normalize to 0-1 scale
        slef_factor = plef_factor * 0.7  # Secondary events typically less frequent
        plem_factor = size_factor  # Larger companies face larger potential losses
        slem_factor = plem_factor * 0.8  # Secondary losses typically slightly lower
        
        return {
            'plef_factor': min(plef_factor, 1.0),
            'slef_factor': min(slef_factor, 1.0),
            'plem_factor': min(plem_factor, 1.0),
            'slem_factor': min(slem_factor, 1.0),
            'supporting_data': industry_analysis
        }
    
    def get_similar_incidents(self, scenario_description, target_industry, limit=3):
        """Find similar historical incidents based on description and industry"""
        industry_data = self.df[self.df['industry'] == target_industry]
        
        # Simple keyword matching (could be enhanced with NLP)
        relevant_incidents = []
        keywords = scenario_description.lower().split()
        
        for _, row in industry_data.iterrows():
            description = str(row['event_subtype/description']).lower()
            if any(keyword in description for keyword in keywords):
                relevant_incidents.append({
                    'date': row['event_date'],
                    'description': row['event_subtype/description'],
                    'actor_type': row['actor_type'],
                    'event_type': row['event_type']
                })
                if len(relevant_incidents) >= limit:
                    break
        
        return relevant_incidents 