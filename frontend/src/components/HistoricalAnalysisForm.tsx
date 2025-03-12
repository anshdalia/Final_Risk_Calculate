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
    Button,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { RiskState } from '../types';
import { ScenariosDisplay } from './RiskMetricsDisplay';

interface Props {
    riskState: RiskState;
    onAnalyze: () => Promise<void>;
    disabled?: boolean;
    loading?: boolean;
    onNext?: () => void;
}

export const HistoricalAnalysisForm: React.FC<Props> = ({
    riskState,
    onAnalyze,
    disabled = false,
    loading = false,
    onNext
}) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    const renderSimilarIncidents = () => {
        return (
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Similar Historical Incidents
                </Typography>
                {!riskState.historical_analysis?.similar_incidents?.length ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Click "Process Historical Analysis" to find similar historical incidents.
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        {riskState.historical_analysis.similar_incidents.map((incident, index) => (
                            <Paper 
                                key={index} 
                                elevation={2} 
                                sx={{ 
                                    p: 2,
                                    borderLeft: '4px solid',
                                    borderColor: incident.similarity_score > 0.7 ? 'success.main' : 
                                               incident.similarity_score > 0.4 ? 'warning.main' : 'error.main'
                                }}
                            >
                                <Stack spacing={1}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'flex-start'
                                    }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {incident.event_type}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(incident.date)} | {incident.industry}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${(incident.similarity_score * 100).toFixed(0)}% Match`}
                                            color={incident.similarity_score > 0.7 ? "success" : 
                                                  incident.similarity_score > 0.4 ? "warning" : "error"}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            p: 1.5,
                                            borderRadius: 1
                                        }}
                                    >
                                        {incident.description}
                                    </Typography>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Box>
        );
    };

    const renderAnalysisSummary = () => {
        if (!riskState.historical_analysis?.summary) return null;

        const { summary } = riskState.historical_analysis;
        const { risk_adjustments } = riskState.historical_analysis;
        
        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Analysis Results
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Key Findings
                            </Typography>
                            <Stack spacing={0.5}>
                                <Typography variant="body2">
                                    • Found {summary.total_matches} similar incidents
                                </Typography>
                                <Typography variant="body2">
                                    • Most common type: {summary.most_common_type}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Risk Adjustments
                            </Typography>
                            <Stack spacing={0.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2">
                                        • Frequency Factor: {risk_adjustments?.frequency_factor.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="How often similar incidents occur relative to baseline. Values less than 1 indicate rarer occurrences.">
                                        <IconButton size="small" sx={{ ml: 0.5 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2">
                                        • Magnitude Factor: {risk_adjustments?.magnitude_factor.toFixed(2)}
                                    </Typography>
                                    <Tooltip title="Impact multiplier compared to baseline. Higher values indicate greater potential impact.">
                                        <IconButton size="small" sx={{ ml: 0.5 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2">
                                        • Analysis Confidence: {(risk_adjustments?.confidence * 100).toFixed(0)}%
                                    </Typography>
                                    <Tooltip title="Confidence level based on similarity of historical incidents found.">
                                        <IconButton size="small" sx={{ ml: 0.5 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        );
    };

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Left Side - Risk Scenarios */}
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
                                Historical Analysis
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
                                    Threat Event Frequency (TEF) Analysis
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1.5 }}>
                                    We analyze over 14,000 historical cyber incidents from two databases: the UMD Cyber Events Database 
                                    and our proprietary incident database. Note that these represent only reported and documented incidents - 
                                    many cyber events may go unreported or undetected.
                                </Typography>
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        How are similar events identified?
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        The top 3 most similar incidents are selected based on a weighted scoring system:
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
                                </Box>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}>
                                    This analysis helps adjust the TEF based on historical patterns, providing a more accurate 
                                    assessment of incident frequency while acknowledging the limitations of available data.
                                </Typography>
                            </Alert>
                            {renderSimilarIncidents()}
                        </Box>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <LoadingButton
                                    variant="contained"
                                    onClick={onAnalyze}
                                    loading={loading}
                                    disabled={disabled}
                                >
                                    Process Historical Analysis
                                </LoadingButton>
                                
                                {riskState.historical_analysis?.similar_incidents?.length > 0 && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={onNext}
                                        endIcon={<ArrowForwardIcon />}
                                    >
                                        View Summary
                                    </Button>
                                )}
                            </Box>
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