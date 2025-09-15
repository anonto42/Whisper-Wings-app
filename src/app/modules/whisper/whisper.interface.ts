import { Types } from "mongoose";

export interface IWhisper {
    _id: string;
    whisperName: string;
    whisperSherpas: string;
    whisperCategory: string;
    whisperCoverImage: string;
    parts: Types.ObjectId[]
};

export interface IWhisperUpdate extends IWhisper {
    id: string
}