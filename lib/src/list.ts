import { Unwinder, Transport, RestClient, get, post, WSCLient } from '@bisect/bisect-core-ts';
import * as apiTypes from './api';
import { AuthClient, ILoginData, IApiHandler, IGenericResponse, ILoginResponse } from './auth';
import Info from './info';
import User from './user';
import Live from './live';
import Pcap from './pcap';
import Stream from './stream';
import DownloadManager from './downloadManager';
import Workflows from './workflows';
import TokenStorage from './tokenStorage';
import { IListOptions } from './types';
import StreamComparison from './streamComparison';

// ////////////////////////////////////////////////////////////////////////////

const makeApiHandler = (baseUrl: string): IApiHandler => ({
    login: async (data: ILoginData): Promise<IGenericResponse<ILoginResponse>> =>
        post(baseUrl, null, '/auth/login', data),
    revalidateToken: async (token: string): Promise<IGenericResponse<ILoginResponse>> =>
        get(baseUrl, token, '/api/user/revalidate-token'),
});

export default class LIST {
    private readonly transport: Transport;

    private readonly authClient: AuthClient;

    private readonly rest: RestClient;

    private ws?: WSCLient = undefined;

    public constructor(private readonly baseUrl: string, options: IListOptions = {}) {
        const unwinder = new Unwinder();

        try {
            const apiHandler = makeApiHandler(baseUrl);
            const storage = options.tokenStorage ?? new TokenStorage();
            this.authClient = new AuthClient(apiHandler, storage);
            unwinder.add(() => this.authClient.close());

            const wsGetter = () => {
                if (this.ws === undefined) {
                    throw new Error('Not logged in');
                }
                return this.ws.client;
            };
            const unauthorizedResponse = (code: number | undefined): boolean => {
                if (code === 401 || code === 402 || code === 403) {
                    options.handleUnauthorized?.();
                    return false;
                }

                return true;
            };
            this.rest = new RestClient(baseUrl, this.authClient.getToken.bind(this.authClient), unauthorizedResponse);

            this.transport = new Transport(this.rest, wsGetter);

            const token = this.getToken();
            if (token) {
                this.setToken(token);
            }

            unwinder.reset();
        } finally {
            unwinder.unwind();
        }
    }

    public async login(username: string, password: string): Promise<void> {
        const loginError = await this.authClient.login(username, password);
        if (loginError) {
            throw loginError;
        }
        const user: apiTypes.user.IUserInfo = (await this.rest.get('/api/user')) as apiTypes.user.IUserInfo;
        this.ws = new WSCLient(this.baseUrl, '/socket', user.id);
    }

    public async close(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }

        this.authClient.close();
    }

    public get wsClient(): SocketIOClient.Socket | undefined {
        return this.ws?.client;
    }

    public reconnectWsClient(userId: string): void {
        this.ws = new WSCLient(this.baseUrl, '/socket', userId);
    }

    public get info(): Info {
        return new Info(this.transport);
    }

    public get user(): User {
        return new User(this.transport);
    }

    public get live(): Live {
        return new Live(this.transport);
    }

    public get pcap(): Pcap {
        return new Pcap(this.transport);
    }

    public get downloadManager(): DownloadManager {
        return new DownloadManager(this.transport);
    }

    public get workflows(): Workflows {
        return new Workflows(this.transport);
    }

    public get stream(): Stream {
        return new Stream(this.transport);
    }

    public get streamComparison(): StreamComparison {
        return new StreamComparison(this.transport);
    }

    public async logout(): Promise<void> {
        this.authClient.logout();
        return this.transport.post('/auth/logout', {});
    }

    public getToken(): string {
        return this.authClient.getToken();
    }

    public setToken(token: string): void {
        return this.authClient.setToken(token);
    }
}
