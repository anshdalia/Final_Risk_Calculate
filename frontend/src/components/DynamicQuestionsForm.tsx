import React, { useState, useEffect } from 'react';
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

    // Log only when questions or riskState changes
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('DynamicQuestionsForm State:', {
                questions,
                riskState,
                riskStatement: riskState?.risk_statement
            });
        }
    }, [questions, riskState]);

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
            {/* Formalized Risk Statement Card */}
            <Paper sx={{ p: 3, mb: 4 }}>
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
                        Formalized Risk Statement (ISO 27001)
                    </Typography>
                </Box>
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                    {riskState?.risk_statement || 'No risk statement available'}
                </Typography>
            </Paper>

            {/* Top Section - Scenarios and Questions side by side */}
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
                        <Alert 
                            severity="warning" 
                            icon={false}
                            sx={{ 
                                mb: 2,
                                backgroundColor: '#f5f5f5',  // Light gray background
                                color: '#424242',  // Dark gray text
                                border: '1px solid #e0e0e0', // Light gray border
                                '& .MuiAlert-message': { p: 0 }
                            }}
                        >
                            We are analyzing the highest risk scenario to provide a comprehensive risk assessment. This scenario represents the most severe potential impact on your organization.
                        </Alert>
                        {riskState?.scenarios && (
                            <Box sx={{ flexGrow: 1 }}>
                                <ScenariosDisplay 
                                    scenarios={riskState.scenarios} 
                                    selectedScenario={riskState.selected_scenario}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Right Side - Questions */}
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
                                Security Assessment Questions
                            </Typography>
                        </Box>
                        <form onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                {questions.map((question, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                fontWeight: 'bold',
                                                mb: 1,
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            {question}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={1}
                                            placeholder="Enter your answer here..."
                                            value={answers[question] || ''}
                                            onChange={(e) => handleAnswerChange(question, e.target.value)}
                                            disabled={disabled || isLoading}
                                            size="small"
                                        />
                                    </Box>
                                ))}
                            </Box>
                            <LoadingButton 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                fullWidth
                                loading={isLoading}
                                disabled={disabled}
                                sx={{ mt: 2 }}
                            >
                                Submit Answers
                            </LoadingButton>
                        </form>
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
                    Values After Phase 1: Initial Input
                </Typography>
            </Box>

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