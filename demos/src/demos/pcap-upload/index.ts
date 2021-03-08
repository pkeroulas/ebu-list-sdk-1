import { LIST } from '@bisect/ebu-list-sdk';
import { IArgs, IEventInfo } from '../../types';
import fs from 'fs';
import websocketEventsEnum from '../websocketEventsEnum';

const doUpload = async (list: LIST, stream: fs.ReadStream): Promise<string> =>
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

        const uploadResult = await list.pcap.upload('A pcap file', stream);

        console.log('Upload returned');

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
    await list.login(args.username, args.password);

    const stream = fs.createReadStream(pcapFile);

    const pcapId = await doUpload(list, stream);

    console.log(`PCAP ID: ${pcapId}`);

    await list.close();
};
