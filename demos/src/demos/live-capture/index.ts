import { LIST, types } from '@bisect/ebu-list-sdk';
import { IArgs, PcapFileProcessingDone } from '../../types';
import * as readline from 'readline';
import * as util from 'util';

const CAPTURE_DURATION = 10; /* sec */
const ERROR_COUNT_LIMIT = 10;

const readFromUser = async (question: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer: string) => {
            rl.close();
            resolve(answer);
        });
    });
};

const sleep = async (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

const doCapture = async (list: LIST, filename: string, captureDuration: number,
        sources: string [], callback: types.UploadProgressCallback): Promise<PcapFileProcessingDone> =>
    new Promise(async (resolve, reject) => {
        const start = new Date();

        await list.live.startCapture(filename, captureDuration * 1000, sources);
        const captureResult = await list.live.makeCaptureAwaiter(filename, 3 * captureDuration * 1000);
        if (!captureResult) {
            reject(new Error('Pcap capture and processing undefined'));
            return;
        }

        const stop = new Date();
        console.log(`Captured and analyzed in ${Math.abs(stop.getTime() - start.getTime())/1000} s`);
        resolve(captureResult);
    });

const dumpPcap = (pcap: any, streams: any) => {
    console.log('Pcap:');
    console.log(util.inspect(pcap, false, null, true));
    console.log('Streams:');
    console.log(util.inspect(streams, false, null, true));
    console.log('Errors:');
    console.log(pcap.summary.error_list);
};

export const run = async (args: IArgs) => {
    const list = new LIST(args.baseUrl);
    const freerun : boolean = (typeof args.freerun !== 'undefined');
    const multicasts : any [] = (typeof args.multicasts === 'undefined')? [] : args.multicasts.split(',');

    await list.login(args.username, args.password);

    console.log('---------------------------------');
    console.log('Get live sources');
    const allSources = await list.live.getAllSources();
    var sources : any [];
    if (multicasts.length > 0) {
        sources = allSources.filter((s: any) => {
            const mcast: any [] = multicasts.filter((m: any) => s.sdp.streams[0].dstAddr == m);
            return mcast.length > 0;
        });
    } else { /* choose manually */
        allSources.forEach(function(e: any, i: number) {
            console.log(`${i + 1}: ${e.meta.label}: ${JSON.stringify(e.sdp.streams)}`);
        });
        const index = parseInt(await readFromUser('Choose source number (defaut 0): '));
        sources = [allSources[index - 1]];
    }
    console.log(`${JSON.stringify(sources.map(e => e.meta.label))}`);

    console.log('---------------------------------');
    console.log('Capture duration');
    var captureDuration : number;
    if (typeof args.duration === 'undefined') {
        const r = parseInt(await readFromUser(`Enter duration (default ${CAPTURE_DURATION}sec): `));
        captureDuration = isNaN(r)?  CAPTURE_DURATION : r;
    } else {
        captureDuration = args.duration;
    }

    var loopCount: number = 0;
    var errorCount: number = 0;
    while(true) { /* run once if no freerun */
        const datetime = new Date().toLocaleString().split(" ").join("-").split("/").join("-");
        loopCount += 1;
        console.log(`${datetime}--------------${errorCount}/${loopCount}`);

        /* Start the capture */
        const filename = `auto-${datetime}-${sources[0].meta.label}`;
        var pcap: PcapFileProcessingDone;
        console.log(`Capturing ${captureDuration} s`);
        try {
            const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);

            pcap = await doCapture(list, filename, captureDuration, sources.map(e => e.id), callback);
        } catch (err: any) {
            console.error(`Error during capture or analysis: ${err.toString()}`);
            if (freerun) {
                continue;
            } else{
                break;
            }
        }

        var streams: any [] = [];
        console.log(`Getting streams`);
        try {
            streams = await list.pcap.getStreams(pcap.id);
        } catch (err: any) {
            console.error(`Get streams error: ${err.toString()}`);
        }

        /* Handle result */
        if (freerun) { /* save up to ERROR_COUNT_LIMIT pcaps or autoremove */
            try {
                const ts_start: number = parseInt(streams[0].statistics.first_packet_ts) / 1000000000;
                const ts_stop: number = parseInt(streams[0].statistics.last_packet_ts) / 1000000000;
                console.log(` ts: ${ts_start.toFixed(1)} ..  ${ts_stop.toFixed(1)} sec`);

                if ((pcap.error != '') ||
                        (pcap.summary.error_list.length > 0) ||
                        (pcap.total_streams != multicasts.length)) {

                    /* Refine the error filter. Exple: enlarge RTP_vs_pkt range
                    const rtp_error_reducer = (acc: any, cur: any) => acc + (
                        (cur.global_audio_analysis.packet_ts_vs_rtp_ts.range.min < -60) ||
                        (cur.global_audio_analysis.packet_ts_vs_rtp_ts.range.max > 4000))? 1 : 0;
                    if (streams.reduce(rtp_error_reducer, 0) > 0) {
                        dumpPcap(pcap, streams.filter((s: any) => s.error_list.length > 0));
                        errorCount += 1;
                        if (errorCount > ERROR_COUNT_LIMIT) {
                            console.log('Maximum error count reached, exit.');
                            break;
                        }
                        continue; // keep pcap
                    }
                    */

                    continue; /* keep pcap */
                }
            } catch (err: any) {
                console.error(`Analysis parsing error: ${err.toString()}`);
            }
        } else { /* run once, show and exit */
            dumpPcap(pcap, streams);
            if (await readFromUser('Do you want to delete pcap?  [y/n]') !== 'y') {
                break;
            }
        }

        try {
            await list.pcap.delete(pcap.id);
        } catch (err: any) {
            console.error(`Deletion error: ${err.toString()}`);
        }

        if (!freerun) {
            break;
        }
    }
    await list.close();
};

module.exports = { run };
