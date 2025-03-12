import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Alert,
    Chip,
    Tooltip,
    IconButton,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import InfoIcon from '@mui/icons-material/Info';
import { RiskState } from '../types';
import { ScenariosDisplay } from './RiskMetricsDisplay';

interface Props {
    riskState: RiskState;
    onAnalyze: () => Promise<void>;
    disabled?: boolean;
    loading?: boolean;
}

export const HistoricalAnalysisForm: React.FC<Props> = ({
    riskState,
    onAnalyze,
    disabled = false,
    loading = false,
}) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    const renderSimilarIncidents = () => {
        if (!riskState.historical_analysis?.similar_incidents?.length) {
            return (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Click "Process Historical Analysis" to find similar historical incidents.
                </Alert>
            );
        }

        return (
            <Box>
                <Stack spacing={3}>
                    {riskState.historical_analysis.similar_incidents.map((incident, index) => (
                        <Paper key={index} elevation={2} sx={{ p: 2 }}>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {incident.event_type}
                                    </Typography>
                                    <Chip
                                        label={`${(incident.similarity_score * 100).toFixed(0)}% Match`}
                                        color={incident.similarity_score > 0.7 ? "success" : 
                                              incident.similarity_score > 0.4 ? "warning" : "error"}
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {formatDate(incident.date)} | {incident.industry}
                                </Typography>
                                <Typography variant="body1">
                                    {incident.description}
                                </Typography>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Similarity Score Components:
                    </Typography>
                    <Tooltip title="30% Industry Match + 40% Description Similarity + 20% Recency + 10% Company Size">
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        );
    };

    const renderAnalysisSummary = () => {
        if (!riskState.historical_analysis?.summary) return null;

        const { summary } = riskState.historical_analysis;
        const { risk_adjustments } = riskState.historical_analysis;
        
        return (
            <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Analysis Summary
                </Typography>
                <Alert 
                    severity="info"
                    icon={false}
                    sx={{ 
                        backgroundColor: 'transparent',
                        color: 'text.primary',
                        '& .MuiAlert-message': { p: 0 }
                    }}
                >
                    <Stack spacing={1}>
                        <Typography>
                            • Total similar incidents found: {summary.total_matches}
                        </Typography>
                        <Typography>
                            • Most common event type: {summary.most_common_type}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Risk Adjustments:
                            </Typography>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>
                                        • Frequency Factor: {risk_adjustments?.frequency_factor.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="How often similar incidents occur relative to baseline. Values less than 1 indicate rarer occurrences, greater than 1 indicate more frequent occurrences.">
                                        <IconButton size="small" sx={{ ml: 1 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>
                                        • Magnitude Factor: {risk_adjustments?.magnitude_factor.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="How the financial impact compares to baseline. A value of 2.0 means twice the typical impact, 0.5 means half the typical impact.">
                                        <IconButton size="small" sx={{ ml: 1 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>
                                        • Confidence: {(risk_adjustments?.confidence * 100).toFixed(0)}%
                                    </Typography>
                                    <Tooltip title="How confident we are in these adjustments based on the similarity of historical incidents found. Higher percentages indicate more reliable adjustments.">
                                        <IconButton size="small" sx={{ ml: 1 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Alert>
            </Stack>
        );
    };

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
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

                {/* Right Side - Historical Analysis */}
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
                                Similar Historical Incidents
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Alert 
                                severity="info" 
                                sx={{ 
                                    mb: 3,
                                    backgroundColor: 'rgba(0, 127, 255, 0.05)',
                                    '& .MuiAlert-message': { width: '100%' }
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    How are similar events identified?
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    We analyze over 14,000 historical cyber incidents from two databases: the UMD Cyber Events Database 
                                    and our proprietary incident database. The top 3 most similar incidents are selected based on a 
                                    weighted scoring system:
                                </Typography>
                                <Stack spacing={0.5}>
                                    <Typography variant="body2">
                                        • 40% - Description similarity using advanced text analysis
                                    </Typography>
                                    <Typography variant="body2">
                                        • 30% - Industry match (exact matches score higher)
                                    </Typography>
                                    <Typography variant="body2">
                                        • 20% - Incident recency (newer incidents are weighted higher)
                                    </Typography>
                                    <Typography variant="body2">
                                        • 10% - Organization size similarity
                                    </Typography>
                                </Stack>
                            </Alert>
                            {renderSimilarIncidents()}
                            {riskState.historical_analysis && renderAnalysisSummary()}
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
                                Process Historical Analysis
                            </LoadingButton>
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
                    Values After Phase 3: Historical Analysis
                </Typography>
            </Box>
        </Box>
    );
}; 