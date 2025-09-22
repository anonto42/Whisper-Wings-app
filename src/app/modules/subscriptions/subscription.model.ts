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
        enum: ["annually", "monthly"],
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    price: {
        type: String,
        required: true
    },
    details: {
        type: [String],
        required: true
    }
},{ timestamps: true });

export const Subscription = model<ISubscription>("subscription", subscriptionSchema);