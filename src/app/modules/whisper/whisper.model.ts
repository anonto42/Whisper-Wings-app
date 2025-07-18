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
    whisperDescription: {
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
    whisperAudioFile: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

export const Whisper = model<IWhisper>("Whisper", whisperSchema)
