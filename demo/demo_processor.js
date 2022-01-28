class DemoProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options)

    this.targetGain = 0
    this.gain = 0
    this.frequency = 660
    this.phase = 0
    this.sampleRate = options.processorOptions.sampleRate

    this.port.onmessage = e => {
      switch (e.data.type) {
        case "toggleTone": {
          this.targetGain = this.targetGain > 0 ? 0 : 1
          break
        }
      }
    }
  }

  process(inputs, outputs, parameters) {
    const outputChannels = outputs[0]
    if (outputChannels.length > 0) {
      for (let ch = 0; ch < outputChannels.length; ch++) {
        if (ch == 0) {
          for (let i = 0; i < outputChannels[ch].length; i++) {
            outputChannels[ch][i] = 0.3 * this.gain * Math.sin(2 * Math.PI * this.phase)
            this.phase += this.frequency / this.sampleRate
            this.phase = this.phase % 1.0
            this.gain = 0.97 * this.gain + 0.03 * this.targetGain
          }
        } else {
          for (let i = 0; i < outputChannels[ch].length; i++) {
            outputChannels[ch][i] = outputChannels[0][i]
          }
        }
      }
    }

    if (inputs.length > 0) {
      const inputChannels = inputs[0]
      if (inputChannels.length > 0) {
        const maxInputLevel = Math.max(...inputChannels[0].map((value) => Math.abs(value)))
        this.port.postMessage({ type: "maxLevel", value: maxInputLevel })
      }
    }

    return true
  }
}

registerProcessor('demo-processor', DemoProcessor)
