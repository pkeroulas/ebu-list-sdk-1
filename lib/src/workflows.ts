import { Transport } from '@bisect/bisect-core-ts';

// ////////////////////////////////////////////////////////////////////////////

export default class Workflows {
    public constructor(private readonly transport: Transport) {}

    public async getAll(): Promise<any> {
        return this.transport.get(`/api/workflow/`);
    }

    public async create(info: any): Promise<any> {
        return this.transport.post(`/api/workflow/`, info);
    }

    public async cancel(info: any): Promise<any> {
        return this.transport.putForm(`/api/workflow/`, info);
    }
}
