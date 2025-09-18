

export interface ISubscription {
    name: string;
    price: string;
    type: 'annually' | 'monthly';
    details: string[];
}


export interface IUpdateSubscription extends ISubscription {
    id: string;
}