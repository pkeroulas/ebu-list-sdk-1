import { LIST, types } from '@bisect/ebu-list-sdk';
import { IArgs, IEventInfo } from '../../types';
import fs from 'fs';
import websocketEventsEnum from '../websocketEventsEnum';

const doUpload = async (list: LIST, stream: fs.ReadStream, callback: types.UploadProgressCallback): Promise<string> =>
    new Promise(async (resolve, reject) => {
        const wsClient = list.wsClient;
        if (wsClient === undefined) {
            reject(new Error('WebSocket client not connected'));
            return;
        }

        let pcapId: string | undefined = undefined;
        let messages: IEventInfo[] = [];

        const handleMessage = (msg: IEventInfo) => {
            messages.push(msg);
            if (pcapId !== undefined) {
                const x = pcapId;
                messages.forEach(msg => processMessage(x, msg));
                messages = [];
            }
        };

        wsClient.on('message', handleMessage);

        const processMessage = (actualPcapId: string, msg: IEventInfo) => {
            console.log(JSON.stringify(msg));
            if (msg.event === websocketEventsEnum.PCAP.FILE_PROCESSING_DONE) {
                wsClient.off('message', handleMessage);
                resolve(actualPcapId);
            }
        };

        const uploadResult = await list.pcap.upload('A pcap file', stream, callback);

        console.log(`Upload returned: ${JSON.stringify(uploadResult)}`);

        pcapId = uploadResult.uuid;

        if (pcapId !== undefined) {
            const x = pcapId;
            messages.forEach(msg => processMessage(x, msg));
            messages = [];
        }
    });

export const run = async (args: IArgs) => {
    if (!args._ || args._.length < 2) {
        throw new Error('No pcap file');
    }

    const pcapFile = args._[1];

    const list = new LIST(args.baseUrl);

    try {
        await list.login(args.username, args.password);

        const stream = fs.createReadStream(pcapFile);

        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);

        const pcapId = await doUpload(list, stream, callback);

        console.log(`PCAP ID: ${pcapId}`);
    } catch (err) {
        console.error(`Error uploading file: ${err.toString()}`);
    } finally {
        await list.close();
    }
};
