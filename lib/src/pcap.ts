import { Transport } from '@bisect/bisect-core-ts';
import { IPcapUploadResult, UploadProgressCallback } from './types';
import { IPcapInfo, IStreamInfo, PcapFileProcessingDone } from './api/pcap';
import { wsEvents } from './api';
import { IPutEntry } from '@bisect/bisect-core-ts/dist/rest/common';

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

    public async delete(pcapId: string): Promise<void> {
        await this.transport.del(`/api/pcap/${pcapId}`);
    }

    public async getStreams(pcapId: string): Promise<IStreamInfo[]> {
        const response = await this.transport.get(`/api/pcap/${pcapId}/streams/`);
        const streams: IStreamInfo[] = response as IStreamInfo[];
        return streams;
    }

    public makeUploadAwaiter(pcapId: string, timeoutMs: number): Promise<PcapFileProcessingDone | undefined> {
        return this.transport.makeAwaiter<PcapFileProcessingDone | undefined>(
            wsEvents.Pcap.processingDone,
            (data: any) => {
                if (data.id === pcapId) {
                    return data as PcapFileProcessingDone;
                }
                return undefined;
            },
            timeoutMs
        );
    }

    // name: the name that will show up on LIST
    // stream: e.g. fs.createReadStream(path)
    public async upload(
        name: string,
        stream: any,
        callback: UploadProgressCallback,
        pcapId?: string
    ): Promise<IPcapUploadResult> {
        const uploadEntry: IPutEntry[] = [
            { name: 'pcap', value: stream },
            { name: 'originalFilename', value: name },
        ];
        const id = pcapId ? `/?pcapID=${pcapId}` : '';
        const result = await this.transport.putForm(`/api/pcap${id}`, uploadEntry, callback);
        return result as IPcapUploadResult;
    }

    // name: the name that will show up on LIST
    // stream: e.g. fs.createReadStream(path)
    // This is created because we need a new call to only upload a file instead of uploading and analyzing immediatly
    public async onlyInsertInDatabase(
        name: string,
        stream: any,
        callback: UploadProgressCallback,
        pcapId?: string
    ): Promise<IPcapUploadResult> {
        const uploadEntry: IPutEntry[] = [
            { name: 'pcap', value: stream },
            { name: 'originalFilename', value: name },
        ];
        const id = pcapId ? `/?pcapID=${pcapId}` : '';
        const result = await this.transport.putForm(`/api/pcap/upload${id}`, uploadEntry, callback);
        return result as IPcapUploadResult;
    }

    // pcapId: the ID to assign to the pcap in LIST
    // path: the path to the file to upload, as seen from LIST. If LIST is running on a Docker container,
    // it must be the path as it is mapped on the container.
    // name: the name that will show up on LIST
    public async uploadLocal(name: string, path: string, pcapId: string): Promise<unknown> {
        const result = await this.transport.post(`/api/pcap/${pcapId}/local`, {
            path,
            name,
        });
        return result;
    }

    public async reanalyze(pcapId: string): Promise<IPcapUploadResult> {
        const result = await this.transport.put(`/api/pcap/${pcapId}/reanalyze`, null);
        return result as IPcapUploadResult;
    }

    public async patch(pcapId: string, data: unknown): Promise<IPcapUploadResult> {
        const result = await this.transport.patch(`/api/pcap/${pcapId}`, data);
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
}
