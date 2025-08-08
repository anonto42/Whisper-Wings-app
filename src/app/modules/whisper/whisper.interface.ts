

export interface IWhisper {
    timer: '7' | '12' | '20' | '0';
    whisperName: string;
    whisperSherpas: string;
    whisperCategory: string;
    whisperCoverImage: string;
    EnglishFile: string;
    DeutschFile: string;
    FrancaisFile: string;
    EspanolFile: string;
    EnglishLRC: string;
    DeutschLRC: string;
    FrancaisLRC: string;
    EspanolLRC: string;
}

export interface IWhisperUpdate extends IWhisper {
    id: string
}

