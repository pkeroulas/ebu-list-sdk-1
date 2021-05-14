import { Transport } from '@bisect/bisect-core-ts';
import { IVersion } from './types';

//////////////////////////////////////////////////////////////////////////////

export default class Info {
    public constructor(private readonly transport: Transport) {}

    public async getVersion(): Promise<IVersion> {
        const response = await this.transport.get('/api/meta/version');
        const version: IVersion = response as IVersion;
        return version;
    }
}
