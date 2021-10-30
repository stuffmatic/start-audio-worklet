class DemoWasmProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.port.onmessage = e => {
      switch (e.data.type) {
        case "wasmData": {
          WebAssembly.instantiate(e.data.data).then(w => {})
          break
        }
      }
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.wasm) {
      return true
    }

    return true
  }
}

registerProcessor('demo-wasm-processor', DemoWasmProcessor)
