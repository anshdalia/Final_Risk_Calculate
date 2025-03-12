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
import { RiskMetrics, RiskMetric } from '../types';

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
    metrics: { [key: string]: RiskMetric };
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

const ScenariosDisplay: React.FC<{
    scenarios: Array<Scenario>;
    selectedScenario: Scenario;
}> = ({ scenarios, selectedScenario }) => (
    <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Risk Scenarios</Typography>
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
                    <Typography variant="subtitle1">
                        Scenario {index + 1}:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        {scenario.description}
                    </Typography>
                    <Alert severity={
                        scenario.severity_level === 'HIGH' ? 'error' :
                        scenario.severity_level === 'MEDIUM' ? 'warning' : 'info'
                    } sx={{ mt: 1 }}>
                        Severity Level: {scenario.severity_level}
                    </Alert>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Potential Impact: {scenario.potential_impact}
                    </Typography>
                </Paper>
            ))}
        </Stack>
    </Box>
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
                <ScenariosDisplay scenarios={scenarios} selectedScenario={selectedScenario} />
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