import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Stepper,
    Step,
    StepLabel,
    Alert,
    Snackbar,
    Paper,
    Stack,
} from '@mui/material';
import { InitialInputForm } from './components/InitialInputForm';
import { DynamicQuestionsForm } from './components/DynamicQuestionsForm';
import { RiskMetricsDisplay } from './components/RiskMetricsDisplay';
import { api } from './api';
import { RiskState } from './types';

const steps = [
    { title: 'Initial Input', description: 'Basic organization information' },
    { title: 'Dynamic Questions', description: 'Scenario-specific questions' },
    { title: 'Industry Analysis', description: 'Analysis of industry trends' },
    { title: 'Historical Analysis', description: 'Historical data analysis' },
];

function App() {
    const [riskState, setRiskState] = useState<RiskState | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const canNavigateToStep = (step: number) => {
        if (!riskState) return step === 0;
        return step <= Math.min(activeStep, 4);
    };

    const handleStepClick = (step: number) => {
        if (canNavigateToStep(step)) {
            setActiveStep(step);
        }
    };

    const handleInitialSubmit = async (data: any) => {
        try {
            const result = await api.submitInitialInput(data);
            console.log('Received state from backend:', {
                scenarios: result.scenarios,
                selectedScenario: result.selected_scenario
            });
            setRiskState(result);
            setActiveStep(1);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing initial input',
                severity: 'error'
            });
        }
    };

    const handleQuestionsSubmit = async (answers: { [key: string]: string }) => {
        try {
            const result = await api.submitQuestionAnswers(answers);
            setRiskState(result);
            setActiveStep(2);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing answers',
                severity: 'error'
            });
        }
    };

    const handleIndustryAnalysis = async () => {
        try {
            const result = await api.processIndustryAnalysis();
            setRiskState(result);
            setActiveStep(3);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing industry analysis',
                severity: 'error'
            });
        }
    };

    const handleHistoricalAnalysis = async () => {
        try {
            const result = await api.processHistoricalAnalysis();
            setRiskState(result);
            setActiveStep(4);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing historical analysis',
                severity: 'error'
            });
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={4}>
                <Typography variant="h3" component="h1">
                    Cybersecurity Risk Assessment
                </Typography>
                
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((step, index) => (
                        <Step 
                            key={step.title} 
                            completed={canNavigateToStep(index + 1)}
                            onClick={() => handleStepClick(index)}
                            sx={{ cursor: canNavigateToStep(index) ? 'pointer' : 'default' }}
                        >
                            <StepLabel>
                                <Typography variant="subtitle1">{step.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <InitialInputForm onSubmit={handleInitialSubmit} />
                )}

                {activeStep === 1 && riskState && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3 }}>
                            <RiskMetricsDisplay 
                                metrics={riskState.risk_metrics} 
                                scenarios={riskState.scenarios}
                                selectedScenario={riskState.selected_scenario}
                                showMetrics={false}
                            />
                        </Paper>
                        <DynamicQuestionsForm
                            questions={riskState.dynamic_questions}
                            onSubmit={handleQuestionsSubmit}
                        />
                        <Paper sx={{ p: 3 }}>
                            <RiskMetricsDisplay 
                                metrics={riskState.risk_metrics} 
                                scenarios={riskState.scenarios}
                                selectedScenario={riskState.selected_scenario}
                                showScenarios={false}
                            />
                        </Paper>
                    </Stack>
                )}

                {activeStep === 2 && riskState && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3 }}>
                            <RiskMetricsDisplay 
                                metrics={riskState.risk_metrics} 
                                scenarios={riskState.scenarios}
                                selectedScenario={riskState.selected_scenario}
                            />
                        </Paper>
                        <Button
                            variant="contained"
                            onClick={handleIndustryAnalysis}
                            fullWidth
                            sx={{ maxWidth: 600, mx: 'auto' }}
                        >
                            Process Industry Analysis
                        </Button>
                    </Stack>
                )}

                {activeStep === 3 && riskState && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3 }}>
                            <RiskMetricsDisplay 
                                metrics={riskState.risk_metrics} 
                                scenarios={riskState.scenarios}
                                selectedScenario={riskState.selected_scenario}
                            />
                        </Paper>
                        <Button
                            variant="contained"
                            onClick={handleHistoricalAnalysis}
                            fullWidth
                            sx={{ maxWidth: 600, mx: 'auto' }}
                        >
                            Process Historical Analysis
                        </Button>
                    </Stack>
                )}

                {activeStep === 4 && riskState && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3 }}>
                            <RiskMetricsDisplay 
                                metrics={riskState.risk_metrics} 
                                scenarios={riskState.scenarios}
                                selectedScenario={riskState.selected_scenario}
                            />
                        </Paper>
                        
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Remediation Suggestions
                            </Typography>
                            <Stack spacing={1}>
                                {riskState.remediation_suggestions.map((suggestion, index) => (
                                    <Typography key={index}>• {suggestion}</Typography>
                                ))}
                            </Stack>
                        </Paper>

                        {riskState.historical_analysis && (
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Historical Analysis
                                </Typography>
                                <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(riskState.historical_analysis, null, 2)}
                                </Typography>
                            </Paper>
                        )}
                    </Stack>
                )}
            </Stack>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
            >
                <Alert severity={toast.severity as 'success' | 'error'} onClose={() => setToast({ ...toast, open: false })}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default App; 