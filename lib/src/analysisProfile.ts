import { Transport } from '@bisect/bisect-core-ts';
import { IAnalysisProfile } from './api/pcap';

// ////////////////////////////////////////////////////////////////////////////

export default class AnalysisProfile {
    public constructor(private readonly transport: Transport) {}

    public async getInfo(): Promise<IAnalysisProfile> {
        return this.transport.get(`/api/analysis_profile`);
    }

    public async setDefaultProfile(id: string): Promise<any> {
        return this.transport.put(`/api/analysis_profile/default`, { id });
    }
}
