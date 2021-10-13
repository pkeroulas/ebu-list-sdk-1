import { IAnalysisProfileDetails } from './pcap';

export enum Pcap {
    received = 'PCAP_FILE_RECEIVED',
    preProcessed = 'PCAP_FILE_PROCESSED',
    analyzing = 'PCAP_FILE_ANALYZING',
    failed = 'PCAP_FILE_FAILED',
    processingDone = 'PCAP_FILE_PROCESSING_DONE',
    deleted = 'PCAP_FILE_DELETED',
}

export enum Mp3 {
    rendered = 'MP3_FILE_RENDERED',
    failed = 'MP3_FILE_FAILED',
}

export enum Zip {
    failed = 'ZIP_FILE_FAILED',
    complete = 'ZIP_FILE_COMPLETE',
}

export enum Stream {
    compare_failed = 'STREAM_COMPARE_FAILED',
    compare_complete = 'STREAM_COMPARE_COMPLETE',
    compare_deleted = 'STREAM_COMPARE_DELETED',
}

export enum Ip {
    parsed_from_sdp = 'IP_PARSED_FROM_SDP',
}

export enum Sdp {
    validation_results = 'SDP_VALIDATION_RESULTS',
}

export enum LiveSource {
    list_update = 'LIVE_SOURCE_LIST_UPDATE',
}

export interface IPcapInitialData {
    id: string;
    file_name: string;
    pcap_file_name: string;
    date: number;
    progress: number;
}

export interface IAnalysisIssue {
    stream_id: string | null;
    value: { id: string };
}

export interface IAnalysisSummary {
    error_list: IAnalysisIssue[];
    warning_list: IAnalysisIssue[];
}

export interface IPcapData {
    analyzed: boolean;
    error: string;
    offset_from_ptp_clock: number;
    anc_streams: number;
    audio_streams: number;
    video_streams: number;
    total_streams: number;
    narrow_linear_streams: number;
    narrow_streams: number;
    not_compliant_streams: number;
    wide_streams: number;
    generated_from_network: boolean;
    truncated: boolean;
    analyzer_version: string;
    capture_date: number;
    capture_file_name: string;
    owner_id: string;
    analysis_profile: IAnalysisProfileDetails;
    summary: IAnalysisSummary;
}

export interface IPcapReceivedEvent {
    event: Pcap.received;
    data: IPcapInitialData;
}

export interface IPcapPreProcessedEvent {
    event: Pcap.preProcessed;
    data: IPcapInitialData & Partial<IPcapData>;
}

export interface IPcapProcessingDoneEvent {
    event: Pcap.processingDone;
    data: IPcapInitialData & IPcapData;
}

export interface IPcapProcessingFailedEvent {
    event: Pcap.failed;
    data: IPcapInitialData & Partial<IPcapData>;
}

export const isPcapReceivedEvent = (e: any): e is IPcapReceivedEvent =>
    (e as IPcapReceivedEvent).event === Pcap.received;

export const isPcapPreProcessedEvent = (e: any): e is IPcapPreProcessedEvent =>
    (e as IPcapPreProcessedEvent).event === Pcap.preProcessed;

export const isPcapProcessingDoneEvent = (e: any): e is IPcapProcessingDoneEvent =>
    (e as IPcapProcessingDoneEvent).event === Pcap.processingDone;

export const isPcapProcessingFailedEvent = (e: any): e is IPcapProcessingFailedEvent =>
    (e as IPcapProcessingFailedEvent).event === Pcap.failed;
