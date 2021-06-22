import * as api from './api';

export type IPcapInfo = api.pcap.IPcapInfo;
export type IStreamInfo = api.pcap.IStreamInfo;
export type IFrameInfo = api.stream.IFrameInfo;

export type IPcapFileReceived = api.pcap.IPcapFileReceived;

export type IAnalysisProfile = api.pcap.IAnalysisProfile;
export type IAnalysisProfileDetails = api.pcap.IAnalysisProfileDetails;

export interface IVersion {
    major: number;
    minor: number;
    patch: number;
    hash: string;
}

// analysis
export type PcapId = string;
export type FileName = string;
export type MediaType = string;

export interface IPcapUploadResult {
    uuid: PcapId;
}

// live
export interface ILiveMeta {
    label: string;
}

export interface ISdp {
    streams: string;
}

export interface ILiveSource {
    id: string;
    meta: ILiveMeta;
    sdp: ISdp;
}

export interface IUploadProgressInfo {
    percentage: number;
}

export type UploadProgressCallback = (info: IUploadProgressInfo) => void;

export interface ILocalStorageHandler {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => any | undefined;
    removeItem: (key: string) => void;
}

export interface IListOptions {
    tokenStorage?: ILocalStorageHandler;
    handleUnauthorized?: () => void;
}

// Download Manager
export type IDownloadManagerDataContent = api.downloadManager.IDownloadManagerDataContent;
export type IDownloadManagerData = api.downloadManager.IDownloadManagerData;
