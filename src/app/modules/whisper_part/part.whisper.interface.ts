import { Types } from "mongoose";

export interface IWhisperPart {
    part: number;
    parent_id: Types.ObjectId;
    EnglishFile: string;
    DeutschFile: string;
    FrancaisFile: string;
    EspanolFile: string;
    EnglishLRC: string;
    DeutschLRC: string;
    FrancaisLRC: string;
    EspanolLRC: string;
}