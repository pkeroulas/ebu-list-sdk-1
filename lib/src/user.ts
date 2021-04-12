import { Transport } from '@bisect/bisect-core-ts';

//////////////////////////////////////////////////////////////////////////////

export class User {
    public constructor(private readonly transport: Transport) {
        this.transport = transport;
    }

    public async create(username: string, password: string) {
        const data = {
            username: username,
            password: password,
        };

        return await this.transport.post('/user/register', data);
    }
}
