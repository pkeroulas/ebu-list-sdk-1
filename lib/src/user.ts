import { Transport } from '@bisect/bisect-core-ts';
import { IUserInfo } from './api/user';

/// ///////////////////////////////////////////////////////////////////////////

export default class User {
    public constructor(private readonly transport: Transport) {
        this.transport = transport;
    }

    public async create(username: string, password: string): Promise<void> {
        const data = {
            username,
            password,
        };
        const response = await this.transport.post('/user/register', data);
        return response;
    }

    public async getInfo(): Promise<IUserInfo> {
        const response = await this.transport.get(`/api/user`);
        const userInfo: IUserInfo = response;
        return userInfo;
    }

    public async delete(data: any): Promise<void> {
        const response = await this.transport.post(`/api/user/delete`, data);
        return response;
    }

    public async updateUserPreferences(value: any): Promise<void> {
        const response = await this.transport.patch(`/api/user/preferences`, { value });
        return response;
    }

    public async updateUserReadOnly(value: boolean): Promise<void> {
        const response = await this.transport.patch(`/api/user/read-only`, { value });
        return response;
    }

    public async acceptGDPR(data: any): Promise<void> {
        const response = await this.transport.post(`/api/user/gdpr`, data);
        return response;
    }

    public async getGDPRStatus(): Promise<any> {
        const response = await this.transport.get(`/api/user/gdpr`);
        return response;
    }
}
