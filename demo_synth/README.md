# Rust demo synth

A simple demo synth written in Rust, which can be compiled to a WebAssembly module and used in audio worklets.

* Building a WebAssembly module requires the `wasm32-unknown-unknown` target. Install it with
`rustup target add wasm32-unknown-unknown`
* `wasm-strip` from [The WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt) should be used to reduce the size of WebAssembly binaries. On macOS, it can be installed with `brew install wabt`.