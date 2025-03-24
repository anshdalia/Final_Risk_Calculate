import React from 'react';
import {
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Stack,
    LinearProgress,
    Paper,
    TableContainer,
    Alert,
} from '@mui/material';
import DangerousIcon from '@mui/icons-material/Dangerous';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import { 
    RiskMetrics, 
    RiskMetric, 
    Scenario, 
    PrimaryLossEventFrequency, 
    SecondaryLossEventFrequency, 
    LossMagnitude 
} from '../types';

interface Props {
    metrics: RiskMetrics;
    scenarios: Array<Scenario>;
    selectedScenario: Scenario;
    showScenarios?: boolean;
    showMetrics?: boolean;
}

const formatValue = (value: number, isCurrency: boolean = false): string => {
    if (isCurrency) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    return value.toFixed(2);
};

const MetricRow: React.FC<{ 
    label: string; 
    metric: RiskMetric;
    isCurrency?: boolean;
}> = ({ label, metric, isCurrency = false }) => (
    <TableRow>
        <TableCell sx={{ width: '30%' }}>{label}</TableCell>
        <TableCell align="right" sx={{ width: '17%' }}>{formatValue(metric.min, isCurrency)}</TableCell>
        <TableCell align="right" sx={{ width: '17%' }}>{formatValue(metric.likely, isCurrency)}</TableCell>
        <TableCell align="right" sx={{ width: '17%' }}>{formatValue(metric.max, isCurrency)}</TableCell>
        <TableCell sx={{ width: '19%' }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <LinearProgress
                    variant="determinate"
                    value={metric.confidence * 100}
                    sx={{
                        width: 100,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: metric.confidence > 0.7 ? '#4caf50' : metric.confidence > 0.4 ? '#ffeb3b' : '#f44336'
                        }
                    }}
                />
                <Typography variant="body2">{(metric.confidence * 100).toFixed(0)}%</Typography>
            </Stack>
        </TableCell>
    </TableRow>
);

const MetricSection: React.FC<{
    title: string;
    metrics: PrimaryLossEventFrequency | SecondaryLossEventFrequency | LossMagnitude;
    isCurrency?: boolean;
}> = ({ title, metrics, isCurrency = false }) => (
    <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: '30%' }}>Metric</TableCell>
                        <TableCell align="right" sx={{ width: '17%' }}>Min</TableCell>
                        <TableCell align="right" sx={{ width: '17%' }}>Likely</TableCell>
                        <TableCell align="right" sx={{ width: '17%' }}>Max</TableCell>
                        <TableCell sx={{ width: '19%' }}>Confidence</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(metrics).map(([key, metric]) => (
                        <MetricRow
                            key={key}
                            label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            metric={metric}
                            isCurrency={isCurrency}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
);

export interface ScenariosDisplayProps {
    scenarios: Array<Scenario>;
    selectedScenario: Scenario;
}

export const ScenariosDisplay: React.FC<ScenariosDisplayProps> = ({ scenarios, selectedScenario }) => (
    <Stack spacing={2}>
        {scenarios.map((scenario, index) => (
            <Paper 
                key={index} 
                sx={{ 
                    p: 2,
                    border: scenario.description === selectedScenario.description ? 2 : 0,
                    borderColor: 'primary.main'
                }}
            >
                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {scenario.severity_level === 'HIGH' ? (
                            <DangerousIcon sx={{ color: 'error.main', mr: 1 }} />
                        ) : scenario.severity_level === 'MEDIUM' ? (
                            <WarningAmberIcon sx={{ color: 'warning.main', mr: 1 }} />
                        ) : (
                            <SecurityIcon sx={{ color: 'info.main', mr: 1 }} />
                        )}
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700,
                                color: 'text.primary',
                                fontSize: '1.1rem'
                            }}
                        >
                            Scenario {index + 1}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        {scenario.description}
                    </Typography>
                    <Alert 
                        severity={
                            scenario.severity_level === 'HIGH' ? 'error' :
                            scenario.severity_level === 'MEDIUM' ? 'warning' : 'info'
                        } 
                        icon={false}
                        sx={{ 
                            mt: 1,
                            '& .MuiAlert-message': { p: 0 }
                        }}
                    >
                        Severity Level: {scenario.severity_level}
                    </Alert>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Potential Impact: {scenario.potential_impact}
                    </Typography>
                </Box>
            </Paper>
        ))}
    </Stack>
);

export const RiskMetricsDisplay: React.FC<Props> = ({ 
    metrics, 
    scenarios, 
    selectedScenario,
    showScenarios = true,
    showMetrics = true
}) => {
    return (
        <Stack spacing={3} sx={{ width: '100%' }}>
            {showScenarios && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Risk Scenarios</Typography>
                    <ScenariosDisplay scenarios={scenarios} selectedScenario={selectedScenario} />
                </Box>
            )}

            {showMetrics && (
                <>
                    <MetricSection
                        title="Primary Loss Event Frequency"
                        metrics={{
                            threat_event_frequency: metrics.primary_loss_event_frequency.threat_event_frequency,
                            vulnerability: metrics.primary_loss_event_frequency.vulnerability,
                        }}
                        isCurrency={false}
                    />

                    <MetricSection
                        title="Secondary Loss Event Frequency"
                        metrics={{
                            SLEF: metrics.secondary_loss_event_frequency.SLEF,
                        }}
                        isCurrency={false}
                    />

                    <MetricSection
                        title="Primary Loss Magnitude"
                        metrics={metrics.primary_loss_magnitude}
                        isCurrency={true}
                    />

                    <MetricSection
                        title="Secondary Loss Magnitude"
                        metrics={metrics.secondary_loss_magnitude}
                        isCurrency={true}
                    />
                </>
            )}
        </Stack>
    );
}; 