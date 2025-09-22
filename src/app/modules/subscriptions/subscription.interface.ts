

export interface ISubscription {
    name: string;
    price: string;
    isDeleted: boolean;
    type: 'annually' | 'monthly';
    details: string[];
}


export interface IUpdateSubscription extends ISubscription {
    id: string;
}