import { Transport } from '@bisect/bisect-core-ts';
import { IDownloadManagerData } from './api/downloadManager';

// ////////////////////////////////////////////////////////////////////////////

export default class DownloadManager {
    public constructor(private readonly transport: Transport) {}

    public async getAll(): Promise<IDownloadManagerData> {
        return this.transport.get(`/api/downloadmngr`);
    }

    public async download(id: string): Promise<any> {
        return this.transport.download(`/api/downloadmngr/download/${id}`);
    }
}
