/**
 * The browser does not support WebAssembly.
 */
export declare class WebAssemblyNotSupportedError extends Error {
}
/**
 * The browser does not support audio worklets.
 */
export declare class AudioWorkletNotSupportedError extends Error {
}
/**
 * Failed to fetch the WebAssembly module at the specified URL.
 */
export declare class WebAssemblyFetchError extends Error {
}
/**
 * Determines how to handle microphone access.
 */
export declare enum MicrophoneMode {
    /**
     * Mic access is requested if the number of inputs
     * specified in the worklet node options is greater than zero.
     * No error is thrown if access is denied.
     */
    optional = "optional",
    /**
     * Mic access is requested if the number of inputs
     * specified in the worklet node options is greater than zero.
     * An error is thrown if access is denied.
     */
    required = "required",
    /**
     * Mic access is not requested, regardless of the number of inputs
     * specified in the worklet node options.
     */
    disabled = "disabled"
}
/**
 * Options passed to startAudioWorklet.
 */
export interface AudioWorkletOptions {
    /**
     * The name used when registering the worklet processor with `registerProcessor`.
     */
    workletNodeName: string;
    /**
     * The URL of the audio worklet processor source file.
     */
    workletProcessorUrl: string;
    /**
     * Options passed to the AudioWorkletNode constructor.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode
     */
    workletNodeOptions: AudioWorkletNodeOptions;
    /**
     * The desired sample rate. Defaults to 44100 Hz if not specified
     */
    sampleRate?: number;
    /**
     * A URL to a WebAssembly module that is loaded and sent to the worklet processor
     * via its message port. The message has the form `{ "type": "wasmData", "data": ... }`.
     */
    wasmUrl?: string;
    /**
     * Determines how to handle microphone access.
     * @see MicrophoneMode.
     * */
    microphoneMode?: MicrophoneMode;
}
/**
 * Start and create an audio worklet node.
 * @param options See AudioWorkletOptions
 * @returns A promise that resolves with the created AudioWorkletNode.
 */
export declare function startAudioWorklet(options: AudioWorkletOptions): Promise<AudioWorkletNode>;
