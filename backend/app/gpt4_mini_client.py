import requests
import logging
import json
import os
from typing import Dict, Any

logger = logging.getLogger(__name__)

class GPT4MiniClient:
    def __init__(self):
        """Initialize the GPT-4-mini client with API credentials"""
        self.api_url = os.getenv('GPT_API_URL', 'https://api.openai.com/v1/chat/completions')
        self.api_key = os.getenv('GPT_API_KEY')
        
        if not self.api_key:
            raise ValueError("GPT_API_KEY environment variable is not set")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate(self, prompt: str) -> str:
        """Generate response from GPT-4o-mini"""
        logger.info("Generating response from GPT-4o-mini")
        logger.debug(f"Prompt: {prompt}")
        
        try:
            payload = {
                "model": "gpt-4o",  # Using GPT-4o-mini model
                "messages": [
                    {"role": "system", "content": "You are a cybersecurity risk analyst expert following ISO 27001 and FAIR methodology. You provide responses in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2000
            }
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload
            )
            
            if response.status_code != 200:
                error_msg = f"API request failed with status {response.status_code}: {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
            
            response_data = response.json()
            if not response_data.get('choices') or not response_data['choices'][0].get('message'):
                raise Exception("Invalid response format from API")
            
            content = response_data['choices'][0]['message']['content']
            
            # Ensure the content is valid JSON
            try:
                # First, try to parse it as JSON directly
                json_response = json.loads(content)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from the text response
                try:
                    # Look for content between triple backticks if present
                    if '```json' in content:
                        json_str = content.split('```json')[1].split('```')[0].strip()
                    elif '```' in content:
                        json_str = content.split('```')[1].split('```')[0].strip()
                    else:
                        json_str = content.strip()
                    json_response = json.loads(json_str)
                except Exception as e:
                    raise Exception(f"Failed to parse response as JSON: {str(e)}")
            
            return json.dumps(json_response)
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Request failed: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg) 