/**
 * The browser does not support WebAssembly.
 */
export declare class WebAssemblyNotSupportedError extends Error {
    constructor();
}
/**
 * The browser does not support audio worklets.
 */
export declare class AudioWorkletNotSupportedError extends Error {
    constructor();
}
/**
 * Failed to fetch the WebAssembly module at the specified URL.
 */
export declare class WebAssemblyFetchError extends Error {
    constructor(url: string, httpStatus: number);
}
/**
 * Determines how to handle microphone access.
 */
export declare enum MicrophoneMode {
    /**
     * Mic access is requested if the number of inputs
     * specified in the worklet node options is greater than zero.
     * An error is thrown if access is denied.
     * This is the default mode.
     */
    required = "required",
    /**
     * Mic access is requested if the number of inputs
     * specified in the worklet node options is greater than zero.
     * No error is thrown if access is denied.
     */
    optional = "optional",
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
     * Options passed to the `AudioWorkletNode` constructor.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode
     */
    workletNodeOptions: AudioWorkletNodeOptions;
    /**
     * Used to override the default options passed to the `AudioContext` constructor. Optional.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#parameters
     */
    audioContextOptions?: AudioContextOptions;
    /**
     * Options to pass when creating the microphone input
     * stream using `getUserMedia`. If not specified, no options are passed.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_audio_tracks
     */
    microphoneStreamOptions?: MediaTrackConstraints;
    /**
     * An optional URL to a WebAssembly module to load. The module data is stored
     * in the `wasmData` attribute of the options object passed to the processor's constructor.
     */
    wasmUrl?: string;
    /**
     * Determines how to handle microphone access. Defaults to `required` if not specified.
     * @see MicrophoneMode.
     * */
    microphoneMode?: MicrophoneMode;
    /**
     * By default, a `?t=[timestamp]` suffix is added to `workletProcessorUrl` and `wasmUrl`
     * in order to prevent caching. Set this flag to true to disable this behavior.
     */
    disableUrlTimestampSuffix?: boolean;
}
/**
 * Start and create an audio worklet node.
 * @param options See AudioWorkletOptions
 * @returns A promise that resolves with the created AudioWorkletNode.
 */
export declare function startAudioWorklet(options: AudioWorkletOptions): Promise<AudioWorkletNode>;
