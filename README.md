# What is this?

`start-audio-worklet` provides a dead simple, single function API for creating and starting [audio worklets](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode), which provide low latency audio processing in [modern web browsers](https://caniuse.com/?search=AudioWorklet). It takes care of requesting microphone access, error handling and browser specific quirks so you don't have to.

# Adding the library to your project

## As an ES module

Add `start-audio-worklet` to your `package.json` and import the library like so:

```import { startAudioWorklet } from "start-audio-worklet"```

## As a standalone javascript file

The standalone version [`lib/start_audio_worklet.js`](lib/start_audio_worklet.js) can be used directly in an HTML file by adding a script tag like this

```<script src="/some/url/to/start_audio_worklet.js"></script>```

# Usage

The `startAudioWorklet` function is used to create and start an audio worklet:

```javascript
const options = {
  workletProcessorUrl: "my_worklet_processor.js",
  workletNodeName: "my_worklet",
  workletNodeOptions: {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [2]
  }
}

startAudioWorklet(options)
  .then((workletNode) => {
    // The worklet was started.
    // workletNode is the AudioWorkletNode instance
  })
  .catch((error) => {
    // Something went wrong. Handle error.
  })
```

See [`AudioWorkletOptions`](src/index.ts#L56) for allowed attributes of `options`.

## Microphone access

By default, if `numberOfInputs` is set to a number greater than zero, mic access is requested and an error is thrown if access is denied. The `microphoneMode` attribute can be used to change this behavior, see [`MicrophoneMode`](src/index.ts#L32).

## Using WebAssembly

Running WebAssembly code in audio worklets is a three step process:

1. Import the WebAssembly module from your main javascript code
2. Pass the result to the worklet processor
3. Instantiate and use the WebAssembly code in the worklet processor

If `wasmUrl` is specified in the options passed to `startAudioWorklet`,  steps 1 and 2 are handled automatically. See the [WebAssembly demo source](demo/demo_wasm_processor.js#L5) for how to perform step 3.

# Demo

To run the live demo

* Run `yarn run demo` to start the demo server
* Open [https://localhost:8000/demo](https://localhost:8000/demo) in a browser

To allow for microphone access, the demo page is served over https using a self signed certificate. Any browser warnings can be safely ignored. Note that your browser may not allow self signed certificates by default. If you're running Brave or Chrome, you can change this behavior with

* `brave://flags/#allow-insecure-localhost` (for Brave)
* `chrome://flags/#allow-insecure-localhost` (for Chrome)

## Rust demo synth

The [`demo_synth`](demo_synth) folder contains a minimal demo synth written in Rust. This synth is used in the WebAssembly demo.