A simple demo synth written in Rust, which can be compiled to a WebAssembly module and used in audio worklets.

`rustup target add wasm32-unknown-unknown`
https://github.com/WebAssembly/wabt needed for wasm-strip. `brew install wabt`