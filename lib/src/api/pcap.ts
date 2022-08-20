import { AnalysisNames } from './analysis/names';

export interface IProblem {
    stream_id: string | null; // If null, applies to the whole pcap, e.g. truncated
    value: {
        id: string; // Problem id
    };
}

export type Compliance = 'compliant' | 'not_compliant' | 'disabled' | 'undefined';

export interface IMinMax {
    min: number;
    max: number;
}

export interface IMinMaxAvg extends IMinMax {
    avg: number;
}

export type AudioTimeUnit = 'packet_time' | 'μs';

export type IAudioValueRange = { min: number | undefined; max: number | undefined; unit: AudioTimeUnit };

export interface IMinMaxAvgRanges {
    min: IAudioValueRange;
    avg: IAudioValueRange;
    max: IAudioValueRange;
}
export interface IAudioRtpProfile extends IMinMaxAvgRanges {}

export interface IAudioPitProfile extends IMinMaxAvgRanges {}

export type IAudioValueRangeUs = { min: number | undefined; max: number | undefined };

export interface IMinMaxAvgUsRanges {
    min: IAudioValueRangeUs;
    avg: IAudioValueRangeUs;
    max: IAudioValueRangeUs;
}

export type IAudioRtpProfileUs = IMinMaxAvgUsRanges;

export interface ITsdfProfile {
    tolerance: number;
    limit: number;
    unit: AudioTimeUnit;
}

export interface ITsdfAnalysisDetails {
    compliance: Compliance;
    level: 'narrow' | 'wide' | 'not_compliant';
    result: Compliance;
    max: number;
}

export type MinMaxAvgUsRange = IMinMaxAvg & {
    unit: 'μs';
};

export interface IAudioLatencyAnalysisDetails {
    limit: IAudioRtpProfileUs;
    range: IMinMaxAvg;
}

export interface IAudioLatencyAnalysis {
    result: Compliance;
    details: IAudioLatencyAnalysisDetails;
}

export interface IRtpTsVsNtAnalysisDetails {
    range: IMinMaxAvg;
    limit: IMinMax;
    unit: 'ticks';
}

export interface IRtpTsVsNtAnalysis {
    result: Compliance;
    details: IRtpTsVsNtAnalysisDetails;
}
export interface IAudioPitAnalysisDetails {
    limit?: IMinMaxAvgUsRanges;
    range: MinMaxAvgUsRange;
}

export interface IAudioPitAnalysis {
    result: Compliance;
    details: IAudioPitAnalysisDetails;
}

export interface ITsdfAnalysis {
    result: Compliance;
    details: ITsdfAnalysisDetails & ITsdfProfile;
}

export interface IAudioAnalysisProfile {
    deltaPktTsVsRtpTsLimit: IAudioRtpProfile;
    pit?: IAudioPitProfile;
    tsdf: ITsdfProfile;
}

/// This is a workaround to use the old validation type baed on TRoffset, which was deemed incorrect
type UseTrOffset = { type: 'use_troffset' };

/// New profiles should use this
type UseLimit = { type: 'use_ticks'; limit: IMinMax };

export type IRtpOffsetValidation = UseTrOffset | UseLimit;

export type Validations = {
    rtp_ts_vs_nt?: IRtpOffsetValidation;
};

type MediaTypeValidationBase = {
    [key in MediaType]: Validations;
};

type FullMediaTypeValidationBase = {
    [key in FullMediaType]: Validations;
};

/// The validations for a stream are selected as follows:
/// - Collect the validations in 'common'
/// - Collect the validations in the stream's media type
/// - Collect the validations in the stream's full media type
/// The latter replace the former, if they exist.
export interface IValidationMap extends MediaTypeValidationBase, FullMediaTypeValidationBase {
    common: Validations;
}

export interface IAnalysisProfile {
    id: string;
    label: string;
    timestamps: {
        source: 'pcap' | 'ptp_packets';
    };
    audio: IAudioAnalysisProfile;
    validationMap: Partial<IValidationMap>;
}

export type IAnalysisProfileDetails = IAnalysisProfile;

// Maps network info to a media type from one SDP file
export interface IMediaTypeMapEntry {
    // <source> is only present if a source-filter is specified
    source?: {
        address: string;
    };
    destination: {
        address: string;
        port: number;
    };
    media_type: FullMediaType;
}

export type MediaTypeMapping = IMediaTypeMapEntry[];

export interface IPcapInfo {
    analyzed: boolean; // True if the analysis is thoroughly complete
    analyzer_version: string; // The version of LIST when the analysis was done
    analysis_profile: IAnalysisProfileDetails;
    anc_streams: number; // Number of ancillary data streams
    audio_streams: number; // Number of audio streams
    capture_date: number; // capture date, extracted from the pcap file
    date: number; // date of analysis
    error: string; // pcap processing errors
    file_name: string; // TODO check this
    id: string; // unique id of the pcap
    narrow_linear_streams: number; // ST2110-21
    narrow_streams: number; // ST2110-21
    not_compliant_streams: number; // Number of stream that have at least one failed validation
    offset_from_ptp_clock: number; // deprecated
    pcap_file_name: string; // TODO check this
    total_streams: number; // Total number of streams
    truncated: boolean; // True if the pcap does not contain the complete packet payload
    video_streams: number; // Number of video streams
    ttml_streams: number; // Number of ttml streams
    wide_streams: number; // ST2110-21
    srt_streams: number; // SRT
    sdps?: string[]; // SDP documents
    parsed_sdps?: unknown[]; // sdpParser.SessionDescription
    media_type_map?: MediaTypeMapping; // Maps media types from SDP files to network info
    transport_type: FullTransportType;
    summary: { error_list: IProblem[]; warning_list: IProblem[] };
}

export interface PcapFileProcessingDone {
    analyzed: boolean;
    error: any;
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
    _id: string;
    id: string;
    __v: number;
    analyzer_version: string;
    capture_date: number;
    capture_file_name: string;
    date: number;
    file_name: string;
    pcap_file_name: string;
    analysis_profile: IAnalysisProfileDetails;
    summary: { error_list: IProblem[]; warning_list: IProblem[] };
    progress: number;
}

export type Rate = '24000/1001' | '24' | '25' | '30000/1001' | '30' | '50' | '60000/1001' | '60';
export type Colorimetry = 'BT601' | 'BT709' | 'BT2020';
export type ColorSampling = 'YCbCr-4:2:2';
export type ScanType = 'progressive' | 'interlaced';
export type ST211021Schedule = 'gapped' | 'linear';

export interface IST2110VideoInfo {
    avg_tro_ns: number; // ST2110-21, nanoseconds
    color_depth: number; // bits per sample
    colorimetry: Colorimetry;
    has_continuation_bit_set: boolean; // true if at least one packet has the C-bit set
    height: number; // Frame height. If interlaced 2 * field height
    max_tro_ns: number; // ST2110-21, nanoseconds
    min_tro_ns: number; // ST2110-21, nanoseconds
    packets_per_frame: number; // number of packets per frame
    packing_mode: number; // pixel group packing mode, e.g. Block or General
    rate: Rate; // Frame or field rate, as a fraction
    sampling: ColorSampling;
    scan_type: ScanType;
    schedule: ST211021Schedule;
    tro_default_ns: number; // As defined in ST2110-21 for this format, in nanoseconds;
    width: number; // Frame/field width
}

export interface IST2110AudioInfo {
    encoding: 'L16' | 'L24';
    number_channels: number;
    packet_time: string;
    sampling: string;
}

export interface IST2110SubSubstream {
    filename: string;
    type: string;
}

export interface IST2110Substream {
    did_sdid: number;
    errors: number;
    line: number;
    num: number;
    offset: number;
    packet_count: number;
    sub_sub_streams: IST2110SubSubstream[];
}
export interface IST2110AncInfo {
    packets_per_frame: number;
    rate: Rate;
    scan_type: ScanType;
    sub_streams?: IST2110Substream[];
}

export type MediaSpecificInfo = IST2110VideoInfo | IST2110AudioInfo | IST2110AncInfo;
export type MediaType = 'video' | 'audio' | 'ancillary_data' | 'ttml' | 'unknown';
export type FullMediaType =
    | 'video/raw'
    | 'video/jxsv'
    | 'audio/L24'
    | 'audio/L16'
    | 'audio/AM824'
    | 'video/smpte291'
    | 'application/ttml+xml'
    | 'unknown';

export type FullTransportType = 'RIST' | 'RTP' | 'SRT' | 'unknown';

// The reasons why the heuristics deemed the other possible formats as invalid
export interface IMediaTypeValidation {
    anc?: string[]; // 'STATUS_CODE_ANC_WRONG_HEADER' ...
    audio?: string[]; // 'STATUS_CODE_AUDIO_DIFFERENCE_VALUE_EQUAL_TO_ZERO' ...
    ttml?: string[]; // 'STATUS_CODE_TTML_INVALID_DOCUMENT' ...
    video?: string[]; // 'STATUS_CODE_TTML_INVALID_DOCUMENT' ...
}

export interface IDscpInfo {
    consistent: boolean; // True if the valus remain consistent for the whole stream
    value: number; // The actual value, if consistent
}

// All in nanosecond
export interface IVideoPacketSpacing {
    avg: number;
    max: number;
    min: number;
}

export interface IVideoPacketSpacingInfo {
    after_m_bit: IVideoPacketSpacing;
    regular: IVideoPacketSpacing;
}

export interface INetworkInformation {
    destination_address: string; // destination IP address
    destination_mac_address: string; // destination Ethernet MAC address
    destination_port: string; // destination UDP port
    dscp: IDscpInfo;
    has_extended_header: boolean; // True if the RTP X bit is set for any packet
    inter_packet_spacing?: IVideoPacketSpacingInfo;
    multicast_address_match: boolean; // true if the IP and MAC addresses are consistent
    payload_type: number; // RTP payload type
    source_address: string; // source IP address
    source_mac_address: string; // source Ethernet MAC address
    source_port: string; // source UDP port
    ssrc: number; // RTP SSRC
    valid_multicast_ip_address: boolean; // True of the IP address is a valid multicast address
    valid_multicast_mac_address: boolean; // True of the MAC address is a valid multicast address
}

export type StreamState = 'ready' | 'analyzed'; // TODO check this

export interface IStreamStatistics {
    dropped_packet_count: number; // Number of dropped RTP packets
    dropped_packet_samples: any[]; // TODO check this
    first_frame_ts?: number; // RTP timestamp of the first frame - Video TODO move this to media specific
    first_packet_ts: string; // The abosulte timestamp of the first packet
    frame_count?: number; // Number of video frames. TODO move this to media specific
    is_interlaced?: boolean; // Video TODO move this to media specific
    last_frame_ts?: number; // RTP timestamp of the last frame - Video TODO move this to media specific
    last_packet_ts: string; // The abosulte timestamp of the last packet
    max_line_number?: number; // Video TODO move this to media specific
    packet_count: number; // Total number of RTP packets
    rate?: number; // Video frame/field rate TODO move this to media specific
    sample_count?: number;
    samples_per_packet?: number;
    packet_size?: number;
    wrong_marker_count?: number;
    wrong_field_count?: number;
    payload_error_count?: number;
    retransmitted_packets?: number; //Total number of retrasmitted packets
}

export enum ProcessingState {
    idle = 'IDLE',
    active = 'ACTIVE',
    completed = 'COMPLETED',
    failed = 'FAILED',
}

export interface IStreamProcessing {
    // True if frames have already been extracted
    extractedFrames: ProcessingState;
}

export interface IStreamAnalyses {
    [AnalysisNames.pit]: IAudioPitAnalysis;
    [AnalysisNames.tsdf]: ITsdfAnalysis;
    [AnalysisNames.packet_ts_vs_rtp_ts]: IAudioLatencyAnalysis;
    '2110_21_cinst': any;
    '2110_21_vrx': {
        result: Compliance;
    };
    anc_payloads: any; //
    destination_multicast_ip_address: any;
    destination_multicast_mac_address: any;
    field_bits: any; //
    inter_frame_rtp_ts_delta: any;
    mac_address_analysis: any;
    marker_bit: any; //
    pkts_per_frame: any;
    rtp_sequence: any;
    rtp_ts_vs_nt: IRtpTsVsNtAnalysis;
    ttml_consistent_sequence_identifier: any;
    ttml_inconsistent_sequence_identifier: any;
    ttml_time_base_is_media: any;
    unique_multicast_destination_ip_address: any;
    unrelated_multicast_addresses: any;
}

export type Dash21Compliance = 'narrow' | 'wide' | 'not_compliant';

// Meant for internal use
export interface IGlobalVideoAnalysis {
    compliance: Dash21Compliance;
    cinst: {
        cmax_narrow: number;
        cmax_wide: number;
        compliance: Dash21Compliance;
    };
    vrx: {
        compliance: Dash21Compliance;
        vrx_full_narrow: number;
        vrx_full_wide: number;
    };
    trs: {
        trs_ns: number;
    };
}

export interface ITsdfGlobalDetails extends ITsdfProfile {
    compliance: Compliance;
    level: 'narrow' | 'wide' | 'not_compliant';
    result: Compliance;
    max: number;
    tolerance: number;
    limit: number;
    unit: 'μs';
}

export interface IAudioLatencyGlobalDetails {
    range: IMinMaxAvg;
    limit: IMinMaxAvgUsRanges;
    unit: AudioTimeUnit;
}

// Meant for internal use
export interface IGlobalAudioAnalysis {
    tsdf: ITsdfGlobalDetails;
    packet_ts_vs_rtp_ts: IAudioLatencyGlobalDetails;
}

export interface IStreamInfo {
    id: string; // Unique ID of the stream
    media_specific?: MediaSpecificInfo; // Not set if stream is unknown
    error_list: Array<IProblem>;
    media_type: MediaType;
    full_media_type: FullMediaType;
    full_transport_type: FullTransportType;
    media_type_validation?: IMediaTypeValidation;
    network_information: INetworkInformation;
    global_video_analysis?: Partial<IGlobalVideoAnalysis>;
    global_audio_analysis?: Partial<IGlobalAudioAnalysis>;
    pcap: string; // The id of the pcap on which this stream is contained
    state: StreamState;
    statistics: IStreamStatistics;
    analyses: Partial<IStreamAnalyses>;
    processing: IStreamProcessing;
}

export interface IStreamAnalysis {
    result: Compliance;
    details?: any;
}

export interface IPcapFileCapturing {
    id: string;
    file_name: string;
    progress: number;
}

export interface IPcapFileReceived {
    id: string;
    file_name: string;
    pcap_file_name: string;
    data: number;
    progress: number;
}

export interface IAnalysisProfiles {
    all: IAnalysisProfileDetails[];
    default: string;
}

export interface ILocalPcapAnalysisParams {
    path: string; // path to file on a filesystem accessible by LIST
    name: string; // the name that will be assigned to the pcap in LIST
}

export function isLocalPcapAnalysisParams(p: unknown): p is ILocalPcapAnalysisParams {
    if (typeof (p as ILocalPcapAnalysisParams).name !== 'string') return false;
    if (typeof (p as ILocalPcapAnalysisParams).path !== 'string') return false;
    return true;
}

export const isAudioStream = (stream?: IStreamInfo): boolean => stream?.media_type === 'audio';

export function isIST2110AudioInfo(info?: MediaSpecificInfo): info is IST2110AudioInfo {
    if (!info) return false;

    const v = info as IST2110AudioInfo;
    return (
        v.encoding !== undefined &&
        v.number_channels !== undefined &&
        v.packet_time !== undefined &&
        v.sampling !== undefined
    );
}
