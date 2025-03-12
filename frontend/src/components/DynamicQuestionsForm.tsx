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
} from '@mui/material';

interface Props {
    questions: string[];
    onSubmit: (answers: { [key: string]: string }) => Promise<void>;
}

export const DynamicQuestionsForm: React.FC<Props> = ({ questions, onSubmit }) => {
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
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
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 600, p: 2 }}>
            <Stack spacing={3}>
                {questions.map((question, index) => (
                    <FormControl key={index} required>
                        <FormLabel>
                            {index + 1}. {question}
                        </FormLabel>
                        <TextField
                            value={answers[question] || ''}
                            onChange={(e) => handleAnswerChange(question, e.target.value)}
                            placeholder="Enter your answer"
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </FormControl>
                ))}

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    fullWidth
                >
                    Submit Answers
                </Button>
            </Stack>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
            >
                <Alert severity={toast.severity as 'success' | 'error' | 'warning'} onClose={() => setToast({ ...toast, open: false })}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}; 