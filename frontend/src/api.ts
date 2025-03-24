import axios from 'axios';
import { InitialInputFormData, RiskState } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    submitInitialInput: async (data: InitialInputFormData): Promise<RiskState> => {
        const response = await axios.post(`${API_BASE_URL}/initial-input`, data);
        return response.data;
    },

    submitQuestionAnswers: async (answers: { [key: string]: string }): Promise<RiskState> => {
        const response = await axios.post(`${API_BASE_URL}/dynamic-questions`, { answers });
        return response.data;
    },

    processIndustryAnalysis: async (): Promise<RiskState> => {
        const response = await axios.post(`${API_BASE_URL}/industry-analysis`);
        return response.data;
    },

    getCurrentState: async (): Promise<RiskState> => {
        const response = await axios.get(`${API_BASE_URL}/current-state`);
        return response.data;
    }
}; 