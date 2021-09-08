import { LIST, types } from '@bisect/ebu-list-sdk';
import fs from 'fs';
import path from 'path';
import { v1 as uuid } from 'uuid';
import { IArgs } from '../../types';

export const run = async (args: IArgs) => {
    if (!args._ || args._.length < 2) {
        throw new Error('No pcap file');
    }

    const pcapFile = args._[1];

    const list = new LIST(args.baseUrl);

    try {
        await list.login(args.username, args.password);

        const stream = fs.createReadStream(pcapFile);
        const name = path.basename(pcapFile, 'pcap')
        const pcapId: string = uuid();
        const timeoutMs = 120000; // It may be necessary to increase timeout due to the size of the pcap file
        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
    
        const uploadAwaiter = list.pcap.makeUploadAwaiter(pcapId, timeoutMs);
        await list.pcap.upload(name, stream, callback, pcapId);
        const uploadResult = await uploadAwaiter;
    
        if (!uploadResult) {
            throw new Error('Pcap processing undefined');
        }
        console.log(`Pcap Id: ${pcapId}`);
    
        console.log(`Pcap: ${JSON.stringify(uploadResult)}`);
    } catch (err: any) {
        console.error(`Error uploading file: ${err.toString()}`);
    } finally {
        await list.close();
    }
};
