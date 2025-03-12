import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { RiskState, Scenario } from '../types';
import { ScenariosDisplay } from './RiskMetricsDisplay';

interface Props {
    questions: string[];
    riskState?: RiskState;  // Make riskState optional
    onSubmit: (answers: { [key: string]: string }) => void;
    disabled?: boolean;
}

export const DynamicQuestionsForm: React.FC<Props> = ({
    questions,
    riskState,
    onSubmit,
    disabled = false
}) => {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });

    console.log('Questions prop in DynamicQuestionsForm:', questions);
    console.log('RiskState in DynamicQuestionsForm:', riskState);
    console.log('Risk State:', riskState);
    console.log('Scenarios:', riskState?.scenarios);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all questions are answered
        const unansweredQuestions = questions.filter(q => !answers[q] || answers[q].trim() === '');
        if (unansweredQuestions.length > 0) {
            setToast({
                open: true,
                message: 'Please answer all questions',
                severity: 'warning'
            });
            return;
        }
        
        setIsLoading(true);
        try {
            await onSubmit(answers);
            setToast({
                open: true,
                message: 'Answers submitted successfully',
                severity: 'success'
            });
        } catch (error) {
            setToast({
                open: true,
                message: 'Error submitting answers',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [question]: value
        }));
    };

    if (questions.length === 0) {
        return <Typography>No questions available</Typography>;
    }

    const formatMetricValue = (value: number) => value?.toFixed(3) ?? 'N/A';
    const formatCurrencyValue = (value: number) => value ? `$${value.toLocaleString()}` : 'N/A';

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            {/* Top Section - Scenarios and Questions side by side */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Left Side - Scenarios */}
                <Grid item xs={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Risk Scenarios</Typography>
                        {riskState?.scenarios && (
                            <ScenariosDisplay 
                                scenarios={riskState.scenarios} 
                                selectedScenario={riskState.selected_scenario}
                            />
                        )}
                    </Paper>
                </Grid>

                {/* Right Side - Questions */}
                <Grid item xs={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Dynamic Questions</Typography>
                        <form onSubmit={handleSubmit}>
                            {questions.map((question, index) => (
                                <TextField
                                    key={index}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label={`Question ${index + 1}`}
                                    placeholder={question}
                                    value={answers[question] || ''}
                                    onChange={(e) => handleAnswerChange(question, e.target.value)}
                                    sx={{ mb: 2 }}
                                    disabled={disabled || isLoading}
                                />
                            ))}
                            <LoadingButton 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                fullWidth
                                loading={isLoading}
                                disabled={disabled}
                            >
                                Submit Answers
                            </LoadingButton>
                        </form>
                    </Paper>
                </Grid>
            </Grid>

            {/* Values Title */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 500, mb: 4 }}>
                Values After Phase 1: Initial Input
            </Typography>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setToast(prev => ({ ...prev, open: false }))} 
                    severity={toast.severity}
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}; 