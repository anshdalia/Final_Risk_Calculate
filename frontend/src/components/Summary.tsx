import React from 'react';
import { Box, Grid, Paper, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent } from '@mui/material';
import { RiskState } from '../types';

interface SummaryProps {
    riskState: RiskState;
}

export const Summary: React.FC<SummaryProps> = ({ riskState }) => {
    // Helper function to get remediation strategies based on scenario
    const getRemediationStrategies = () => {
        const strategies = [
            {
                title: "Technical Controls",
                description: "Implement advanced threat detection systems and regular security assessments to identify and address vulnerabilities proactively."
            },
            {
                title: "Operational Procedures",
                description: "Establish comprehensive incident response plans and conduct regular employee training on security awareness and best practices."
            },
            {
                title: "Risk Transfer",
                description: "Consider cyber insurance coverage and third-party security services to help mitigate potential financial impacts."
            }
        ];
        return strategies;
    };

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
                            <Stack spacing={2}>
                                {getRemediationStrategies().map((strategy, index) => (
                                    <Box key={index}>
                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                            {index + 1}. {strategy.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {strategy.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
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
        </Box>
    );
}; 