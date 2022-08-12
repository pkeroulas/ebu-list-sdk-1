import { LIST, types } from '@bisect/ebu-list-sdk';
import fs from 'fs';
import { readFile } from 'fs/promises';
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
        const name = path.basename(pcapFile, 'pcap');
        const pcapId: string = uuid();
        const timeoutMs = 120000; // It may be necessary to increase timeout due to the size of the pcap file
        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);

        console.log(`Pcap Id: ${pcapId}`);

        if (args.sdp) {
            await list.pcap.onlyInsertInDatabase(name, stream, callback, pcapId);
            const sdp = await readFile(args.sdp);
            const patch = { sdps: [sdp.toString()] };
            await list.pcap.patch(pcapId, patch);
        } else {
            const uploadAwaiter = list.pcap.makeUploadAwaiter(pcapId, timeoutMs);
            await list.pcap.upload(name, stream, callback, pcapId);

            // If on the same file system, could use the following
            // await list.pcap.uploadLocal(name, pcapFile, pcapId);

            const uploadResult = await uploadAwaiter;

            if (!uploadResult) {
                throw new Error('Pcap processing undefined');
            }
        }
    } catch (err) {
        console.error(`Error uploading file`);
        console.dir(err);
    } finally {
        await list.close();
    }
};
