import { ILiveSource } from './types';
import { PcapFileProcessingDone } from './api/pcap';
import { Transport } from '@bisect/bisect-core-ts';
import { wsEvents, workflows } from './api';

//////////////////////////////////////////////////////////////////////////////

export default class Live {
    public constructor(private readonly transport: Transport) {}

    public async getAllSources(): Promise<ILiveSource[]> {
        const response = await this.transport.get('/api/live/sources');
        const sources: ILiveSource[] = response as ILiveSource[];
        return sources;
    }

    public async addSource(source: ILiveSource): Promise<ILiveSource> {
        return this.transport.post('/api/live/sources', source);
    }

    public async updateSource(source: ILiveSource): Promise<ILiveSource> {
        return this.transport.put(`/api/live/sources/${source.id}`, source);
    }

    public async deleteSource(sourceId: string): Promise<any>  {
        return await this.transport.del(`/api/live/sources/${sourceId}`);
    }

    public makeCaptureAwaiter(filename: string, timeoutMs: number): Promise<PcapFileProcessingDone | undefined> {
        return this.transport.makeAwaiter<PcapFileProcessingDone | undefined>(
            wsEvents.Pcap.processingDone,
            (data: any) => {
                if (data.file_name === filename) {
                    return data as PcapFileProcessingDone;
                }
                return undefined;
            },
            timeoutMs
        );
    }

    public async startCapture(filename: string, durationMs: number, sources: string[]) {
        const workflow = {
            configuration: {
                durationMs,
                filename,
                ids: sources,
            },
            type: workflows.types.captureAndIngest,
        };
        this.sendWorkflow(workflow);
    }

    private async sendWorkflow(workflow: object) {
        return this.transport.post('/api/workflow/', workflow);
    }
}
