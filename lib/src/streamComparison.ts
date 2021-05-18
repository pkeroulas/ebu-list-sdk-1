import { Transport } from '@bisect/bisect-core-ts';
import { IVersion } from './types';

//////////////////////////////////////////////////////////////////////////////

export default class StreamComparison {
    public constructor(private readonly transport: Transport) {}

    public async getAll(): Promise<any> {
        const response = await this.transport.get('/api/comparisons');
        return response;
    }

    public async getInfo(comparisonID: string): Promise<any> {
        const response = await this.transport.get(`/api/comparisons/${comparisonID}`);
        return response;
    }

    public async delete(comparisonID: string): Promise<any> {
        const response = await this.transport.del(`/api/comparisons/${comparisonID}`);
        return response;
    }

    public async postComparison(comparisonID: string, data: any): Promise<any> {
        const response = await this.transport.post(`/api/comparisons/${comparisonID}`, data);
        return response;
    }
}
