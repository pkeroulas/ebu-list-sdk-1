import { LIST } from '../../../../lib/dist';
import { IArgs } from '../../types';

export const run = async (args: IArgs) => {
    const list = new LIST(args.baseUrl);
    await list.login(args.username, args.password);
    try {
        console.log('Connected');
        const path = await list.stream.downloadAncillaryUrl(
            '8f0c2398-4d1e-4e79-b088-d2d2afdeeed9',
            '0bf6d466-a3c1-4df2-87c3-216b226a5108',
            '2f0c653d-5e2d-4a26-afd1-db9d7f618e96.raw'
        );
        const text = await list.stream.downloadText(path);
        console.log(JSON.stringify(text));
    } catch (e) {
        console.log(`Error: ${JSON.stringify(e)}`);
    } finally {
        await list.close();
    }
};
