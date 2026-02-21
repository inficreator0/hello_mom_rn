import { apiRequest } from '../http';
import { DoctorResponse, DoctorSummaryResponse } from '../../types';

export const doctorsAPI = {
    getAllDoctors: async () => {
        return await apiRequest<DoctorResponse[]>('/doctors', {
            method: 'GET',
        });
    },

    getSummary: async () => {
        return await apiRequest<DoctorSummaryResponse>('/doctors/summary', {
            method: 'GET',
        });
    },
};
