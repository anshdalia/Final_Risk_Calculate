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
import { InitialInputForm } from './components/InitialInputForm';
import { DynamicQuestionsForm } from './components/DynamicQuestionsForm';
import { IndustryAnalysisForm } from './components/IndustryAnalysisForm';
import { RiskMetricsDisplay } from './components/RiskMetricsDisplay';
import { Summary } from './components/Summary';
import { api } from './api';
import { RiskState } from './types';

const steps = [
    'Initial Input',
    'Dynamic Questions',
    'Industry Analysis',
    'Summary'
];

const maxSteps = 4;  // Updated to 4 steps

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

    const handleContinueToSummary = () => {
        setActiveStep(3);
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
                            key={step} 
                            completed={completedSteps.includes(index)}
                            onClick={() => handleStepClick(index)}
                            sx={{ cursor: canNavigateToStep(index) ? 'pointer' : 'default' }}
                        >
                            <StepLabel>
                                <Typography variant="subtitle1">{step}</Typography>
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
                            onContinue={handleContinueToSummary}
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
                    <Summary riskState={riskState} />
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