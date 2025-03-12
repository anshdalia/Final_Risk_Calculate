import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CircularProgress } from '@mui/material';

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
    graph: string;
    percentiles: {
        p10: number;
        p50: number;
        p90: number;
    };
}

interface RiskState {
    user_inputs: {
        industry: string;
        location: string;
        employees: number;
        revenue: number;
        additional_factors: string[];
    };
    selected_scenario: {
        description: string;
        severity_level: string;
        potential_impact: string;
    };
    threat_event_frequency: {
        min: number;
        likely: number;
        max: number;
    };
    vulnerability: {
        min: number;
        likely: number;
        max: number;
    };
    primary_loss_magnitude: {
        min: number;
        likely: number;
        max: number;
    };
    secondary_loss_event_frequency: {
        min: number;
        likely: number;
        max: number;
    };
    secondary_loss_magnitude: {
        min: number;
        likely: number;
        max: number;
    };
    risk_metrics: {
        risk_score: number;
        tef: number;
        vulnerability: number;
        loss_event_frequency: number;
        primary_loss: number;
        secondary_loss: number;
        lm: number;
    };
    historical_analysis: {
        risk_metrics: {
            primary_loss_event_frequency: {
                threat_event_frequency: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                vulnerability: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
            };
            secondary_loss_event_frequency: {
                SLEF: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
            };
            primary_loss_magnitude: {
                productivity: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                response: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                replacement: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                competitive_advantage: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                fines_and_judgements: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                reputation: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
            };
            secondary_loss_magnitude: {
                productivity: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                response: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                replacement: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                competitive_advantage: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                fines_and_judgements: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
                reputation: {
                    min: number;
                    likely: number;
                    max: number;
                    confidence: number;
                };
            };
        };
        similar_incidents: Array<{
            date: string;
            industry: string;
            event_type: string;
            description: string;
            financial_impact: number | null;
            affected_count: number | null;
            similarity_score: number;
        }>;
        risk_adjustments: {
            frequency_factor: number;
            magnitude_factor: number;
            confidence: number;
        };
        summary: {
            total_matches: number;
            avg_financial_impact: number;
            most_common_type: string;
        };
    };
}

export const Summary: React.FC<SummaryProps> = ({ riskState }) => {
    const [remediationStrategies, setRemediationStrategies] = useState<RemediationStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);

    // Store remediation strategies in ref to persist them
    const remediationRef = React.useRef<RemediationStrategy[]>([]);

    // Add logging for risk metrics
    useEffect(() => {
        console.log('Current Risk Metrics:', {
            risk_score: riskState.risk_metrics?.risk_score,
            tef: riskState.risk_metrics?.tef,
            vulnerability: riskState.risk_metrics?.vulnerability,
            loss_event_frequency: riskState.risk_metrics?.loss_event_frequency,
            primary_loss: riskState.risk_metrics?.primary_loss,
            secondary_loss: riskState.risk_metrics?.secondary_loss,
            lm: riskState.risk_metrics?.lm
        });

        console.log('Historical Analysis Risk Metrics:', riskState.historical_analysis?.risk_metrics);
    }, [riskState.risk_metrics, riskState.historical_analysis?.risk_metrics]);

    useEffect(() => {
        const fetchRemediationStrategies = async () => {
            if (!riskState.selected_scenario || remediationRef.current.length > 0) {
                return; // Don't fetch if we already have strategies or no scenario
            }

            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/api/get_remediation_strategies', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        industry: riskState.user_inputs.industry,
                        location: riskState.user_inputs.location,
                        employees: riskState.user_inputs.employees,
                        revenue: riskState.user_inputs.revenue,
                        risk_factors: riskState.user_inputs.additional_factors,
                        risk_scenario: {
                            description: riskState.selected_scenario.description,
                            severity_level: riskState.selected_scenario.severity_level,
                            potential_impact: riskState.selected_scenario.potential_impact
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch remediation strategies');
                }

                const data = await response.json();
                const strategies = data.remediation_strategies || [];
                setRemediationStrategies(strategies);
                remediationRef.current = strategies;
            } catch (error) {
                console.error('Error fetching remediation strategies:', error);
                const fallbackStrategies = [
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
                setRemediationStrategies(fallbackStrategies);
                remediationRef.current = fallbackStrategies;
            } finally {
                setLoading(false);
            }
        };

        fetchRemediationStrategies();
    }, [riskState.selected_scenario]);

    useEffect(() => {
        const fetchSimulation = async () => {
            if (!riskState?.historical_analysis?.risk_metrics) {
                console.log('No historical analysis data available');
                return;
            }

            try {
                console.log('Full historical analysis:', riskState.historical_analysis);
                
                // Helper function to safely get nested values
                const safeGetValue = (obj: any, path: string[], defaultValue = 0) => {
                    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
                };

                // Sum up all loss magnitudes for a total
                const calculateTotalLossMagnitude = (magnitudeType: 'primary_loss_magnitude' | 'secondary_loss_magnitude') => {
                    const categories = ['productivity', 'response', 'replacement', 'competitive_advantage', 'fines_and_judgements', 'reputation'];
                    const metrics = riskState.historical_analysis.risk_metrics[magnitudeType];
                    
                    if (!metrics) {
                        console.warn(`No ${magnitudeType} data found`);
                        return { min: 0, likely: 0, max: 0 };
                    }

                    return {
                        min: categories.reduce((sum, category) => 
                            sum + safeGetValue(metrics[category], ['min'], 0), 0),
                        likely: categories.reduce((sum, category) => 
                            sum + safeGetValue(metrics[category], ['likely'], 0), 0),
                        max: categories.reduce((sum, category) => 
                            sum + safeGetValue(metrics[category], ['max'], 0), 0)
                    };
                };

                const plmTotal = calculateTotalLossMagnitude('primary_loss_magnitude');
                const slmTotal = calculateTotalLossMagnitude('secondary_loss_magnitude');
                
                const simulationData = {
                    tef: {
                        min: safeGetValue(riskState.historical_analysis.risk_metrics.primary_loss_event_frequency, ['threat_event_frequency', 'min'], 0),
                        likely: safeGetValue(riskState.historical_analysis.risk_metrics.primary_loss_event_frequency, ['threat_event_frequency', 'likely'], 0),
                        max: safeGetValue(riskState.historical_analysis.risk_metrics.primary_loss_event_frequency, ['threat_event_frequency', 'max'], 0)
                    },
                    vulnerability: {
                        min: safeGetValue(riskState.historical_analysis.risk_metrics.primary_loss_event_frequency, ['vulnerability', 'min'], 0),
                        likely: safeGetValue(riskState.historical_analysis.risk_metrics.primary_loss_event_frequency, ['vulnerability', 'likely'], 0),
                        max: safeGetValue(riskState.historical_analysis.risk_metrics.primary_loss_event_frequency, ['vulnerability', 'max'], 0)
                    },
                    plm: plmTotal,
                    slef: {
                        min: safeGetValue(riskState.historical_analysis.risk_metrics.secondary_loss_event_frequency, ['SLEF', 'min'], 0),
                        likely: safeGetValue(riskState.historical_analysis.risk_metrics.secondary_loss_event_frequency, ['SLEF', 'likely'], 0),
                        max: safeGetValue(riskState.historical_analysis.risk_metrics.secondary_loss_event_frequency, ['SLEF', 'max'], 0)
                    },
                    slm: slmTotal
                };

                console.log('Sending simulation data:', simulationData);
                
                const response = await fetch('http://localhost:8000/api/simulate_risk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(simulationData),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setSimulationResults(data);
                } else {
                    const errorText = await response.text();
                    console.error('Simulation request failed:', errorText);
                }
            } catch (error) {
                console.error('Error fetching simulation:', error);
            }
        };

        fetchSimulation();
    }, [riskState?.historical_analysis]);

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Left Side - Risk Scenario Card */}
                <Grid item xs={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" color="primary" gutterBottom>
                                Selected Risk Scenario
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Severity Level: {riskState.selected_scenario?.severity_level}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {riskState.selected_scenario?.description}
                                </Typography>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Potential Impact:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {riskState.selected_scenario?.potential_impact}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Side - Remediation Strategies */}
                <Grid item xs={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" color="primary" gutterBottom>
                                Recommended Risk Remediation Strategies
                            </Typography>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Stack spacing={2}>
                                    {(remediationStrategies.length > 0 ? remediationStrategies : remediationRef.current).map((strategy, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                                {index + 1}. {strategy.title}
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                {strategy.description}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                <strong>Impact:</strong> {strategy.impact}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Implementation:</strong> {strategy.implementation}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Values Title */}
            <Box sx={{ 
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                mb: 3,
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography 
                    variant="h5"
                    sx={{ 
                        textAlign: 'center',
                        fontWeight: 500,
                        color: 'primary.main'
                    }}
                >
                    Values After Historical Analysis
                </Typography>
            </Box>

            {/* Risk Metrics Table */}
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Risk Metric</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Current Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Risk Score</TableCell>
                            <TableCell align="right">{riskState.risk_metrics?.risk_score?.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Threat Event Frequency (TEF)</TableCell>
                            <TableCell align="right">{riskState.risk_metrics?.tef?.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Loss Magnitude (LM)</TableCell>
                            <TableCell align="right">{riskState.risk_metrics?.lm?.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Monte Carlo Simulation Results */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Monte Carlo Risk Simulation
                        </Typography>
                        {simulationResults && (
                            <>
                                <Box sx={{ textAlign: 'center', my: 2 }}>
                                    <img 
                                        src={`data:image/png;base64,${simulationResults.graph}`}
                                        alt="Risk Distribution"
                                        style={{ maxWidth: '100%', height: 'auto' }}
                                    />
                                </Box>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Percentile</TableCell>
                                                <TableCell align="right">Annual Loss Exposure</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>10th Percentile</TableCell>
                                                <TableCell align="right">${simulationResults.percentiles.p10.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>50th Percentile (Median)</TableCell>
                                                <TableCell align="right">${simulationResults.percentiles.p50.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>90th Percentile</TableCell>
                                                <TableCell align="right">${simulationResults.percentiles.p90.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    );
}; 