# What is this?

`start-audio-worklet` provides a dead simple, single function API for creating and starting an [audio worklet node](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode), which provides low latency audio processing in [modern web browsers](https://caniuse.com/?search=AudioWorklet). It takes care of requesting microphone access, error handling and browser specific quirks so you don't have to.

A live demo can be found [here](https://stuffmatic.github.io/start-audio-worklet/).

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

See [`StartAudioWorkletOptions`](lib/index.d.ts#L45) for allowed attributes of `options`.

⚠️ __Note:__ Some browsers, for example Firefox and Chrome, won't allow an audio context to start automatically without user interaction. This means that `startAudioWorklet` should be called in response to a button press, for example. In these browsers, calling it on page load requires an additional `resume()` call on the worklet node's audio context when the user interacts with the page.

## Microphone access

By default, if `numberOfInputs` is set to a number greater than zero, microphone access is requested and an error is thrown if access is denied. The `microphoneMode` attribute can be used to change this behavior, see [`MicrophoneMode`](lib/index.d.ts#L22).

## Using WebAssembly

Running WebAssembly code in audio worklets is a three step process:

1. Import the WebAssembly module from your main javascript code
2. Pass the result to the worklet processor
3. Instantiate and use the WebAssembly code in the worklet processor

If `wasmUrl` is specified in the options passed to `startAudioWorklet`,  steps 1 and 2 are handled automatically. See the [WebAssembly demo source](demo/demo_wasm_processor.js#L5) for how to perform step 3.

The [`tone_generator`](tone_generator) folder contains a simple tone generator written in Rust, which is used in the WebAssembly demo.

## Tweaking performance

Unfortunately, audio worklet performance is not consistent across browsers, but it's sometimes possible to pass additional options to improve things. Some info about how to reduce latency can be found [here](https://www.jefftk.com/p/audioworklet-latency-firefox-vs-chrome). If you need unprocessed microphone input without echo cancellation etc, you might find [this Stack Overflow thread](https://stackoverflow.com/questions/61399683/getusermedia-how-can-i-improve-audio-quality-how-can-i-make-audio-to-stop-echoi) helful.

# Running the live demo locally

To run the [live demo](https://stuffmatic.github.io/start-audio-worklet/) on your local machine

* Run `yarn run demo` to start the demo server
* Open [https://localhost:8000/demo](https://localhost:8000/demo) in a browser

To allow for microphone access, the demo page is served over https using a self signed certificate. Any browser warnings can be safely ignored. Note that your browser may not allow self signed certificates by default. If you're running Brave or Chrome, you can change this behavior with

* `brave://flags/#allow-insecure-localhost` (for Brave)
* `chrome://flags/#allow-insecure-localhost` (for Chrome)