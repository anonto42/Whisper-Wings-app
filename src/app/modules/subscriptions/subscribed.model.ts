import { model, Schema, Types } from "mongoose";

interface ISubscribed {
    userId: Types.ObjectId;
    subscriptionId: Types.ObjectId;
}

const subscribedSchema = new Schema<ISubscribed>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "subscription"
    }
},{ timestamps: true });

export const Subscribed = model<ISubscribed>("subscribed", subscribedSchema);