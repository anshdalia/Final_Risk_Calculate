import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    TextField,
    Stack,
    Typography,
    Alert,
    Snackbar,
    Paper,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface Props {
    questions: string[];
    onSubmit: (answers: { [key: string]: string }) => void;
    disabled?: boolean;
    initialValues?: { [key: string]: string };
}

export const DynamicQuestionsForm: React.FC<Props> = ({ 
    questions, 
    onSubmit, 
    disabled = false,
    initialValues = {} 
}) => {
    const [answers, setAnswers] = useState<{ [key: string]: string }>(initialValues);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

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

    const handleAnswerChange = (question: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [question]: answer
        }));
    };

    if (questions.length === 0) {
        return <Typography>No questions available</Typography>;
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Dynamic Questions
            </Typography>
            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    {questions.map((question, index) => (
                        <TextField
                            key={index}
                            label={question}
                            value={answers[question] || ''}
                            onChange={(e) => handleAnswerChange(question, e.target.value)}
                            multiline
                            rows={2}
                            required
                            disabled={disabled}
                        />
                    ))}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        disabled={disabled}
                        loading={isLoading}
                    >
                        Submit Answers
                    </LoadingButton>
                </Stack>
            </form>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
            >
                <Alert severity={toast.severity as 'success' | 'error' | 'warning'} onClose={() => setToast({ ...toast, open: false })}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
}; 