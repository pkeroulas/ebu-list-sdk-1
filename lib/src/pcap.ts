import { Transport } from '@bisect/bisect-core-ts';
import { IPcapUploadResult, UploadProgressCallback } from './types';
import { IPcapInfo, IStreamInfo } from './api/pcap';

// ////////////////////////////////////////////////////////////////////////////

export default class Pcap {
    public constructor(private readonly transport: Transport) {}

    public async getAll(): Promise<IPcapInfo[]> {
        const response = await this.transport.get('/api/pcap');
        const pcaps: IPcapInfo[] = response as IPcapInfo[];
        return pcaps;
    }

    public async getInfo(pcapId: string): Promise<IPcapInfo> {
        return this.transport.get(`/api/pcap/${pcapId}`);
    }

    public async del(pcapId: string): Promise<void> {
        await this.transport.del(`/api/pcap/${pcapId}`);
    }

    public async getStreams(pcapId: string): Promise<IStreamInfo[]> {
        const response = await this.transport.get(`/api/pcap/${pcapId}/streams/`);
        const streams: IStreamInfo[] = response as IStreamInfo[];
        return streams;
    }

    // name: the name that will show up on LIST
    // stream: e.g. fs.createReadStream(path)
    public async upload(name: string, stream: any, callback: UploadProgressCallback): Promise<IPcapUploadResult> {
        const result = await this.transport.putForm(
            '/api/pcap',
            [
                { name: 'pcap', value: stream },
                { name: 'originalFilename', value: name },
            ],
            callback
        );

        return result as IPcapUploadResult;
    }

    public async downloadPcap(pcapId: string): Promise<any> {
        const result = await this.transport.download(`/api/pcap/${pcapId}/download`);
        return result;
    }

    public async downloadSdp(pcapId: string): Promise<any> {
        const result = await this.transport.download(`/api/pcap/${pcapId}/sdp`);
        return result;
    }

    public async downloadJson(pcapId: string): Promise<any> {
        const result = await this.transport.download(`/api/pcap/${pcapId}/report?type=json`);
        return result;
    }

    public async getDownloads(): Promise<any> {
        const result = await this.transport.get(`/api/downloadmngr`);
        return result;
    }

    public async createWorkflow(info: any): Promise<any> {
        console.log('pcap api', info);
        const result = await this.transport.post(`/api/workflow/`, info);
        return result;
    }

    public async cancelWorkflow(info: any): Promise<any> {
        const result = await this.transport.putForm(`/api/workflow/`, info);
        return result;
    }

    public async getWorkflows(): Promise<any> {
        const result = await this.transport.get(`/api/workflow/`);
        return result;
    }
}
