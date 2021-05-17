import { Transport } from '@bisect/bisect-core-ts';
import { IDownloadManagerData } from './api/downloadManager';

// ////////////////////////////////////////////////////////////////////////////

export default class DownloadManager {
    public constructor(private readonly transport: Transport) {}

    public async getAll(): Promise<IDownloadManagerData> {
        const response = await this.transport.get(`/api/downloadmngr`);
        const downloadManagerData: IDownloadManagerData = response;
        return downloadManagerData;
    }

    public async download(id: string): Promise<any> {
        const response = await this.transport.download(`/api/downloadmngr/download/${id}`);
        return response;
    }
}
