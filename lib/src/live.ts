import { ILiveSource } from './types';
import { PcapFileProcessingDone } from './api/pcap';
import { Transport } from '@bisect/bisect-core-ts';
import { Workflow } from './api/constants';
import { wsEvents } from './api';

//////////////////////////////////////////////////////////////////////////////

export default class Live {
    public constructor(private readonly transport: Transport) {}

    public async getAllSources() {
        const response = await this.transport.get('/api/live/sources');
        const sources: ILiveSource[] = response as ILiveSource[];
        return sources;
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
            type: Workflow.liveCapture,
        };
        this.sendWorkflow(workflow);
    }

    private async sendWorkflow(workflow: object) {
        return this.transport.post('/api/workflow/', workflow);
    }
}
