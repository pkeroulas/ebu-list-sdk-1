import { Transport } from '@bisect/bisect-core-ts';
import { IFrameInfo } from './api/stream';
import { IStreamInfo } from './types';

// ////////////////////////////////////////////////////////////////////////////

export default class Stream {
    public constructor(private readonly transport: Transport) {}

    // Get stream info by id
    public async getStreamInfo(pcapID: string, streamID: string | undefined): Promise<IStreamInfo> {
        const response = await this.transport.get(`/api/pcap/${pcapID}/stream/${streamID}`);
        const streamInfo: IStreamInfo = response as IStreamInfo;
        return streamInfo;
    }

    // Video
    public async getFramesFromStream(pcapID: string, streamID: string | undefined): Promise<IFrameInfo[]> {
        const response = await this.transport.get(`/api/pcap/${pcapID}/stream/${streamID}/frames`);
        const frames: IFrameInfo[] = response as IFrameInfo[];
        return frames;
    }

    public getUrlForFrame(pcapID: string, streamID: string | undefined, timestamp: string) {
        return this.transport.rest.getAuthUrl(`/api/pcap/${pcapID}/stream/${streamID}/frame/${timestamp}/png`);
    }

    // Video Graphs - Cinst Line Chart
    public async getCInstForStream(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/CInst?from=${fromNs}&to=${toNs}`
        );
        const cinstData: any = response;
        return cinstData;
    }

    // Video Graphs - Cinst Bar Chart
    public async getCInstHistogramForStream(pcapID: string, streamID: string | undefined): Promise<any> {
        const response = await this.transport.get(`/api/pcap/${pcapID}/stream/${streamID}/analytics/CInst/histogram`);
        const cinstData: any = response;
        return cinstData;
    }

    // Video Graphs - Vrx Line Chart
    public async getVrxIdealForStream(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined,
        groupByNanoseconds?: any
    ): Promise<any> {
        const groupBy = groupByNanoseconds ? `&groupByNanoseconds=${groupByNanoseconds}` : '';
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/VrxIdeal?from=${fromNs}&to=${toNs}${groupBy}`
        );
        const vrxData: any = response;
        return vrxData;
    }

    // Video Graphs - Vrx Bar Chart
    public async getVrxHistogramForStream(pcapID: string, streamID: string | undefined): Promise<any> {
        const response = await this.transport.get(`/api/pcap/${pcapID}/stream/${streamID}/analytics/Vrx/histogram`);
        const vrxData: any = response;
        return vrxData;
    }

    // Video Graphs - FTP Line Chart
    public async getDeltaToIdealTpr0Raw(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/DeltaToIdealTpr0Raw?from=${fromNs}&to=${toNs}`
        );
        const ftpData: any = response;
        return ftpData;
    }

    // Video&Ancillary Graphs - RTP Latency Line Chart
    public async getDeltaPacketTimeVsRtpTimeRaw(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/DeltaPacketTimeVsRtpTimeRaw?from=${fromNs}&to=${toNs}`
        );
        const latencyData: any = response;
        return latencyData;
    }

    // Video Graphs - RTP Offset Line Chart
    public async getDeltaRtpVsNtRaw(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/DeltaRtpVsNt?from=${fromNs}&to=${toNs}`
        );
        const rtpOffsetData: any = response;
        return rtpOffsetData;
    }

    // Video&Ancillary Graphs - RTP Time Step Line Chart
    public async getDeltaToPreviousRtpTsRaw(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/DeltaToPreviousRtpTsRaw?from=${fromNs}&to=${toNs}`
        );
        const rtpOffsetData: any = response;
        return rtpOffsetData;
    }

    // Audio
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

    // Audio Graphs - Delta Packect VS RTP Line Chart
    public async getAudioPktTsVsRtpTs(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/AudioPktTsVsRtpTs?from=${fromNs}&to=${toNs}`
        );
        const data: any = response;
        return data;
    }
    // Audio Graphs - TS-DF Line Chart
    public async getAudioTimeStampedDelayFactor(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined,
        toleranceUs: string | undefined,
        tsdfmaxUs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/AudioTimeStampedDelayFactor?from=${fromNs}&to=${toNs}&tolerance=${toleranceUs}&tsdfmax=${tsdfmaxUs}`
        );
        const data: any = response;
        return data;
    }

    // Ancillary
    public downloadAncillaryUrl(pcapID: string, streamID: string | undefined, filename: string) {
        return this.transport.rest.getAuthUrl(`/api/pcap/${pcapID}/stream/${streamID}/ancillary/${filename}`);
    }

    public async downloadText(path: string): Promise<any> {
        const response = await this.transport.getText(`${path}`);
        const text: any = response;
        return text;
    }

    // Ancilary Graphs - Packets Per Frame Line Chart
    public async getPacketsPerFrame(
        pcapID: string,
        streamID: string | undefined,
        fromNs: string | undefined,
        toNs: string | undefined
    ): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/packetsPerFrame?from=${fromNs}&to=${toNs}`
        );
        const data: any = response;
        return data;
    }

    // Ancilary Graphs - Packets Per Frame Histogram Chart
    public async getAncillaryPktPerFrameHistogram(pcapID: string, streamID: string | undefined): Promise<any> {
        const response = await this.transport.get(
            `/api/pcap/${pcapID}/stream/${streamID}/analytics/AncillaryPktHistogram`
        );
        const data: any = response;
        return data;
    }
}
