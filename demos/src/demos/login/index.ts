import { LIST } from '../../../../lib/dist';
import { IArgs } from '../../types';

export const run = async (args: IArgs) => {
    const list = new LIST(args.baseUrl);
    await list.login(args.username, args.password);
    try {
        console.log('Connected');
        const version = await list.info.getVersion();
        console.log(JSON.stringify(version));
    } catch (e: any) {
        console.log(`Error: ${e.toString()}`);
    } finally {
        await list.close();
    }
};
