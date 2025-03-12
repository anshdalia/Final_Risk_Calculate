import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { RiskState } from '../types';

interface SummaryProps {
    riskState: RiskState;
}

export const Summary: React.FC<SummaryProps> = ({ riskState }) => {
    return (
        <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Risk Assessment Summary
                </Typography>
                
                {/* Risk Scenario Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Selected Risk Scenario
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {riskState.selected_scenario?.description}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        Industry: {riskState.industry}
                    </Typography>
                </Box>

                {/* Historical Analysis Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Historical Analysis Insights
                    </Typography>
                    {riskState.historical_analysis?.similar_incidents?.length > 0 ? (
                        <>
                            <Typography variant="body1" paragraph>
                                Found {riskState.historical_analysis.similar_incidents.length} similar historical incidents.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Most similar incident had a {(riskState.historical_analysis.similar_incidents[0].similarity_score * 100).toFixed(0)}% match.
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No similar historical incidents found.
                        </Typography>
                    )}
                </Box>

                {/* Final Risk Metrics */}
                <Box>
                    <Typography variant="h6" gutterBottom color="primary">
                        Final Risk Metrics
                    </Typography>
                    <Stack spacing={2}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Risk Score
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {riskState.risk_metrics?.risk_score?.toFixed(2)}
                            </Typography>
                        </Paper>
                        
                        <Stack direction="row" spacing={2}>
                            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Threat Event Frequency (TEF)
                                </Typography>
                                <Typography variant="h5">
                                    {riskState.risk_metrics?.tef?.toFixed(2)}
                                </Typography>
                            </Paper>
                            
                            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Loss Magnitude (LM)
                                </Typography>
                                <Typography variant="h5">
                                    {riskState.risk_metrics?.lm?.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Stack>
                    </Stack>
                </Box>
            </Paper>
        </Stack>
    );
}; 