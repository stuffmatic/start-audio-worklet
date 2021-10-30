## What is this?

`audio-worklet-starter` is a dead simple, single function library for creating and starting [audio worklets](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode), which provide low latency audio processing in [modern web browsers](https://caniuse.com/?search=AudioWorklet).

## Adding the library to your project

### As an ES6 module

Add `audio-worklet-starter` to your `package.json` and import the library like so:

```import { startAudioWorklet } from "audio-worklet-starter"```

### As a standalone javascript file

The standalone version [`lib/audio_worklet_starter.js`](https://github.com/stuffmatic/audio-worklet-starter/blob/develop/lib/audio_worklet_starter.js) can be used directly in an HTML file by adding a script tag like this

```<script src="/some/path/to/audio_worklet_starter.js"></script>```

## Usage

The `startAudioWorklet` function is used to create and start an audio worklet:

```
const options = {
  "workletProcessorUrl": "my_worklet_processor.js",
  "workletNodeName": "my_worklet",
  "workletNodeOptions: {
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

See [`AudioWorkletOptions`]() for allowed attributes of `options`.


### Using WebAssembly

Running WebAssembly code in audio worklets is a three step process:

1. Import the WebAssembly module from your main javascript code
2. Send the result to the worklet using the `port` of the audio worklet node.
3. Receive, instantiate and use the WebAssembly code in the worklet processor

If `wasmUrl` is specified in the options passed to `startAudioWorklet`,  steps 1 and 2 are handled automatically. See the [WebAssembly demo source](TODO) for how to perform step 3.

## Demo

To run the live demo

* Run `yarn run demo` to start the demo server
* Open [https://localhost:8000/demo](https://localhost:8000/demo) in a browser

To allow for microphone access, the demo page is served over https using a self signed certificate. Any browser safety warnings can be safely ignored. Your browser may not allow self signed certificates by default. If you're running Brave or Chrome, you can change this behavior with

* `brave://flags/#allow-insecure-localhost` (for Brave)
* `chrome://flags/#allow-insecure-localhost` (for Chrome)
