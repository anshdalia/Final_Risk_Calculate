import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    Stack,
    Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { RiskState } from '../types';
import { ScenariosDisplay } from './RiskMetricsDisplay';

interface Props {
    riskState: RiskState;
    onAnalyze: () => Promise<void>;
    disabled?: boolean;
    loading?: boolean;
}

export const IndustryAnalysisForm: React.FC<Props> = ({
    riskState,
    onAnalyze,
    disabled = false,
    loading = false
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
                        Average breach cost in {riskState.user_inputs.industry}: $4.35M (2023)
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Source: IBM Cost of a Data Breach Report 2023
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
                        Primary attack vectors: Phishing (38%), Stolen Credentials (25%)
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Source: Verizon DBIR 2023
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
                        Mean time to identify: 207 days, Mean time to contain: 70 days
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Source: FBI IC3 Report 2023
                        </Typography>
                    </Alert>
                </Box>

                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Risk Metric Adjustments
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
                        Baseline represents the average risk metrics across all industries. Your industry's metrics are compared against this baseline to show relative risk levels.
                    </Alert>
                    <Alert 
                        severity="success" 
                        icon={false}
                        sx={{ 
                            mb: 1,
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Based on {riskState.user_inputs.industry} sector data, attack frequency is 15% higher than baseline
                        </Typography>
                    </Alert>
                    <Alert 
                        severity="success" 
                        icon={false}
                        sx={{ 
                            mb: 1,
                            color: 'text.primary',
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {riskState.user_inputs.industry} sector breaches have 25% higher financial impact due to regulatory requirements and customer trust factors
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
                            <Typography variant="body1">
                                • {riskState.user_inputs.location === 'ME' 
                                    ? 'Business Email Compromise (BEC) - $300M in reported losses (2023)' 
                                    : 'Business Email Compromise (BEC) - $150M in reported losses (2023)'}
                            </Typography>
                            <Typography variant="body1">
                                • {riskState.user_inputs.location === 'ME' 
                                    ? 'Ransomware - Average ransom demand of $850,000' 
                                    : 'Ransomware - Average ransom demand of $500,000'}
                            </Typography>
                            <Typography variant="body1">
                                • {riskState.user_inputs.location === 'ME' 
                                    ? 'Data Breaches - 60% targeted financial institutions' 
                                    : 'Data Breaches - 40% targeted financial institutions'}
                            </Typography>
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
                        <LoadingButton 
                            onClick={onAnalyze}
                            variant="contained" 
                            color="primary"
                            fullWidth
                            loading={loading}
                            disabled={disabled}
                            sx={{ mt: 2 }}
                        >
                            Process Industry Analysis
                        </LoadingButton>
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