export declare class WebAssemblyNotSupportedError extends Error {
}
export declare class AudioWorkletNotSupportedError extends Error {
}
export declare class WebAssemblyFetchError extends Error {
}
export interface AudioWorkletOptions {
    workletNodeName: string;
    workletSrcUrl: string;
    workletNodeOptions: AudioWorkletNodeOptions;
    sampleRate?: number;
    wasmUrl?: string;
    requireMicAccess?: boolean;
}
export declare function startAudioWorklet(options: AudioWorkletOptions): Promise<AudioWorkletNode>;
