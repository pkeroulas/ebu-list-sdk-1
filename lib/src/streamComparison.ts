import { Transport } from '@bisect/bisect-core-ts';
import { IVersion } from './types';

//////////////////////////////////////////////////////////////////////////////

export default class StreamComparison {
    public constructor(private readonly transport: Transport) {}

    public async getAll(): Promise<any> {
        return await this.transport.get('/api/comparisons');
    }

    public async getInfo(comparisonID: string): Promise<any> {
        return await this.transport.get(`/api/comparisons/${comparisonID}`);
    }

    public async delete(comparisonID: string): Promise<any> {
        return await this.transport.del(`/api/comparisons/${comparisonID}`);
    }

    public async postComparison(comparisonID: string, data: any): Promise<any> {
        return await this.transport.post(`/api/comparisons/${comparisonID}`, data);
    }
}
