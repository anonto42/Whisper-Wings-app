import { model, Schema } from "mongoose";
import { IWhisperPart } from "./part.whisper.interface";

const WhisperPartSchema = new Schema<IWhisperPart>({
    parent_id:{
        type: Schema.Types.ObjectId,
        ref: "Whisper"
    },
    part: {
        type: Number,
        unique: true,
        required: [true, "You must give your whisper part index"]
    },
    EnglishFile: {
        type: String,
        required: true
    },
    DeutschFile: {
        type: String,
        required: true
    },
    FrancaisFile: {
        type: String,
        required: true
    },
    EspanolFile: {
        type: String,
        required: true
    },
    EnglishLRC: {
        type: String,
        required: true
    },
    DeutschLRC: {
        type: String,
        required: true
    },
    FrancaisLRC: {
        type: String,
        required: true
    },
    EspanolLRC: {
        type: String,
        required: true
    }
},{ 
    timestamps: true,
    versionKey: false
});

export const whisperPart = model<IWhisperPart>("Whisper-part", WhisperPartSchema);