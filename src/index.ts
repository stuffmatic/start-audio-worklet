export class WebAssemblyNotSupportedError extends Error {}
export class AudioWorkletNotSupportedError extends Error {}
export class WebAssemblyFetchError extends Error {}

export interface AudioWorkletOptions {
  workletNodeName: string
  workletSrcUrl: string
  workletNodeOptions: AudioWorkletNodeOptions
  sampleRate?: number
  wasmUrl?: string
  requireMicAccess?: boolean
}

export async function startAudioWorklet(options: AudioWorkletOptions): Promise<AudioWorkletNode> {
  const defaultSampleRate = 44100;
  const sampleRate = options.sampleRate ?? defaultSampleRate

  let contextOptions: AudioContextOptions = { sampleRate, latencyHint: "interactive" }
  let context: any
  if ((window as any).webkitAudioContext) {
    // AudioContext is undefined in Safari and old versions of Chrome
    context = new ((window as any).webkitAudioContext)(contextOptions)
  } else {
    context = new AudioContext(contextOptions)
  }

  const wasmIsSupported = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function"
  if (!wasmIsSupported && options.wasmUrl !== undefined) {
    throw new WebAssemblyNotSupportedError("WebAssembly is not supported in this browser")
  }

  const audioWorkletIsSupported = context.audioWorklet !== undefined
  if (!audioWorkletIsSupported) {
    throw new AudioWorkletNotSupportedError("AudioWorklet is not supported in this browser")
  }

  let micStream = null
  if (options.workletNodeOptions.numberOfInputs ?? 0 > 0) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch (e) {
      if (options.requireMicAccess) {
        throw e
      }
    }
  }

  const urlTimestampSuffix = "?t=" + new Date().getTime()
  await context.audioWorklet.addModule(options.workletSrcUrl + urlTimestampSuffix)

  const workletNode = new AudioWorkletNode(
    context,
    options.workletNodeName,
    options.workletNodeOptions
  )

  if (micStream != null) {
    const micSource = context.createMediaStreamSource(micStream)
    micSource.connect(workletNode)
  }

  const wasmUrl = options.wasmUrl
  if (wasmUrl) {
    const fetchResult = await fetch(wasmUrl + urlTimestampSuffix)
    if (!fetchResult.ok) {
      throw new WebAssemblyFetchError("wasm fetch failed with status " + fetchResult.status)
    }
    const wasmData = fetchResult.arrayBuffer()
    workletNode.port.postMessage({ type: 'wasmData', data: wasmData })
  }

  return workletNode
}
