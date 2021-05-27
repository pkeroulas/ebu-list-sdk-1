export interface IDownloadManagerDataContent {
    availableon: string;
    availableonfancy: string;
    availableuntil: string;
    availableuntilfancy: string;
    name: string;
    nameondisk: string;
    path: string;
    type: string;
    __v: number;
    _id: string;
}

export interface IDownloadManagerData {
    data: IDownloadManagerDataContent[];
}
