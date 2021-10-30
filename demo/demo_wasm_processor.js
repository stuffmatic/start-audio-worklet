class DemoWasmProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.port.onmessage = e => {
      switch (e.data.type) {
        case "wasmData": {
          WebAssembly.instantiate(e.data.data).then(wasm => {
            this.onWasmInstantiated(wasm.instance)
          })
          break
        }
        case "toggleTone": {
          if (this.wasm) {
            this.wasm.exports.toggle_tone()
          }
          break
        }
      }
    }
  }

  onWasmInstantiated(wasm) {
    this.wasm = wasm

    // Audio worklets seem to use a fixed buffer size of 128
    const bufferSize = 128

    this.inBufferPointer = this.wasm.exports.allocate_f32_array(bufferSize)
    this.outBufferPointer = this.wasm.exports.allocate_f32_array(bufferSize)
    this.inBuffer = new Float32Array(
      this.wasm.exports.memory.buffer,
      this.inBufferPointer,
      bufferSize
    )
    this.outBuffer = new Float32Array(
      this.wasm.exports.memory.buffer,
      this.outBufferPointer,
      bufferSize
    )
  }

  process(inputs, outputs, parameters) {
    if (!this.wasm) {
      return true
    }
    if (inputs.length > 0) {
      const inputChannels = inputs[0]
      if (inputChannels.length > 0) {
        this.inBuffer.set(inputChannels[0])
        const maxLevel = this.wasm.exports.buffer_max_level(this.inBufferPointer, this.inBuffer.length)
        this.port.postMessage({ type: "maxLevel", value: maxLevel })
      }
    }

    const outputChannels = outputs[0]
    this.wasm.exports.render(this.outBufferPointer, this.outBuffer.length)
    for (let channel = 0; channel < outputChannels.length; ++channel) {
      outputChannels[channel].set(this.outBuffer)
    }

    return true
  }
}

registerProcessor('demo-wasm-processor', DemoWasmProcessor)
