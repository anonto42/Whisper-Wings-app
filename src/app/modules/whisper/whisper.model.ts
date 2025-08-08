import { model, Schema} from "mongoose"
import { IWhisper } from "./whisper.interface"

const whisperSchema = new Schema<IWhisper>({
    whisperCoverImage: {
        type: String,
        required: true
    },
    whisperName: {
        type: String,
        required: true
    },
    whisperCategory: {
        type: String,
        required: true
    },
    whisperSherpas: {
        type: String,
        required: true
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
    },
}, {
    timestamps: true
})

export const Whisper = model<IWhisper>("Whisper", whisperSchema)
