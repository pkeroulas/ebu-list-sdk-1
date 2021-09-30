/* Workflow schema:
{
    id : string (uuid),
    type: type (see types),
    state: {
        status: string (see status),
        errorMessage : status == status.failed ? string | undefined,
    },
    meta: {
        createdBy: string (user id),
        times: {
            created: Date (readonly),
            lastUpdated: undefined | Date,
            completed: undefined | Date,
        },
    },
    configuration: any (workflow specific),
}
*/

export const status = {
    canceled: 'canceled',
    requested: 'requested',
    started: 'started',
    failed: 'failed', // payload : { message: string }
    completed: 'completed',
};

export const types = {
    /**
     * ingestPutUrl : string // where to upload the captured pcap
     * cookie : string // cookie to authenticate in the HTTP PUT
     * filename : string // the name of the capture file
     * senders : array of Sender // what sources to capture
     * durationMs : number // the duration of the capture, in milliseconds
     */
    captureAndIngest: 'captureAndIngest',
    /*
     **/
    downloadMultipleFiles: 'downloadMultipleFiles',
    compareStreams: 'compareStreams',
    st2022_7_analysis: 'st2022_7_analysis',
};
