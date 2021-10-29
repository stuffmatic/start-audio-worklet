# What is this?

`audio-worklet-starter` provides a dead simple, single function API for creating and starting [audio worklet nodes](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode), which provide low latency audio processing in [modern web browsers](https://caniuse.com/?search=AudioWorklet).

* Error handling
* Microphone permission handling
* Browser specific quirks
* Wasm loading

# Adding the library to your project

### ES module

Add `audio-worklet-starter` to your `package.json` and import as usual.

### Old school `<script>` tag


```<script stc="/some/path/to/index_standalone.js"></script>```

## Usage

### Basic usage

#### `workletSrcUrl` (string)
The URL of the worklet processor javascript source file
#### `workletNodeName` (string)
The name used when registering the worklet processor using `registerProcessor`
#### `workletNodeOptions` ([`AudioWorkletNodeOptions`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode))
Options passed when creating the [`AudioWorkletNode`](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode) instance
#### `sampleRate` (number, optional)
The desired sample rate. Defaults to 44100 Hz if not specified.
#### `wasmUrl` (string, optional)
x
#### `requireMicAccess` (boolean, optional)
If `true`,

### WebAssembly

## Demo

* brave://flags/#allow-insecure-localhost