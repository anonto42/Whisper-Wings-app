import { model, Schema } from "mongoose";
import { ISubscription } from "./subscription.interface";

const subscriptionSchema = new Schema<ISubscription>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["yearly", "monthly"],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    details: {
        type: [String],
        required: true
    }
},{ timestamps: true });

export const Subscription = model<ISubscription>("subscription", subscriptionSchema);