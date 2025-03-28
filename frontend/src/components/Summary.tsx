import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid, Paper, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { RiskMetricsDisplay } from './RiskMetricsDisplay';
import { RiskMetrics, RiskMetric, RiskState, LossMagnitude, PrimaryLossEventFrequency, SecondaryLossEventFrequency } from '../types';



interface SummaryProps {
    riskState: RiskState;
    onBack: () => void;
    onRestart: () => void;
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

    console.log('Preparing simulation data with metrics:', metrics);

    // Helper function to format a risk metric as an object
    const formatRiskMetric = (metric: RiskMetric) => {
        console.log('\n=== Formatting Risk Metric ===');
        console.log('Original values:', {
            min: metric.min,
            likely: metric.likely,
            max: metric.max,
            confidence: metric.confidence
        });

        if (!metric || typeof metric.min === 'undefined' || typeof metric.likely === 'undefined' || typeof metric.max === 'undefined' || typeof metric.confidence === 'undefined') {
            console.error('Invalid metric format:', metric);
            throw new Error('Invalid metric format');
        }

        // Ensure values are positive and properly ordered
        const min = Math.max(0, metric.min);
        const likely = Math.max(min, Math.min(metric.likely, metric.max));
        const max = Math.max(likely, metric.max);

        console.log('After positive and ordering checks:', {
            min,
            likely,
            max,
            confidence: metric.confidence
        });

        // For probability metrics (VULN, SLEF), ensure values are between 0 and 1
        const isProbabilityMetric = metric === metrics.primary_loss_event_frequency.vulnerability || 
                                   metric === metrics.secondary_loss_event_frequency.SLEF;
        console.log('Is probability metric?', isProbabilityMetric);

        if (isProbabilityMetric) {
            const result = {
                min: Math.min(1, min),
                likely: Math.min(1, likely),
                max: Math.min(1, max),
                confidence: metric.confidence
            };
            console.log('Final probability values:', result);
            return result;
        }

        // For monetary values and TEF, just ensure they're positive and properly ordered
        const result = {
            min,
            likely,
            max,
            confidence: metric.confidence
        };
        console.log('Final values:', result);
        return result;
    };

    // Helper function to format loss magnitude components
    const formatLossMagnitudeComponents = (magnitude: LossMagnitude) => {
        console.log('Formatting loss magnitude:', magnitude);
        if (!magnitude) {
            console.error('Invalid loss magnitude:', magnitude);
            throw new Error('Invalid loss magnitude');
        }
      
        // Log each component before formatting
        console.log('Productivity:', magnitude.productivity);
        console.log('Response:', magnitude.response);
        console.log('Replacement:', magnitude.replacement);
        console.log('Competitive Advantage:', magnitude.competitive_advantage);
        console.log('Fines and Judgements:', magnitude.fines_and_judgements);
        console.log('Reputation:', magnitude.reputation);

        return {
            productivity: formatRiskMetric(magnitude.productivity),
            response: formatRiskMetric(magnitude.response),
            replacement: formatRiskMetric(magnitude.replacement),
            competitive_advantage: formatRiskMetric(magnitude.competitive_advantage),
            fines: formatRiskMetric(magnitude.fines_and_judgements),
            reputation: formatRiskMetric(magnitude.reputation),
        };
    };

    try {
        console.log('Formatting TEF:', metrics.primary_loss_event_frequency.threat_event_frequency);
        console.log('Formatting VULN:', metrics.primary_loss_event_frequency.vulnerability);
        console.log('Formatting SLEF:', metrics.secondary_loss_event_frequency.SLEF);

        const result = {
            tef: formatRiskMetric(metrics.primary_loss_event_frequency.threat_event_frequency),
            vuln: formatRiskMetric(metrics.primary_loss_event_frequency.vulnerability),
            plm: formatLossMagnitudeComponents(metrics.primary_loss_magnitude),
            slef: formatRiskMetric(metrics.secondary_loss_event_frequency.SLEF),
            slm: formatLossMagnitudeComponents(metrics.secondary_loss_magnitude)
        };

        console.log('Successfully prepared simulation data:', result);
        return result;
    } catch (error) {
        console.error('Error preparing simulation data:', error);
        return null;
    }
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

export const Summary: React.FC<SummaryProps> = ({ riskState, onBack, onRestart }) => {
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
                // Use the remediation strategies from the state
                if (riskState.remediation_suggestions && riskState.remediation_suggestions.length > 0) {
                    setRemediationStrategies(riskState.remediation_suggestions);
                } else {
                    console.warn('No remediation strategies found in state, using defaults');
                    setRemediationStrategies(defaultStrategies);
                }
            } catch (error) {
                console.error('Error setting remediation strategies:', error);
                setRemediationStrategies(defaultStrategies);
            } finally {
                setLoading(false);
            }
        };

        fetchRemediationStrategies();
    }, [riskState]);

    useEffect(() => {
        console.log('=== Simulation Effect Triggered ===');
        console.log('Current risk_metrics:', riskState.risk_metrics);
        
        const runSimulation = async () => {
            console.log('=== Starting Simulation ===');
            if (!riskState.risk_metrics) {
                console.log('No risk metrics available for simulation');
                return;
            }

            try {
                console.log('Preparing simulation data...');
                const simulationData = prepareSimulationData(riskState);
                if (!simulationData) {
                    console.error('Failed to prepare simulation data');
                    return;
                }

                console.log('Prepared simulation data:', JSON.stringify(simulationData, null, 2));

                console.log('Sending request to http://localhost:8000/api/simulate_risk');
                const response = await fetch('http://localhost:8000/api/simulate_risk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(simulationData),
                });

                console.log('Response status:', response.status);
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
            console.log('Risk metrics available, triggering simulation');
            runSimulation();
        } else {
            console.log('No risk metrics available, skipping simulation');
        }
        console.log('=== End Simulation Effect ===');
    }, [riskState.risk_metrics]);

    // Helper function to format metrics with confidence
    const formatMetricWithConfidence = (metric: RiskMetric) => ({
        min: metric.min,
        likely: metric.likely,
        max: metric.max,
        confidence: metric.confidence
    });

    // Add logging to check risk state and statement
    console.log('Risk State in Summary:', riskState);
    console.log('Risk Statement:', riskState?.risk_statement);

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Stack spacing={4}>
    
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

                <Paper>
                    <Grid container spacing={0} alignItems="stretch">
                        {/* Formalized Risk Statement Card */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        Formalized Risk Statement (ISO 27001)
                                    </Typography>

                                    <Box sx={{ 
                                        p: 2, 
                                        borderLeft: '4px solid', 
                                        borderColor: 'primary.main', 
                                        backgroundColor: '#f9f9f9',
                                        fontWeight: 'bold',
                                        }}>
                                        <Typography variant="body2">
                                            {riskState?.risk_statement || 'No risk statement available'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>


                        <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                            height: '100%',
                            borderLeft: '6px solid',
                            borderColor:
                                riskState.fair_score >= 8
                                ? 'error.main'
                                : riskState.fair_score >= 5
                                ? 'warning.main'
                                : 'success.main',
                            backgroundColor:
                                riskState.fair_score >= 8
                                ? '#fdecea'
                                : riskState.fair_score >= 5
                                ? '#fff8e1'
                                : '#e8f5e9',
                            }}
                        >
                            <CardContent>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{ fontWeight: 600, color: 'text.primary' }}
                            >
                                FAIR Score
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color:
                                    riskState.fair_score >= 8
                                        ? 'error.main'
                                        : riskState.fair_score >= 5
                                        ? 'warning.main'
                                        : 'success.main',
                                }}
                                >
                                {riskState.fair_score}/10
                                </Typography>

                                <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 500,
                                    color:
                                    riskState.fair_score >= 8
                                        ? 'error.main'
                                        : riskState.fair_score >= 5
                                        ? 'warning.main'
                                        : 'success.main',
                                }}
                                >
                                {riskState.fair_score >= 8
                                    ? 'High Risk'
                                    : riskState.fair_score >= 5
                                    ? 'Moderate Risk'
                                    : 'Low Risk'}
                                </Typography>
                            </Box>

                            <Typography variant="body2">
                                {riskState.fair_score_explanation}
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>
                    </Grid>
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
                                        <TableCell>
                                            <b>Significant loss level:</b> 90% probability that losses will reach or exceed this value (10th Percentile)
                                        </TableCell>
                                        <TableCell align="right">{formatCurrency(simulationResults.percentiles.p10)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Expected loss level:</b> 50% probability that losses will reach or exceed this value (50th Percentile)
                                        </TableCell>
                                        <TableCell align="right">{formatCurrency(simulationResults.percentiles.p50)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <b>Minimal loss level:</b> 10% probability that losses will reach or exceed this value (90th Percentile)
                                        </TableCell>
                                        <TableCell align="right">{formatCurrency(simulationResults.percentiles.p90)}</TableCell>
                                    </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                This simulation estimates potential annual losses, showing the likelihood of losses exceeding different dollar amounts based on your provided risk metrics.
                            </Typography>
                        </Stack>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </Paper>

                {/* Historical Analysis Section */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Final Values
                    </Typography>
                    <RiskMetricsDisplay 
                        metrics={riskState.risk_metrics}
                        scenarios={[riskState.selected_scenario]}
                        selectedScenario={riskState.selected_scenario}
                        showScenarios={false}
                    />
                </Paper>

            </Stack>
        </Box>
    );
}; 