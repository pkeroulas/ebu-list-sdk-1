import { LIST, types } from '@bisect/ebu-list-sdk';
import fs from 'fs';
import { v1 as uuid } from 'uuid';
import { IArgs } from '../../types';

const doUpload = async (list: LIST, stream: fs.ReadStream, callback: types.UploadProgressCallback): Promise<string> =>
    new Promise(async (resolve, reject) => {
        const wsClient = list.wsClient;
        if (wsClient === undefined) {
            reject(new Error('WebSocket client not connected'));
            return;
        }

        let pcapId: string | undefined = uuid();
        const timeoutMs = 120000; // It may be necessary to increase timeout due to the size of the pcap file

        const upload = await list.pcap.upload('A pcap file', stream, callback, pcapId);
        const uploadAwaiter = list.pcap.makeUploadAwaiter(upload.uuid, timeoutMs);
        const uploadResult = await uploadAwaiter;

        if (!uploadResult) {
            reject(new Error('Pcap processing undefined'));
            return;
        }
        console.log(`User Pcap Id: ${pcapId}`);

        console.log(`Awaiter: ${JSON.stringify(uploadResult)}`);

        pcapId = uploadResult.id;

        if (!pcapId) {
            reject(new Error('Pcap id undefined'));
            return;
        }

        resolve(pcapId);
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
