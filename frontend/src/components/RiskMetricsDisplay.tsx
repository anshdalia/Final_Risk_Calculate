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
    scenarios: Array<{ description: string }>;
    selectedScenario: {
        description: string;
        risk_level: string;
        potential_impact: string;
    };
}

const MetricRow: React.FC<{ label: string; metric: RiskMetric }> = ({ label, metric }) => (
    <TableRow>
        <TableCell>{label}</TableCell>
        <TableCell align="right">{metric.min.toFixed(2)}</TableCell>
        <TableCell align="right">{metric.likely.toFixed(2)}</TableCell>
        <TableCell align="right">{metric.max.toFixed(2)}</TableCell>
        <TableCell>
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
}> = ({ title, metrics }) => (
    <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Min</TableCell>
                        <TableCell align="right">Likely</TableCell>
                        <TableCell align="right">Max</TableCell>
                        <TableCell>Confidence</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(metrics).map(([key, metric]) => (
                        <MetricRow
                            key={key}
                            label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            metric={metric}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
);

const ScenariosDisplay: React.FC<{
    scenarios: Array<{ description: string }>;
    selectedScenario: {
        description: string;
        risk_level: string;
        potential_impact: string;
    };
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
                    {scenario.description === selectedScenario.description && (
                        <>
                            <Alert severity={
                                selectedScenario.risk_level === 'HIGH' ? 'error' :
                                selectedScenario.risk_level === 'MEDIUM' ? 'warning' : 'info'
                            } sx={{ mt: 1 }}>
                                Risk Level: {selectedScenario.risk_level}
                            </Alert>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Potential Impact: {selectedScenario.potential_impact}
                            </Typography>
                        </>
                    )}
                </Paper>
            ))}
        </Stack>
    </Box>
);

export const RiskMetricsDisplay: React.FC<Props> = ({ metrics, scenarios, selectedScenario }) => {
    return (
        <Stack spacing={3} sx={{ width: '100%' }}>
            <ScenariosDisplay scenarios={scenarios} selectedScenario={selectedScenario} />

            <MetricSection
                title="Primary Loss Event Frequency"
                metrics={{
                    threat_event_frequency: metrics.primary_loss_event_frequency.threat_event_frequency,
                    vulnerability: metrics.primary_loss_event_frequency.vulnerability,
                }}
            />

            <MetricSection
                title="Secondary Loss Event Frequency"
                metrics={{
                    SLEF: metrics.secondary_loss_event_frequency.SLEF,
                }}
            />

            <MetricSection
                title="Primary Loss Magnitude"
                metrics={metrics.primary_loss_magnitude}
            />

            <MetricSection
                title="Secondary Loss Magnitude"
                metrics={metrics.secondary_loss_magnitude}
            />
        </Stack>
    );
}; 