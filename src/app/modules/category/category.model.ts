import { model, Schema } from "mongoose";
import { ICatagory } from "./catagory.interface";

const categorySchema = new Schema<ICatagory>({
    name: {
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


export const Category = model<ICatagory>("category", categorySchema);