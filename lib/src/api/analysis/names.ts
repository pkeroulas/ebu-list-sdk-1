export enum AnalysisNames {
    packet_ts_vs_rtp_ts = 'packet_ts_vs_rtp_ts',
    pit = 'pit',
    tsdf = 'tsdf',
}

export const makeAnalysisName = (name: AnalysisNames) => `analyses.${name}`;
