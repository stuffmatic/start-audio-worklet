/**
 * The browser does not support WebAssembly.
 */
export class WebAssemblyNotSupportedError extends Error {}
/**
 * The browser does not support audio worklets.
 */
export class AudioWorkletNotSupportedError extends Error {}
/**
 * Failed to fetch the WebAssembly module at the specified URL.
 */
export class WebAssemblyFetchError extends Error {}

/**
 * Determines how to handle microphone access.
 */
export enum MicrophoneMode {
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
  workletNodeName: string
  /**
   * The URL of the audio worklet processor source file.
   */
  workletProcessorUrl: string
  /**
   * Options passed to the AudioWorkletNode constructor.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode
   */
  workletNodeOptions: AudioWorkletNodeOptions
  /**
   * The desired sample rate. Defaults to 44100 Hz if not specified
   */
  sampleRate?: number
  /**
   * A URL to a WebAssembly module that is loaded and sent to the worklet processor
   * via its message port. The message has the form `{ "type": "wasmData", "data": ... }`.
   */
  wasmUrl?: string
  /**
   * Determines how to handle microphone access.
   * @see MicrophoneMode.
   * */
  microphoneMode?: MicrophoneMode
}

/**
 * Start and create an audio worklet node.
 * @param options See AudioWorkletOptions
 * @returns A promise that resolves with the created AudioWorkletNode.
 */
export async function startAudioWorklet(options: AudioWorkletOptions): Promise<AudioWorkletNode> {
  const defaultSampleRate = 44100;
  const sampleRate = options.sampleRate ?? defaultSampleRate
  const microphoneMode = options.microphoneMode ?? MicrophoneMode.optional

  // If WebAssembly is used, make sure it's supported by the browser
  const wasmIsSupported = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function"
  if (!wasmIsSupported && options.wasmUrl !== undefined) {
    throw new WebAssemblyNotSupportedError("WebAssembly is not supported in this browser")
  }

  // Create web audio context
  let contextOptions: AudioContextOptions = { sampleRate, latencyHint: "interactive" }
  let context: any
  if ((window as any).webkitAudioContext) {
    // AudioContext is undefined in Safari and old versions of Chrome
    context = new ((window as any).webkitAudioContext)(contextOptions)
  } else {
    context = new AudioContext(contextOptions)
  }

  // Make sure the browser supports audio worklets
  const audioWorkletIsSupported = context.audioWorklet !== undefined
  if (!audioWorkletIsSupported) {
    throw new AudioWorkletNotSupportedError("AudioWorklet is not supported in this browser")
  }

  // Request microphone access.
  let micStream = null
  const atLeastOneInputIsRequested = options.workletNodeOptions.numberOfInputs ?? 0 > 0
  if (atLeastOneInputIsRequested && microphoneMode != MicrophoneMode.disabled) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch (e) {
      if (microphoneMode == MicrophoneMode.required) {
        throw e
      }
    }
  }

  // A URL suffix used to prevent caching of the worklet processor
  // and WebAssembly src.
  const urlTimestampSuffix = "?t=" + new Date().getTime()

  // Create audio worklet node
  await context.audioWorklet.addModule(options.workletProcessorUrl + urlTimestampSuffix)
  const workletNode = new AudioWorkletNode(
    context,
    options.workletNodeName,
    options.workletNodeOptions
  )
  workletNode.connect(context.destination)

  // If there is a microphone stream, connect it to the worklet node
  if (micStream != null) {
    const micSource = context.createMediaStreamSource(micStream)
    micSource.connect(workletNode)
  }

  // Load WebAssembly module, if specified, and send it to the worklet node
  const wasmUrl = options.wasmUrl
  if (wasmUrl) {
    const fetchResult = await fetch(wasmUrl + urlTimestampSuffix)
    if (!fetchResult.ok) {
      throw new WebAssemblyFetchError("WebAssembly fetch failed with status " + fetchResult.status)
    }
    const wasmData = await fetchResult.arrayBuffer()
    workletNode.port.postMessage({ type: 'wasmData', data: wasmData })
  }

  return workletNode
}
