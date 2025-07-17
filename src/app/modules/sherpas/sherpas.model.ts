import  { model, Schema} from "mongoose";
import { ISherpa } from "./sharpas.interface";


const sherpaSchema = new Schema<ISherpa>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
},{timestamps: true});

export const Sherpa = model<ISherpa>("sherpa", sherpaSchema);
