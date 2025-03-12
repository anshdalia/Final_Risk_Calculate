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
}

export const Summary: React.FC<SummaryProps> = ({ riskState }) => {
    const [remediationStrategies, setRemediationStrategies] = useState<RemediationStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);

    useEffect(() => {
        const fetchRemediationStrategies = async () => {
            try {
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
                            description: riskState.selected_scenario?.description,
                            severity_level: riskState.selected_scenario?.severity_level,
                            potential_impact: riskState.selected_scenario?.potential_impact
                        }
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch remediation strategies');
                }

                const data = await response.json();
                setRemediationStrategies(data.remediation_strategies || []);
            } catch (error) {
                console.error('Error fetching remediation strategies:', error);
                // Fallback strategies in case of error
                setRemediationStrategies([
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
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (riskState.selected_scenario) {
            fetchRemediationStrategies();
        }
    }, [riskState]);

    useEffect(() => {
        const fetchSimulation = async () => {
            if (riskState) {
                try {
                    console.log('Sending simulation request with data:', {
                        tef: riskState.threat_event_frequency,
                        vulnerability: riskState.vulnerability,
                        plm: riskState.primary_loss_magnitude,
                        slef: riskState.secondary_loss_event_frequency,
                        slm: riskState.secondary_loss_magnitude
                    });
                    
                    const response = await fetch('http://localhost:8000/api/simulate_risk', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            tef: {
                                min: riskState.threat_event_frequency?.min || 0,
                                likely: riskState.threat_event_frequency?.likely || 0,
                                max: riskState.threat_event_frequency?.max || 0
                            },
                            vulnerability: {
                                min: riskState.vulnerability?.min || 0,
                                likely: riskState.vulnerability?.likely || 0,
                                max: riskState.vulnerability?.max || 0
                            },
                            plm: {
                                min: riskState.primary_loss_magnitude?.min || 0,
                                likely: riskState.primary_loss_magnitude?.likely || 0,
                                max: riskState.primary_loss_magnitude?.max || 0
                            },
                            slef: {
                                min: riskState.secondary_loss_event_frequency?.min || 0,
                                likely: riskState.secondary_loss_event_frequency?.likely || 0,
                                max: riskState.secondary_loss_event_frequency?.max || 0
                            },
                            slm: {
                                min: riskState.secondary_loss_magnitude?.min || 0,
                                likely: riskState.secondary_loss_magnitude?.likely || 0,
                                max: riskState.secondary_loss_magnitude?.max || 0
                            }
                        }),
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setSimulationResults(data);
                    } else {
                        console.error('Simulation request failed:', await response.text());
                    }
                } catch (error) {
                    console.error('Error fetching simulation:', error);
                }
            }
        };

        fetchSimulation();
    }, [riskState]);

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
                                    {remediationStrategies.map((strategy, index) => (
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