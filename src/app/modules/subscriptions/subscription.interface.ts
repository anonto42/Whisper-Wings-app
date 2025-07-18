

export interface ISubscription {
    name: string;
    price: number;
    type: 'yearly' | 'monthly';
    details: string[];
}


export interface IUpdateSubscription extends ISubscription {
    id: string;
}