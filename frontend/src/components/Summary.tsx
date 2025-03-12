import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { RiskMetricsDisplay } from './RiskMetricsDisplay';
import { RiskMetrics, RiskMetric } from '../types';

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
    const [valuesDialogOpen, setValuesDialogOpen] = useState(false);

    // Store remediation strategies in ref to persist them
    const remediationRef = React.useRef<RemediationStrategy[]>([]);

    // Add detailed logging of all risk values
    useEffect(() => {
        console.log('=== SUMMARY PAGE VALUES ===');
        console.log('1. Risk Metrics:', {
            risk_score: riskState.risk_metrics?.risk_score,
            tef: riskState.risk_metrics?.tef,
            vulnerability: riskState.risk_metrics?.vulnerability,
            loss_event_frequency: riskState.risk_metrics?.loss_event_frequency,
            primary_loss: riskState.risk_metrics?.primary_loss,
            secondary_loss: riskState.risk_metrics?.secondary_loss,
            lm: riskState.risk_metrics?.lm
        });

        console.log('2. Historical Analysis:', {
            risk_adjustments: riskState.historical_analysis?.risk_adjustments,
            summary: riskState.historical_analysis?.summary,
            risk_metrics: riskState.historical_analysis?.risk_metrics
        });

        // Log the values we'll use for simulation
        const metrics = riskState.historical_analysis?.risk_metrics;
        if (metrics) {
            console.log('3. Simulation Input Values:', {
                tef: metrics.primary_loss_event_frequency?.threat_event_frequency,
                vulnerability: metrics.primary_loss_event_frequency?.vulnerability,
                primary_loss_magnitude: metrics.primary_loss_magnitude,
                secondary_loss_event_frequency: metrics.secondary_loss_event_frequency,
                secondary_loss_magnitude: metrics.secondary_loss_magnitude
            });
        }
    }, [riskState]);

    // Add logging for entire riskState
    useEffect(() => {
        console.log('Full riskState received:', {
            user_inputs: riskState.user_inputs,
            selected_scenario: riskState.selected_scenario,
            threat_event_frequency: riskState.threat_event_frequency,
            vulnerability: riskState.vulnerability,
            primary_loss_magnitude: riskState.primary_loss_magnitude,
            secondary_loss_event_frequency: riskState.secondary_loss_event_frequency,
            secondary_loss_magnitude: riskState.secondary_loss_magnitude,
            risk_metrics: riskState.risk_metrics,
            historical_analysis: riskState.historical_analysis
        });
    }, [riskState]);

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
            // Check if we have historical analysis data with risk metrics
            if (!riskState?.historical_analysis?.risk_metrics) {
                console.log('No historical analysis risk metrics available');
                return;
            }

            try {
                console.log('Using historical analysis risk metrics for simulation');
                
                // Get the metrics from historical analysis
                const metrics = riskState.historical_analysis.risk_metrics;
                
                // Sum up all loss magnitudes for a total
                const calculateTotalLossMagnitude = (magnitudeType: 'primary_loss_magnitude' | 'secondary_loss_magnitude') => {
                    const categories = ['productivity', 'response', 'replacement', 'competitive_advantage', 'fines_and_judgements', 'reputation'];
                    const data = metrics[magnitudeType];
                    
                    if (!data) {
                        console.warn(`No ${magnitudeType} data found`);
                        return { min: 0, likely: 0, max: 0 };
                    }

                    return {
                        min: categories.reduce((sum, category) => 
                            sum + (data[category]?.min || 0), 0),
                        likely: categories.reduce((sum, category) => 
                            sum + (data[category]?.likely || 0), 0),
                        max: categories.reduce((sum, category) => 
                            sum + (data[category]?.max || 0), 0)
                    };
                };

                const plmTotal = calculateTotalLossMagnitude('primary_loss_magnitude');
                const slmTotal = calculateTotalLossMagnitude('secondary_loss_magnitude');
                
                const simulationData = {
                    tef: {
                        min: metrics.primary_loss_event_frequency?.threat_event_frequency?.min || 0,
                        likely: metrics.primary_loss_event_frequency?.threat_event_frequency?.likely || 0,
                        max: metrics.primary_loss_event_frequency?.threat_event_frequency?.max || 0
                    },
                    vulnerability: {
                        min: metrics.primary_loss_event_frequency?.vulnerability?.min || 0,
                        likely: metrics.primary_loss_event_frequency?.vulnerability?.likely || 0,
                        max: metrics.primary_loss_event_frequency?.vulnerability?.max || 0
                    },
                    plm: plmTotal,
                    slef: {
                        min: metrics.secondary_loss_event_frequency?.SLEF?.min || 0,
                        likely: metrics.secondary_loss_event_frequency?.SLEF?.likely || 0,
                        max: metrics.secondary_loss_event_frequency?.SLEF?.max || 0
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
            {/* Add button to show values */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                        // Log all values to console and open an alert with key values
                        const metrics = riskState.historical_analysis?.risk_metrics;
                        console.log('Historical Analysis Metrics:', metrics);
                        
                        let message = 'Historical Analysis Values:\n\n';
                        
                        if (metrics) {
                            // TEF
                            message += `TEF: ${metrics.primary_loss_event_frequency?.threat_event_frequency?.likely?.toFixed(4) || 'N/A'}\n`;
                            
                            // Vulnerability
                            message += `Vulnerability: ${metrics.primary_loss_event_frequency?.vulnerability?.likely?.toFixed(2) || 'N/A'}\n`;
                            
                            // Primary Loss Magnitude
                            const plmCategories = ['productivity', 'response', 'replacement', 'competitive_advantage', 'fines_and_judgements', 'reputation'];
                            const plm = metrics.primary_loss_magnitude;
                            const plmTotal = plm ? plmCategories.reduce((sum, cat) => sum + (plm[cat]?.likely || 0), 0) : 0;
                            message += `Primary Loss Magnitude: ${plmTotal.toLocaleString()}\n`;
                            
                            // SLEF
                            message += `SLEF: ${metrics.secondary_loss_event_frequency?.SLEF?.likely?.toFixed(4) || 'N/A'}\n`;
                            
                            // Secondary Loss Magnitude
                            const slm = metrics.secondary_loss_magnitude;
                            const slmTotal = slm ? plmCategories.reduce((sum, cat) => sum + (slm[cat]?.likely || 0), 0) : 0;
                            message += `Secondary Loss Magnitude: ${slmTotal.toLocaleString()}\n`;
                        } else {
                            message += 'No historical analysis metrics available';
                        }
                        
                        alert(message);
                    }}
                >
                    Show Risk Values
                </Button>
            </Box>

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
                    variant="h4" 
                    sx={{ 
                        textAlign: 'center',
                        fontWeight: 500,
                        fontSize: '1.75rem',
                        color: 'primary.main'
                    }}
                >
                    Values After Historical Analysis
                </Typography>
            </Box>

            {/* Use RiskMetricsDisplay exactly as in historical analysis phase */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <RiskMetricsDisplay 
                    metrics={riskState.risk_metrics as unknown as RiskMetrics} 
                    scenarios={[riskState.selected_scenario]}
                    selectedScenario={riskState.selected_scenario}
                    showScenarios={false}
                />
            </Paper>

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