import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Paper, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { RiskMetricsDisplay } from './RiskMetricsDisplay';
import { RiskMetrics, RiskMetric, RiskState, LossMagnitude, PrimaryLossEventFrequency, SecondaryLossEventFrequency } from '../types';

interface SummaryProps {
    riskState: RiskState;
}

interface RemediationStrategy {
    title: string;
    description: string;
    impact: string;
    implementation: string;
}

interface SimulationResults {
    graph: string;  // base64 encoded image
    percentiles: {
        p10: number;
        p50: number;
        p90: number;
    };
}

const prepareSimulationData = (riskState: RiskState) => {
    const metrics = riskState.risk_metrics;
    if (!metrics) {
        console.warn('No risk metrics available for simulation');
        return null;
    }

    // Helper function to format a risk metric
    const formatRiskMetric = (metric: RiskMetric) => ({
        min: metric.min,
        likely: metric.likely,
        max: metric.max,
        confidence: metric.confidence  // Keep as number
    });

    // Helper function to format loss magnitude categories
    const formatLossMagnitude = (magnitude: LossMagnitude) => ({
        productivity: formatRiskMetric(magnitude.productivity),
        response: formatRiskMetric(magnitude.response),
        replacement: formatRiskMetric(magnitude.replacement),
        competitive_advantage: formatRiskMetric(magnitude.competitive_advantage),
        fines: formatRiskMetric(magnitude.fines),
        reputation: formatRiskMetric(magnitude.reputation),
        relationship: formatRiskMetric(magnitude.relationship)
    });

    return {
        tef: formatRiskMetric(metrics.primary_loss_event_frequency.threat_event_frequency),
        vuln: formatRiskMetric(metrics.primary_loss_event_frequency.vulnerability),
        plm: formatLossMagnitude(metrics.primary_loss_magnitude),
        slef: formatRiskMetric(metrics.secondary_loss_event_frequency.SLEF),
        slm: formatLossMagnitude(metrics.secondary_loss_magnitude)
    };
};

// Add this helper function for formatting currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const Summary: React.FC<SummaryProps> = ({ riskState }) => {
    const [loading, setLoading] = useState(false);
    const [remediationStrategies, setRemediationStrategies] = useState<RemediationStrategy[]>([]);
    const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
    const remediationRef = useRef<RemediationStrategy[]>([]);

    // Default remediation strategies when API fails
    const defaultStrategies: RemediationStrategy[] = [
        {
            title: "Technical Controls",
            description: "Implement advanced threat detection systems and regular security assessments.",
            impact: "Significant reduction in risk of data breaches and unauthorized access.",
            implementation: "Requires investment in security tools and regular maintenance."
        },
        {
            title: "Operational Procedures",
            description: "Establish incident response plans and conduct regular security training.",
            impact: "Improved response time to incidents and reduced human error risks.",
            implementation: "Requires dedicated training time and documentation effort."
        },
        {
            title: "Risk Transfer",
            description: "Consider cyber insurance and third-party security services.",
            impact: "Financial protection against major incidents and expert support.",
            implementation: "Requires budget allocation and vendor assessment."
        }
    ];

    // Add detailed logging of all risk values
    useEffect(() => {
        console.log('=== SUMMARY PAGE VALUES ===');
        console.log('1. Risk Metrics:', riskState.risk_metrics);
        console.log('2. Historical Analysis:', riskState.historical_analysis);
        
        // Log the values we'll use for simulation
        const metrics = riskState.historical_analysis?.risk_metrics;
        if (metrics) {
            console.log('3. Simulation Input Values:', metrics);
        }
    }, [riskState]);

    // Add logging for entire riskState
    useEffect(() => {
        console.log('Full riskState received:', {
            user_inputs: riskState.user_inputs,
            selected_scenario: riskState.selected_scenario,
            risk_metrics: riskState.risk_metrics,
            historical_analysis: riskState.historical_analysis
        });
    }, [riskState]);

    // Add logging for risk metrics
    useEffect(() => {
        console.log('Current Risk Metrics:', riskState.risk_metrics);
        console.log('Historical Analysis Risk Metrics:', riskState.historical_analysis?.risk_metrics);
    }, [riskState.risk_metrics, riskState.historical_analysis?.risk_metrics]);

    useEffect(() => {
        const fetchRemediationStrategies = async () => {
            setLoading(true);
            try {
                // Generate tailored strategies based on user inputs and risk metrics
                const tailoredStrategies = generateTailoredStrategies(riskState);
                setRemediationStrategies(tailoredStrategies);
            } catch (error) {
                console.error('Error generating remediation strategies:', error);
                setRemediationStrategies(defaultStrategies);
            } finally {
                setLoading(false);
            }
        };

        fetchRemediationStrategies();
    }, [riskState]);

    // Function to generate tailored remediation strategies
    const generateTailoredStrategies = (state: RiskState): RemediationStrategy[] => {
        const strategies: RemediationStrategy[] = [];
        const metrics = state.risk_metrics;
        const userInputs = state.user_inputs;

        // Add industry-specific strategy
        strategies.push({
            title: `${userInputs.industry} Security Controls`,
            description: `Implement industry-standard security measures specific to ${userInputs.industry} sector requirements.`,
            impact: "Ensures compliance with industry regulations and best practices.",
            implementation: `Requires coordination with ${userInputs.industry} security experts and regular audits.`
        });

        // Add size-based strategy
        const isLargeOrg = userInputs.employees > 1000 || userInputs.revenue > 100000000;
        strategies.push({
            title: isLargeOrg ? "Enterprise Security Program" : "Small Business Security Essentials",
            description: isLargeOrg 
                ? "Establish a comprehensive enterprise security program with dedicated security team."
                : "Implement cost-effective security measures suitable for small businesses.",
            impact: isLargeOrg
                ? "Comprehensive protection for large-scale operations"
                : "Essential protection while maintaining operational efficiency",
            implementation: isLargeOrg
                ? "Requires significant investment in security infrastructure and personnel"
                : "Can be implemented with minimal IT resources and managed services"
        });

        // Add risk-based strategy
        if (metrics) {
            const highRisk = metrics.risk_score > 0.7;
            strategies.push({
                title: highRisk ? "Critical Risk Mitigation" : "Preventive Controls",
                description: highRisk
                    ? "Immediate implementation of critical security controls to address high-risk areas."
                    : "Strengthen existing controls and implement preventive measures.",
                impact: highRisk
                    ? "Significant reduction in critical vulnerabilities"
                    : "Enhanced protection against potential threats",
                implementation: highRisk
                    ? "Requires urgent allocation of resources and immediate action"
                    : "Can be implemented gradually as part of regular security updates"
            });
        }

        return strategies;
    };

    useEffect(() => {
        const runSimulation = async () => {
            if (!riskState.risk_metrics) {
                console.log('No risk metrics available for simulation');
                return;
            }

            try {
                const metrics = riskState.risk_metrics;
                console.log('Running simulation with metrics:', metrics);

                // Calculate total loss magnitudes
                const calculateTotalLoss = (magnitude: LossMagnitude) => {
                    const categories = ['productivity', 'response', 'replacement', 
                                     'competitive_advantage', 'fines', 'reputation', 'relationship'];
                    return {
                        min: categories.reduce((sum, cat) => sum + magnitude[cat].min, 0),
                        likely: categories.reduce((sum, cat) => sum + magnitude[cat].likely, 0),
                        max: categories.reduce((sum, cat) => sum + magnitude[cat].max, 0)
                    };
                };

                const plmTotal = calculateTotalLoss(metrics.primary_loss_magnitude);
                const slmTotal = calculateTotalLoss(metrics.secondary_loss_magnitude);

                // Format the data according to the backend's Calculator class expectations
                const simulationData = {
                    tef: {
                        min: metrics.primary_loss_event_frequency.threat_event_frequency.min,
                        likely: metrics.primary_loss_event_frequency.threat_event_frequency.likely,
                        max: metrics.primary_loss_event_frequency.threat_event_frequency.max,
                        confidence: metrics.primary_loss_event_frequency.threat_event_frequency.confidence
                    },
                    vuln: {
                        min: metrics.primary_loss_event_frequency.vulnerability.min,
                        likely: metrics.primary_loss_event_frequency.vulnerability.likely,
                        max: metrics.primary_loss_event_frequency.vulnerability.max,
                        confidence: metrics.primary_loss_event_frequency.vulnerability.confidence
                    },
                    plm: {
                        productivity: { ...metrics.primary_loss_magnitude.productivity },
                        response: { ...metrics.primary_loss_magnitude.response },
                        replacement: { ...metrics.primary_loss_magnitude.replacement },
                        competitive_advantage: { ...metrics.primary_loss_magnitude.competitive_advantage },
                        fines: { ...metrics.primary_loss_magnitude.fines },
                        reputation: { ...metrics.primary_loss_magnitude.reputation },
                        relationship: { ...metrics.primary_loss_magnitude.relationship }
                    },
                    slef: {
                        min: metrics.secondary_loss_event_frequency.SLEF.min,
                        likely: metrics.secondary_loss_event_frequency.SLEF.likely,
                        max: metrics.secondary_loss_event_frequency.SLEF.max,
                        confidence: metrics.secondary_loss_event_frequency.SLEF.confidence
                    },
                    slm: {
                        productivity: { ...metrics.secondary_loss_magnitude.productivity },
                        response: { ...metrics.secondary_loss_magnitude.response },
                        replacement: { ...metrics.secondary_loss_magnitude.replacement },
                        competitive_advantage: { ...metrics.secondary_loss_magnitude.competitive_advantage },
                        fines: { ...metrics.secondary_loss_magnitude.fines },
                        reputation: { ...metrics.secondary_loss_magnitude.reputation },
                        relationship: { ...metrics.secondary_loss_magnitude.relationship }
                    }
                };

                console.log('Sending simulation data:', simulationData);

                const response = await fetch('http://localhost:8000/api/simulate_risk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(simulationData),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Simulation error response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
                }

                const data = await response.json();
                console.log('Received simulation results:', data);
                
                setSimulationResults({
                    graph: data.graph || '',
                    percentiles: {
                        p10: data.percentiles?.p10 || 0,
                        p50: data.percentiles?.p50 || 0,
                        p90: data.percentiles?.p90 || 0
                    }
                });
            } catch (error) {
                console.error('Error running simulation:', error);
            }
        };

        if (riskState.risk_metrics) {
            runSimulation();
        }
    }, [riskState.risk_metrics]);

    // Helper function to format metrics with confidence
    const formatMetricWithConfidence = (metric: RiskMetric) => ({
        min: metric.min,
        likely: metric.likely,
        max: metric.max,
        confidence: metric.confidence
    });

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Stack spacing={4}>
                {/* Historical Analysis Section */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Historical Risk Analysis
                    </Typography>
                    <RiskMetricsDisplay 
                        metrics={riskState.risk_metrics}
                        scenarios={[riskState.selected_scenario]}
                        selectedScenario={riskState.selected_scenario}
                        showScenarios={false}
                    />
                </Paper>

                {/* Monte Carlo Simulation Section */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Monte Carlo Simulation Results
                    </Typography>
                    {simulationResults ? (
                        <Stack spacing={2}>
                            {/* Display the simulation graph */}
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <img 
                                    src={`data:image/png;base64,${simulationResults.graph}`}
                                    alt="Monte Carlo Simulation Results"
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </Box>

                            {/* Display percentiles in a table */}
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Percentile</TableCell>
                                            <TableCell align="right">Annual Loss Exposure</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>10th Percentile (Optimistic)</TableCell>
                                            <TableCell align="right">{formatCurrency(simulationResults.percentiles.p10)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>50th Percentile (Median)</TableCell>
                                            <TableCell align="right">{formatCurrency(simulationResults.percentiles.p50)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>90th Percentile (Conservative)</TableCell>
                                            <TableCell align="right">{formatCurrency(simulationResults.percentiles.p90)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                This simulation runs thousands of scenarios to estimate potential annual losses based on the provided risk metrics. 
                                The 50th percentile represents the median expected loss, while the 10th and 90th percentiles show optimistic and conservative estimates respectively.
                            </Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </Paper>

                {/* Remediation Strategies Section */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Recommended Remediation Strategies
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {remediationStrategies.map((strategy, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {strategy.title}
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                {strategy.description}
                                            </Typography>
                                            <Typography variant="body2" color="primary" paragraph>
                                                Impact: {strategy.impact}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Implementation: {strategy.implementation}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>
            </Stack>
        </Box>
    );
}; 