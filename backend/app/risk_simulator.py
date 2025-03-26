import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64

"""
# Previous implementation - commented out for reference
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
"""

# class Calculator:
#     def __init__(self, tef, vuln, plm_components, slef, slm_components):
#         """
#         Initialize calculator with risk components
        
#         Args:
#             tef (tuple): (min, likely, max, confidence) for Threat Event Frequency
#             vuln (tuple): (min, likely, max, confidence) for Vulnerability
#             plm_components (dict): Dictionary of PLEM components (Productivity, Response, Replacement)
#             slef (tuple): (min, likely, max, confidence) for Secondary Loss Event Frequency
#             slm_components (dict): Dictionary of SLEM components (excluding Productivity)
#         """
#         self.tef = tef
#         self.vuln = vuln
#         self.plm_components = plm_components
#         self.slef = slef
#         self.slm_components = slm_components
        
#     def pert(self, low, likely, high, confidence):
#         """
#         Generate random numbers based on the Modified PERT distribution.
        
#         Args:
#             low (float): Minimum value
#             likely (float): Most likely value
#             high (float): Maximum value
#             confidence (float): Shape parameter for the distribution
            
#         Returns:
#             float: Random value from the PERT distribution
#         """
#         # Handle edge cases
#         if high <= low or abs(high - low) < 1e-10:
#             return likely
            
#         # Calculate mean and variance
#         mean = (low + confidence * likely + high) / (confidence + 2)
#         if abs(likely - mean) < 1e-10:
#             likely += 1e-10
            
#         try:
#             # Calculate alpha and beta parameters
#             alpha = ((mean - low) * (2 * likely - low - high)) / ((high - low) * (likely - mean))
#             if alpha <= 0:
#                 return likely
                
#             beta = alpha * (high - mean) / (mean - low)
#             if beta <= 0:
#                 return likely
                
#             return np.random.beta(alpha, beta) * (high - low) + low
#         except:
#             return likely
            
#     def calculate_plem(self, iterations=1000000):
#         """Calculate Primary Loss Event Magnitude from components"""
#         plm_array = np.zeros(iterations)
#         for component in self.plm_components.values():
#             min_val, likely_val, max_val, conf = component
#             plm_array += np.array([self.pert(min_val, likely_val, max_val, conf) 
#                                  for _ in range(iterations)])
#         return plm_array
        
#     def calculate_slem(self, iterations=1000000):
#         """Calculate Secondary Loss Event Magnitude from components"""
#         slm_array = np.zeros(iterations)
#         for component in self.slm_components.values():
#             min_val, likely_val, max_val, conf = component
#             slm_array += np.array([self.pert(min_val, likely_val, max_val, conf) 
#                                  for _ in range(iterations)])
#         return slm_array
        
#     def run_simulation(self, iterations=1000000):
#         """
#         Run Monte Carlo simulation with the new strategy
        
#         Returns:
#             np.array: Array of total loss values
#         """
#         # Generate TEF and Vulnerability arrays
#         tef_array = np.array([self.pert(*self.tef) for _ in range(iterations)])
#         vuln_array = np.array([self.pert(*self.vuln) for _ in range(iterations)])
        
#         # Calculate LEF
#         lef_array = tef_array * vuln_array
        
#         # Calculate PLEM and SLEM
#         plm_array = self.calculate_plem(iterations)
#         slm_array = self.calculate_slem(iterations)
        
#         # Generate SLEF probability array
#         slef_array = np.array([self.pert(*self.slef) for _ in range(iterations)])
        
#         # Calculate losses
#         primary_losses = lef_array * plm_array
#         secondary_losses = primary_losses * slef_array * slm_array
#         total_losses = primary_losses + secondary_losses
        
#         return total_losses
    
import numpy as np
from scipy.stats import beta, poisson

class Calculator:
    def __init__(self, tef, vuln, plm_components, slef, slm_components):
        """
        Initialize calculator with risk components
        
        Args:
            tef (tuple): (min, likely, max, confidence [0–1]) for Threat Event Frequency
            vuln (tuple): (min, likely, max, confidence [0–1]) for Vulnerability
            plm_components (dict): Dictionary of PLEM components (Productivity, Response, Replacement)
            slef (tuple): (min, likely, max, confidence [0–1]) for Secondary Loss Event Frequency
            slm_components (dict): Dictionary of SLEM components (excluding Productivity)
        """
        print("\n=== Calculator Class Initialized ===")
        print(f"TEF received: {tef}")
        print(f"VULN received: {vuln}")
        print(f"PLEM Components received: {plm_components}")
        print(f"SLEF received: {slef}")
        print(f"SLEM Components received: {slm_components}")
        print("================================\n")
        
        self.tef = tef
        self.vuln = vuln
        self.plm_components = plm_components
        self.slef = slef
        self.slm_components = slm_components

    def map_confidence_to_lambda(self, confidence):
        return 2 + 4 * confidence  # Linear mapping from [0,1] to [2,6]

    def pert(self, low, likely, high, confidence, size):
        """
        Generate random numbers based on the Modified PERT distribution.

        Args:
            low (float): Minimum value
            likely (float): Most likely value
            high (float): Maximum value
            confidence (float): Value between 0 and 1 to map to lambda
            size (int): Number of samples

        Returns:
            np.array: Random values from the PERT distribution
        """
        lam = self.map_confidence_to_lambda(confidence)
        mean = (low + lam * likely + high) / (lam + 2)
        if likely == mean or low == high:
            alpha = beta_param = lam
        else:
            alpha = ((mean - low) * (2 * likely - low - high)) / ((likely - mean) * (high - low))
            beta_param = alpha * (high - mean) / (mean - low)
        samples = beta.rvs(a=alpha, b=beta_param, size=size) * (high - low) + low
        return samples

    def calculate_plem(self, iterations=1000000):
        """Calculate Primary Loss Event Magnitude from components"""
        plm_array = np.zeros(iterations)
        for component in self.plm_components.values():
            min_val, likely_val, max_val, conf = component
            plm_array += self.pert(min_val, likely_val, max_val, conf, iterations)
        return plm_array

    def calculate_slem(self, iterations=1000000):
        """Calculate Secondary Loss Event Magnitude from components"""
        slm_array = np.zeros(iterations)
        for component in self.slm_components.values():
            min_val, likely_val, max_val, conf = component
            slm_array += self.pert(min_val, likely_val, max_val, conf, iterations)
        return slm_array

    def run_simulation(self, iterations=1000000):
        """
        Run Monte Carlo simulation with Poisson-discrete LEF and Bernoulli secondary loss logic

        Returns:
            np.array: Array of total loss values
        """
        # Generate TEF and Vulnerability arrays
        tef_array = self.pert(*self.tef, iterations)
        vuln_array = self.pert(*self.vuln, iterations)

        # Calculate LEF as Poisson(TEF × VULN)
        lambda_array = tef_array * vuln_array
        lef_array = poisson.rvs(mu=lambda_array)

        # Calculate PLEM and SLEM
        plm_array = self.calculate_plem(iterations)
        slm_array = self.calculate_slem(iterations)

        # Generate SLEF probability array and apply Bernoulli process
        slef_array = self.pert(*self.slef, iterations)
        slef_trigger = np.random.rand(iterations) < slef_array

        # Calculate losses
        primary_losses = lef_array * plm_array
        secondary_losses = lef_array * slef_trigger * slm_array
        total_losses = primary_losses + secondary_losses

        return total_losses


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