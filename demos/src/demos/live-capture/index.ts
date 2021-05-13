import { LIST } from '@bisect/ebu-list-sdk';
import { IArgs } from '../../types';
import * as readline from 'readline';
import * as util from 'util';

const CAPTURE_DURATION = 10; /* sec */
const ERROR_COUNT_LIMIT = 10;

const askForNumber = async (question: string, readline: any): Promise<number> => {
    return new Promise((resolve) => {
        readline.question(question, (answer: string) => {
            resolve(parseInt(answer));
        });
    });
};

const askForConfirmation = async (question: string, readline: any): Promise<boolean> => {
    return new Promise((resolve) => {
        readline.question(question, (answer: string) => {
            resolve(answer === 'y');
        });
    });
};

const sleep = async (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

export const run = async (args: IArgs) => {
    const list = new LIST(args.baseUrl);
    await list.login(args.username, args.password);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const freerun : boolean = (typeof args.freerun !== 'undefined');
    const multicasts : any [] = (typeof args.multicasts === 'undefined')? [] : args.multicasts.split(',');

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
        const index = await askForNumber('Choose source number (defaut 0): ', rl);
        sources = [allSources[index - 1]];
    }
    console.log(`${JSON.stringify(sources)}`);

    console.log('---------------------------------');
    //const captureDuration = await askForNumber('Enter capture duration (default 1 seconds): ', rl);
    const captureDuration = CAPTURE_DURATION;

    var loopCount :number = 0;
    var errorCount :number = 0;
    while(true) { /* run once if no freerun */
        const datetime = new Date();
        loopCount += 1;
        console.log(`${datetime.toISOString()}--------------${errorCount}/${loopCount}`);

        /* Start the capture */
        const filename = `auto-${datetime.toISOString()}-${sources[0].meta.label}`;
        await list.live.startCapture(filename, captureDuration * 1000, sources.map(e => e.id));
        console.log(`Capturing ${captureDuration} s`);
        await sleep(captureDuration * 1000);

        /* Pull analysis */
        const start = new Date();
        var res: any [] = [];
        var waitCount : number = 0;
        while (res.length == 0) {
            waitCount += 1;
            if (waitCount > (captureDuration * 2)) {
                console.log('Analysis timeout.');
                break;
            }
            await sleep(1000);
            //console.log('.');
            const allAnalysis = await list.pcap.getAll();
            res = allAnalysis.filter((e: any) => (e.file_name == filename) && e.analyzed);
        }
        const stop = new Date();
        if (waitCount > (captureDuration * 2)) {
            continue;
        }
        console.log(`Analysing ${Math.abs(stop.getTime() - start.getTime())/1000} s`);

        /* Handle result */
        const analysis = res[0];
        if (freerun) {
            if ((analysis.error != '') ||
                    (analysis.summary.error_list.length > 0) ||
                    (analysis.total_streams != multicasts.length)) {
                errorCount += 1;
                console.log('Errors detected in Pcap:');
                console.log(util.inspect(analysis, false, null, true));
                console.log('Streams:');
                const streams : any [] = await list.pcap.getStreams(analysis.id);
                console.log(util.inspect(streams, false, null, true));
                if (errorCount > ERROR_COUNT_LIMIT) { console.log('Maximum error count reached, exit.');
                    break;
                }
            } else {
                await list.pcap.del(analysis.id);
            }
        } else { /* run once, show and exit */
            console.log('Pcap:');
            console.log(util.inspect(analysis, false, null, true));
            console.log('Streams:');
            console.log(await list.pcap.getStreams(analysis.id));
            console.log('Errors:');
            console.log(analysis.summary.error_list);
            if (await askForConfirmation('Do you want to delete pcap? [y/n]', rl) == true) {
                await list.pcap.del(analysis.id);
            }
            break;
        }
    }

    rl.close();
    await list.close();
};

module.exports = { run };
