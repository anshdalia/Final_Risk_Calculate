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
    CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { InitialInputForm } from './components/InitialInputForm';
import { DynamicQuestionsForm } from './components/DynamicQuestionsForm';
import { IndustryAnalysisForm } from './components/IndustryAnalysisForm';
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
    const [loading, setLoading] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const canNavigateToStep = (step: number) => {
        if (!riskState) return step === 0;
        return completedSteps.includes(step) || step <= Math.max(...completedSteps, activeStep);
    };

    const handleStepClick = (step: number) => {
        if (canNavigateToStep(step)) {
            setActiveStep(step);
        }
    };

    const handleInitialSubmit = async (data: any) => {
        try {
            setLoading(true);
            const result = await api.submitInitialInput(data);
            console.log('Received state from backend:', {
                scenarios: result.scenarios,
                selectedScenario: result.selected_scenario
            });
            setRiskState(result);
            setActiveStep(1);
            setCompletedSteps([...completedSteps, 0]);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing initial input',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionsSubmit = async (answers: { [key: string]: string }) => {
        try {
            setLoading(true);
            const result = await api.submitQuestionAnswers(answers);
            setRiskState(result);
            setActiveStep(2);
            setCompletedSteps([...completedSteps, 1]);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing answers',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleIndustryAnalysis = async () => {
        try {
            setLoading(true);
            const result = await api.processIndustryAnalysis();
            setRiskState(result);
            setCompletedSteps([...completedSteps, 2]);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing industry analysis',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleHistoricalAnalysis = async () => {
        try {
            setLoading(true);
            const result = await api.processHistoricalAnalysis();
            setRiskState(result);
            setActiveStep(4);
            setCompletedSteps([...completedSteps, 3]);
        } catch (error) {
            console.error('Error:', error);
            setToast({
                open: true,
                message: 'Error processing historical analysis',
                severity: 'error'
            });
        } finally {
            setLoading(false);
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
                            completed={completedSteps.includes(index)}
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
                    <InitialInputForm 
                        onSubmit={handleInitialSubmit}
                        disabled={loading || completedSteps.includes(0)}
                        initialValues={riskState?.user_inputs}
                    />
                )}

                {activeStep === 1 && riskState && (
                    <Stack spacing={3}>
                        {console.log('Dynamic Questions in App:', riskState.dynamic_questions)}
                        <DynamicQuestionsForm
                            questions={riskState.dynamic_questions}
                            riskState={riskState}
                            onSubmit={handleQuestionsSubmit}
                            disabled={loading || completedSteps.includes(1)}
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
                        <IndustryAnalysisForm
                            riskState={riskState}
                            onAnalyze={handleIndustryAnalysis}
                            disabled={completedSteps.includes(2)}
                            loading={loading}
                            onContinue={() => setActiveStep(3)}
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

                {activeStep === 3 && riskState && (
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3 }}>
                            <RiskMetricsDisplay 
                                metrics={riskState.risk_metrics} 
                                scenarios={riskState.scenarios}
                                selectedScenario={riskState.selected_scenario}
                            />
                        </Paper>
                        <LoadingButton
                            loading={loading}
                            variant="contained"
                            onClick={handleHistoricalAnalysis}
                            disabled={completedSteps.includes(3)}
                            fullWidth
                            sx={{ maxWidth: 600, mx: 'auto' }}
                        >
                            Process Historical Analysis
                        </LoadingButton>
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