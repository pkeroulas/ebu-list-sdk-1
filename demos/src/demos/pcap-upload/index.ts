import { LIST, types } from '@bisect/ebu-list-sdk';
import fs from 'fs';
import path from 'path';
import { v1 as uuid } from 'uuid';
import { IArgs } from '../../types';

const doUpload = async (list: LIST, stream: fs.ReadStream, name: string, callback: types.UploadProgressCallback): Promise<string> =>
    new Promise(async (resolve, reject) => {
        let pcapId: string | undefined = uuid();
        const timeoutMs = 120000; // It may be necessary to increase timeout due to the size of the pcap file

        const upload = await list.pcap.upload(name, stream, callback, pcapId);
        const uploadAwaiter = list.pcap.makeUploadAwaiter(upload.uuid, timeoutMs);
        const uploadResult = await uploadAwaiter;

        if (!uploadResult) {
            reject(new Error('Pcap processing undefined'));
            return;
        }
        console.log(`User Pcap Id: ${pcapId}`);

        console.log(`Pcap: ${JSON.stringify(uploadResult)}`);

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
        const basename = path.basename(pcapFile, 'pcap')

        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);

        const pcapId = await doUpload(list, stream, basename, callback);

        console.log(`PCAP ID: ${pcapId}`);
    } catch (err) {
        console.error(`Error uploading file: ${err.toString()}`);
    } finally {
        await list.close();
    }
};
