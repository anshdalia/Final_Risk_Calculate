import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    TextField,
    Select,
    MenuItem,
    Stack,
    Alert,
    Snackbar,
} from '@mui/material';
import { InitialInputFormData } from '../types';

interface Props {
    onSubmit: (data: InitialInputFormData) => Promise<void>;
}

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const InitialInputForm: React.FC<Props> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<InitialInputFormData>({
        revenue: '',
        employees: '',
        industry: '',
        location: '',
        additional_factors: []
    });
    const [riskFactors, setRiskFactors] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.industry || !formData.location || !formData.revenue || !formData.employees || !riskFactors) {
            setToast({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error'
            });
            return;
        }

        // Convert string inputs to appropriate types and format risk factors
        const formattedData = {
            ...formData,
            revenue: parseFloat(formData.revenue),
            employees: parseInt(formData.employees),
            additional_factors: riskFactors.split('\n').filter(factor => factor.trim() !== '')
        };

        setIsLoading(true);
        try {
            await onSubmit(formattedData);
            setToast({
                open: true,
                message: 'Input submitted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Submission error:', error);
            setToast({
                open: true,
                message: 'Error submitting input: ' + (error instanceof Error ? error.message : 'Unknown error'),
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 600, p: 2 }}>
            <Stack spacing={3}>
                <FormControl required>
                    <FormLabel>Annual Revenue (USD)</FormLabel>
                    <TextField
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        placeholder="Enter annual revenue"
                        fullWidth
                        required
                    />
                </FormControl>

                <FormControl required>
                    <FormLabel>Number of Employees</FormLabel>
                    <TextField
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                        placeholder="Enter number of employees"
                        fullWidth
                        required
                    />
                </FormControl>

                <FormControl required>
                    <FormLabel>Industry</FormLabel>
                    <TextField
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="Enter industry"
                        fullWidth
                        required
                    />
                </FormControl>

                <FormControl required>
                    <FormLabel>State</FormLabel>
                    <Select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        displayEmpty
                        fullWidth
                        required
                    >
                        <MenuItem value="" disabled>Select state</MenuItem>
                        {US_STATES.map((state) => (
                            <MenuItem key={state} value={state}>
                                {state}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl required>
                    <FormLabel>Initial Risk Factors</FormLabel>
                    <TextField
                        value={riskFactors}
                        onChange={(e) => setRiskFactors(e.target.value)}
                        placeholder="Enter risk factors (one per line)"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        helperText="Enter each risk factor on a new line"
                    />
                </FormControl>

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    fullWidth
                >
                    Submit Initial Assessment
                </Button>
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
        </Box>
    );
}; 