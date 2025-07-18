

export interface IWhisper {
    whisperCoverImage: string;
    whisperName: string;
    whisperDescription: string;
    whisperCategory: string;
    whisperSherpas: string;
    whisperAudioFile: string;
}

export interface IWhisperUpdate extends IWhisper {
    id: string
}

