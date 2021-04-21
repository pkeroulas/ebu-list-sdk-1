import { Transport } from '@bisect/bisect-core-ts';
import { IUserInfo } from './api/user';

/// ///////////////////////////////////////////////////////////////////////////

export default class User {
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

    public async getUser(): Promise<IUserInfo> {
        return await this.transport.get(`/api/user`);
    }

    public async deleteUser(data: any): Promise<any> {
        return await this.transport.post(`/api/user/delete`, data);
    }

    public async updateUserPreferences(value: any): Promise<any> {
        return await this.transport.patch(`/api/user/preferences`, { value });
    }
}
