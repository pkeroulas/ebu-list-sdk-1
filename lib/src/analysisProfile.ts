import { Transport } from '@bisect/bisect-core-ts';
import { IAnalysisProfile } from './api/pcap';

// ////////////////////////////////////////////////////////////////////////////

export default class AnalysisProfile {
    public constructor(private readonly transport: Transport) {}

    public async getInfo(): Promise<IAnalysisProfile> {
        const response = await this.transport.get(`/api/analysis_profile`);
        const allAnalysisProfiles: IAnalysisProfile = response;
        return allAnalysisProfiles;
    }

    public async setDefaultProfile(id: string): Promise<any> {
        const response = await this.transport.put(`/api/analysis_profile/default`, { id });
        return response;
    }
}
