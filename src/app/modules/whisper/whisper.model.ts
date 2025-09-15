import { model, Schema, Types} from "mongoose"
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
        enum: ['Hushabies', 'WhisperPedia Wonderings', 'Feather Stories'],
        required: true
    },
    whisperSherpas: {
        type: String,
        required: true
    },
    parts:{
        type: [Types.ObjectId],
        ref: "Whisper-part"
    }
}, {
    timestamps: true
})

export const Whisper = model<IWhisper>("Whisper", whisperSchema);