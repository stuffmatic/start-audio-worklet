## What is this?

`audio-worklet-starter` is a dead simple, single function library for creating and starting [audio worklets](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode), which provide low latency audio processing in [modern web browsers](https://caniuse.com/?search=AudioWorklet). 

## Adding the library to your project

### As a node module

Add `audio-worklet-starter` to your `package.json` and import the library like so: 

```import { startAudioWorklet } from "audio-worklet-starter"```

### As a standalone javascript file

The standalone version [`lib/audio_worklet_starter.js`](https://github.com/stuffmatic/audio-worklet-starter/blob/develop/lib/audio_worklet_starter.js) can be used directly in an HTML file by adding a script tag like this

```<script src="/some/path/to/audio_worklet_starter.js"></script>```

## Usage

The `startAudioWorklet` function is used to create and start an audio worklet:

```
const options = {
  "workletSrcUrl": "my_worklet_processor.js",
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

Allowed attributes of `options` are:

* `workletSrcUrl` (string) - The URL of the worklet processor javascript source file
* `workletNodeName` (string) - The name used when registering the worklet processor using `registerProcessor`
* `workletNodeOptions` ([`AudioWorkletNodeOptions`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode)) - Options passed when creating the [`AudioWorkletNode`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode) instance.
* `sampleRate` (number, optional) - The desired sample rate. Defaults to 44100 Hz if not specified.
* `requireMicAccess` (boolean, optional) - If `true`, an error will be thrown if at least one input channel has been requested and the user denies access to the microphone.
* `wasmUrl` (string, optional) - A URL to WebAssembly code to be used by the audio worklet.

### Using WebAssembly

Running WebAssembly code in audio worklets is a three step process:

1. Import the WebAssembly code from your main javascript code
2. Send the result to the worklet using the `port` of the audio worklet node.
3. Receive and instantiate the WebAssembly code in the worklet

If `wasmUrl` is specified in the options passed to `startAudioWorklet`,  steps 1 and 2 are handled automatically. Below is an example showing how to perform step 3 in your processor class.

```
class WasmProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.port.onmessage = e => {
      switch (e.data.type) {
        case "loadWasm": {
          WebAssembly.instantiate(e.data.data).then((wasm) => {
          	this.wasm = wasm
          })
          break
        }
        // Handle other messages
        // ...
      }
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.wasm) {
      // WebAssembly code is not ready
      return true
    }
    
    // Do processing using this.wasm
    // ...

    return true
  }
}

registerProcessor('wasm-processor', WasmProcessor)

```

## Demo

To run the live demo

* Run `yarn run demo` to start the demo server
* Open [https://localhost:8000/demo](https://localhost:8000/demo) in a browser

To allow for microphone access the demo page is served over https using a self signed certificate. You can safely ignore any browser safetyl warnings. Your browser may not allow self signed certificates by default. If you're running Brave or Chrome, you can change that behaviour with 

* `brave://flags/#allow-insecure-localhost` (for Brave)
* `chrome://flags/#allow-insecure-localhost` (for Chrome)