class DemoProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.port.onmessage = e => {

    }
  }

  process(inputs, outputs, parameters) {
    if (!this.wasm) {
      return true
    }

    return true
  }
}

registerProcessor('demo-processor', DemoProcessor)
