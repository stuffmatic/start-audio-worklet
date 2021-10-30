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
        case "noteOn": {
          if (this.wasm) {
            this.wasm.exports.note_on()
          }
          break
        }
        case "noteOff": {
          if (this.wasm) {
            this.wasm.exports.note_off()
          }
          break
        }
      }
    }
  }

  onWasmInstantiated(wasm) {
    this.wasm = wasm

    this._size = 128

    this._inPtr = this.wasm.exports.allocate_f32_array(this._size)
    this._outPtr = this.wasm.exports.allocate_f32_array(this._size)
    this._inBuf = new Float32Array(
      this.wasm.exports.memory.buffer,
      this._inPtr,
      this._size
    )
    this._outBuf = new Float32Array(
      this.wasm.exports.memory.buffer,
      this._outPtr,
      this._size
    )
  }

  process(inputs, outputs, parameters) {
    if (!this.wasm) {
      return true
    }

    const channels = outputs[0]
    this.wasm.exports.process(this._outPtr, channels[0].length)
    for (let channel = 0; channel < channels.length; ++channel) {
      channels[channel].set(this._outBuf)
      /*for (let i = 0; i < channels[channel].length; i++) {
        channels[channel][i] = Math.random()
      }*/
    }

    // console.log(outputs)

    return true
  }
}

registerProcessor('demo-wasm-processor', DemoWasmProcessor)
