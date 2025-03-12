import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    Stack,
    Alert,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { RiskState } from '../types';
import { ScenariosDisplay } from './RiskMetricsDisplay';

interface Props {
    riskState: RiskState;
    onAnalyze: () => Promise<void>;
    disabled?: boolean;
    loading?: boolean;
    onContinue?: () => void;
}

export const IndustryAnalysisForm: React.FC<Props> = ({
    riskState,
    onAnalyze,
    disabled = false,
    loading = false,
    onContinue
}) => {
    const renderAnalysisDetails = () => {
        if (!riskState.industry_analysis) {
            return (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Click "Process Industry Analysis" to analyze industry trends and adjust risk metrics.
                </Alert>
            );
        }

        return (
            <Stack spacing={2}>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Industry Profile
                    </Typography>
                    <Alert 
                        severity="error" 
                        icon={false}
                        sx={{ 
                            mb: 2,
                            backgroundColor: 'transparent',
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        {riskState.user_inputs.industry} sector with {riskState.user_inputs.employees} employees
                        {riskState.user_inputs.location && ` in ${riskState.user_inputs.location}`}
                    </Alert>
                </Box>

                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Industry-Specific Insights
                    </Typography>
                    <Alert 
                        severity="error" 
                        icon={false}
                        sx={{ 
                            mb: 1,
                            backgroundColor: 'transparent',
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        Average breach cost in {riskState.user_inputs.industry}: ${(riskState.industry_analysis?.insights?.breach_cost?.amount || 0).toLocaleString()} ({riskState.industry_analysis?.insights?.breach_cost?.year})
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Source: {riskState.industry_analysis?.insights?.breach_cost?.source}
                        </Typography>
                    </Alert>
                    <Alert 
                        severity="error" 
                        icon={false}
                        sx={{ 
                            mb: 1,
                            backgroundColor: 'transparent',
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        Primary attack vectors: {riskState.industry_analysis?.insights?.attack_vectors?.map(vector => 
                            `${vector.type} (${vector.percentage}%)`
                        ).join(', ')}
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Source: {riskState.industry_analysis?.insights?.attack_vectors?.[0]?.source}
                        </Typography>
                    </Alert>
                    <Alert 
                        severity="error" 
                        icon={false}
                        sx={{ 
                            mb: 1,
                            backgroundColor: 'transparent',
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        Mean time to identify: {riskState.industry_analysis?.insights?.response_times?.time_to_identify} days, 
                        Mean time to contain: {riskState.industry_analysis?.insights?.response_times?.time_to_contain} days
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Source: {riskState.industry_analysis?.insights?.response_times?.source}
                        </Typography>
                    </Alert>
                </Box>

                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Top Cyber Crimes in {riskState.user_inputs.location}
                    </Typography>
                    <Alert 
                        severity="error" 
                        icon={false}
                        sx={{ 
                            backgroundColor: 'transparent',
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        <Stack spacing={1}>
                            {riskState.industry_analysis?.regional_cyber_crimes?.map((crime, index) => (
                                <Typography key={index} variant="body1">
                                    • {crime.crime_type} - {crime.statistics} ({crime.year})
                                </Typography>
                            ))}
                        </Stack>
                    </Alert>
                </Box>
            </Stack>
        );
    };

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            {/* Top Section - Scenarios and Analysis side by side */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Left Side - Scenarios */}
                <Grid item xs={6}>
                    <Paper sx={{ 
                        p: 3, 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
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
                                Risk Scenarios Assessment
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <ScenariosDisplay 
                                scenarios={riskState.scenarios} 
                                selectedScenario={riskState.selected_scenario}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Side - Industry Analysis */}
                <Grid item xs={6}>
                    <Paper sx={{ 
                        p: 3, 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
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
                                Industry Analysis Details
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {renderAnalysisDetails()}
                        </Box>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <LoadingButton 
                                onClick={onAnalyze}
                                variant="contained" 
                                color="primary"
                                fullWidth
                                loading={loading}
                                disabled={disabled}
                            >
                                Process Industry Analysis
                            </LoadingButton>
                            {riskState.industry_analysis && onContinue && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={onContinue}
                                >
                                    Continue to Historical Analysis
                                </Button>
                            )}
                        </Stack>
                    </Paper>
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
                    Values After Phase 2: Industry Analysis
                </Typography>
            </Box>
        </Box>
    );
}; 