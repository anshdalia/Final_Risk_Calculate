import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64

class Calculator:
    def __init__(self, tef_min, tef_likely, tef_max, 
                 vuln_min, vuln_likely, vuln_max,
                 plm_min, plm_likely, plm_max,
                 slef_min, slef_likely, slef_max,
                 slm_min, slm_likely, slm_max):
        self.tef = (tef_min, tef_likely, tef_max)
        self.vuln = (vuln_min, vuln_likely, vuln_max)
        self.plm = (plm_min, plm_likely, plm_max)
        self.slef = (slef_min, slef_likely, slef_max)
        self.slm = (slm_min, slm_likely, slm_max)
        
    def pert(self, low, likely, high, confidence=4.0):
        # Handle edge cases
        if high <= low or abs(high - low) < 1e-10:
            return likely
            
        mean = (low + confidence * likely + high) / (confidence + 2)
        variance = ((high - low) ** 2) / 36
        
        # Handle edge cases to prevent division by zero
        if abs(likely - mean) < 1e-10:
            likely += 1e-10
        
        try:
            alpha = ((mean - low) * (2 * likely - low - high)) / ((high - low) * (likely - mean))
            if alpha <= 0:  # Invalid alpha value
                return likely
                
            beta = alpha * (high - mean) / (mean - low)
            if beta <= 0:  # Invalid beta value
                return likely
                
            return np.random.beta(alpha, beta) * (high - low) + low
        except:
            # If any calculation fails, return the likely value
            return likely
    
    def run_simulation(self, iterations=1000000):
        results = []
        for _ in range(iterations):
            tef = self.pert(*self.tef)
            vuln = self.pert(*self.vuln)
            plm = self.pert(*self.plm)
            slef = self.pert(*self.slef)
            slm = self.pert(*self.slm)
            
            primary_loss = tef * vuln * plm
            secondary_loss = primary_loss * slef * slm
            total_loss = primary_loss + secondary_loss
            results.append(total_loss)
            
        return np.array(results)

class OutputGenerator:
    def __init__(self, results):
        self.results = results
        
    def generate_histogram(self):
        plt.figure(figsize=(10, 6))
        plt.hist(self.results, bins=50, density=True, alpha=0.7, color='skyblue')
        plt.title('Risk Distribution (Monte Carlo Simulation)')
        plt.xlabel('Annual Loss Exposure ($)')
        plt.ylabel('Probability Density')
        
        # Add percentile lines
        percentiles = [10, 50, 90]
        colors = ['green', 'red', 'orange']
        for p, c in zip(percentiles, colors):
            value = np.percentile(self.results, p)
            plt.axvline(x=value, color=c, linestyle='--', 
                       label=f'{p}th percentile: ${value:,.2f}')
        
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Convert plot to base64 string
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close()
        
        graph = base64.b64encode(image_png).decode('utf-8')
        return {
            'graph': graph,
            'percentiles': {
                'p10': float(np.percentile(self.results, 10)),
                'p50': float(np.percentile(self.results, 50)),
                'p90': float(np.percentile(self.results, 90))
            }
        } 