/**
 * The browser does not support WebAssembly.
 */
export class WebAssemblyNotSupportedError extends Error {
  constructor() {
    super("WebAssembly is not supported in this browser.")
    this.name = "WebAssemblyNotSupportedError"
  }
}
/**
 * The browser does not support audio worklets.
 */
export class AudioWorkletNotSupportedError extends Error {
  constructor() {
    super("AudioWorlket is not supported in this browser.")
    this.name = "AudioWorkletNotSupportedError"
  }
}
/**
 * Failed to fetch the WebAssembly module at the specified URL.
 */
export class WebAssemblyFetchError extends Error {
  constructor(url: string, httpStatus: number) {
    super("Fetching WebAssembly module from " + url + " failed with status " + httpStatus)
    this.name = "WebAssemblyFetchError"
  }
}

/**
 * Determines how to handle microphone access.
 */
export enum MicrophoneMode {
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
export interface StartAudioWorkletOptions {
  /**
   * The name used when registering the worklet processor with `registerProcessor`.
   */
  workletNodeName: string
  /**
   * The URL of the audio worklet processor source file.
   */
  workletProcessorUrl: string
  /**
   * Options passed to the `AudioWorkletNode` constructor.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode
   */
  workletNodeOptions: AudioWorkletNodeOptions
  /**
   * Used to override the default options passed to the `AudioContext` constructor. Optional.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#parameters
   */
  audioContextOptions?: AudioContextOptions
  /**
   * Options to pass when creating the microphone input
   * stream using `getUserMedia`. If not specified, no options are passed.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#properties_of_audio_tracks
   */
  microphoneStreamOptions?: MediaTrackConstraints
  /**
   * An optional URL to a WebAssembly module to load. The module data is stored
   * in the `wasmData` attribute of the options object passed to the processor's constructor.
   */
  wasmUrl?: string
  /**
   * Determines how to handle microphone access. Defaults to `required` if not specified.
   * @see MicrophoneMode.
   * */
  microphoneMode?: MicrophoneMode
  /**
   * By default, a `?t=[timestamp]` suffix is added to `workletProcessorUrl` and `wasmUrl`
   * in order to prevent caching. Set this flag to true to disable this behavior.
   */
  disableUrlTimestampSuffix?: boolean
}

/**
 * Start and create an audio worklet node.
 * @param options See AudioWorkletOptions
 * @returns A promise that resolves with the created AudioWorkletNode.
 */
export async function startAudioWorklet(options: StartAudioWorkletOptions): Promise<AudioWorkletNode> {
  // If WebAssembly is used, make sure it's supported by the browser
  const wasmIsSupported = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function"
  if (!wasmIsSupported && options.wasmUrl !== undefined) {
    throw new WebAssemblyNotSupportedError()
  }

  // Create web audio context
  let contextOptions: AudioContextOptions = { sampleRate: 44100, latencyHint: "interactive" }
  if (options.audioContextOptions !== undefined) {
    contextOptions = { ...contextOptions, ...options.audioContextOptions}
  }
  let context: any
  if ((window as any).webkitAudioContext) {
    // AudioContext is undefined in Safari and old versions of Chrome
    context = new ((window as any).webkitAudioContext)(contextOptions)
  } else {
    context = new AudioContext(contextOptions)
  }
  // Make sure the context is running (starts out suspended in Safari)
  context.resume()

  // Make sure the browser supports audio worklets
  const audioWorkletIsSupported = context.audioWorklet !== undefined
  if (!audioWorkletIsSupported) {
    throw new AudioWorkletNotSupportedError()
  }

  // Request microphone access?
  const microphoneMode = options.microphoneMode ?? MicrophoneMode.required
  let micStream: MediaStream | null = null
  const atLeastOneInputIsRequested = options.workletNodeOptions.numberOfInputs ?? 0 > 0
  if (atLeastOneInputIsRequested && microphoneMode != MicrophoneMode.disabled) {
    try {
      const audioConstraints = options.microphoneStreamOptions ?? true
      micStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false })
    } catch (e) {
      if (microphoneMode == MicrophoneMode.required) {
        throw e
      }
    }
  }

  // A URL suffix used to prevent caching of the worklet processor
  // and WebAssembly src.
  const urlSuffix = !options.disableUrlTimestampSuffix ? "?t=" + new Date().getTime() : ""

  await context.audioWorklet.addModule(options.workletProcessorUrl + urlSuffix)
  const workletNodeOptions = options.workletNodeOptions

  // Load WebAssembly module, if specified.
  const wasmUrl = options.wasmUrl
  let wasmData: ArrayBuffer | null = null
  if (wasmUrl) {
    const urlToFetch = wasmUrl + urlSuffix
    const fetchResult = await fetch(urlToFetch)
    if (!fetchResult.ok) {
      throw new WebAssemblyFetchError(urlToFetch, fetchResult.status)
    }
    wasmData = await fetchResult.arrayBuffer()
  }

  // Add the actual sample rate to the worklet processor options
  // so it can be accessed by the processor if needed.
  workletNodeOptions.processorOptions = {
    ...workletNodeOptions.processorOptions,
    "sampleRate": context.sampleRate,
    wasmData
  }

  // Create audio worklet node
  const workletNode = new AudioWorkletNode(
    context,
    options.workletNodeName,
    options.workletNodeOptions
  )

  // Connect outputs, if any
  if (workletNode.numberOfOutputs > 0) {
    workletNode.connect(context.destination)
  }

  // If there is a microphone stream, connect it to the worklet node
  if (micStream != null) {
    const micSource = context.createMediaStreamSource(micStream)
    micSource.connect(workletNode)
  }

  return workletNode
}
