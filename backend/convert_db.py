import pandas as pd
import json
from datetime import datetime
import numpy as np

def clean_currency(x):
    """Clean currency values and convert to float"""
    if pd.isna(x):
        return 0.0
    if isinstance(x, (int, float)):
        return float(x)
    try:
        # Remove currency symbols and commas, then convert to float
        return float(str(x).replace('$', '').replace(',', '').strip())
    except:
        return 0.0

def clean_date(x):
    """Convert various date formats to ISO format"""
    if pd.isna(x):
        return None
    try:
        if isinstance(x, str):
            # Try different date formats
            for fmt in ['%Y-%m-%d %H:%M:%S%z', '%m/%d/%y', '%Y-%m-%d']:
                try:
                    return datetime.strptime(x.split('+')[0].strip(), fmt).isoformat()
                except:
                    continue
        return x.isoformat()
    except:
        return None

def convert_umd_db():
    """Convert UMD Cyber Events Database to JSON"""
    print("Converting UMD database...")
    df = pd.read_csv('UMD_Cyber Events Database.csv')
    
    incidents = []
    for _, row in df.iterrows():
        incident = {
            "date": clean_date(row['event_date']),
            "actor": {
                "name": row['actor'],
                "type": row['actor_type']
            },
            "organization": {
                "name": row['organization'],
                "industry": row['industry'],
                "naics_code": row['NAICS_Code']
            },
            "incident": {
                "type": row['event_type'],
                "subtype": row['event_subtype'],
                "description": row['description']
            },
            "location": {
                "country": row['country']
            }
        }
        incidents.append(incident)
    
    with open('data/umd_incidents.json', 'w') as f:
        json.dump({"incidents": incidents}, f, indent=2)
    print(f"Converted {len(incidents)} UMD incidents to JSON")

def convert_provided_db():
    """Convert Provided DB to JSON"""
    print("Converting Provided database...")
    df = pd.read_csv('Provided DB Trimmed.csv')
    
    incidents = []
    for _, row in df.iterrows():
        incident = {
            "case_info": {
                "id": row['MSCAD_ID'],
                "creation_date": clean_date(row['CREATION_DATE']),
                "last_modified": clean_date(row['LAST_MODIFIED_DATE']),
                "status": row['CASESTATUS'],
                "category": row['CASE_CATEGORY'],
                "type": row['CASE_TYPE']
            },
            "organization": {
                "name": row['COMPANY_NAME'],
                "industry": row['NAICS_DESC'],
                "naics_code": row['NAICS_CODE'],
                "revenue": clean_currency(row['ULT_REV']),
                "revenue_group": row['Revenue Group']
            },
            "location": {
                "street": row['STREET_ADDR_LINE_1'],
                "city": row['CITY'],
                "state": row['STATE'],
                "zip": row['ZIP'],
                "country": row['COUNTRY_CODE']
            },
            "incident": {
                "description": row['CASE_DESCRIPTION'],
                "start_date": clean_date(row['LOSS_START_DATE']),
                "end_date": clean_date(row['LOSS_END_DATE']),
                "actor_name": row['ACTOR_NAME'],
                "actor_type": row['ACTOR_TYPE'],
                "attack_vector": row['ATTACK_VECTOR'],
                "proximate_cause": row['PROXIMATE_CAUSE'],
                "secondary_cause": row['SECONDARY_CAUSE']
            },
            "impact": {
                "total_amount": clean_currency(row['TOTAL_AMOUNT']),
                "affected_count": row['AFFECTED_COUNT'],
                "affected_type": row['AFFECTED_COUNT_TYPE'],
                "compromised_data_type": row['COMPROMISED_DATA_TYPE']
            }
        }
        incidents.append(incident)
    
    with open('data/provided_incidents.json', 'w') as f:
        json.dump({"incidents": incidents}, f, indent=2)
    print(f"Converted {len(incidents)} provided incidents to JSON")

def main():
    """Main function to convert both databases"""
    # Create data directory if it doesn't exist
    import os
    os.makedirs('data', exist_ok=True)
    
    # Convert both databases
    convert_umd_db()
    convert_provided_db()

if __name__ == "__main__":
    main() 