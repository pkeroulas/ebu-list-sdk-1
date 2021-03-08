import { Transport } from './transport';

import { IFrameInfo } from './api/stream';

// ////////////////////////////////////////////////////////////////////////////

export default class Stream {
    public constructor(private readonly transport: Transport) {
        this.transport = transport;
    }

    //Video
    public async getFramesFromStream(pcapID: string, streamID: string | undefined): Promise<IFrameInfo[]> {
        const response = await this.transport.get(`/api/pcap/${pcapID}/stream/${streamID}/frames`);
        const frames: IFrameInfo[] = response as IFrameInfo[];
        return frames;
    }

    public getUrlForFrame(pcapID: string, streamID: string | undefined, timestamp: string) {
        return this.transport.rest.getAuthUrl(`/api/pcap/${pcapID}/stream/${streamID}/frame/${timestamp}/png`);
    }

    //Audio
    public async renderMp3(pcapID: string, streamID: string | undefined, channelsString: string): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/rendermp3?channels=${channelsString}`
        );
        const render: any = response;
        return render;
    }

    public downloadMp3Url(pcapID: string, streamID: string | undefined, channelsString?: string) {
        return this.transport.rest.getAuthUrl(
            `/api/pcap/${pcapID}/stream/${streamID}/downloadmp3${channelsString ? `?channels=${channelsString}` : ''}`
        );
    }

    //Ancillary
    public downloadAncillaryUrl(pcapID: string, streamID: string | undefined, filename: string) {
        return this.transport.rest.getAuthUrl(`/api/pcap/${pcapID}/stream/${streamID}/ancillary/${filename}`);
    }

    public async downloadText(path: string): Promise<any> {
        const response = await this.transport.getText(`${path}`);
        const text: any = response;
        return text;
    }
}
