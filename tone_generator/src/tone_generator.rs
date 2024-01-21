/// A simple tone generator
pub struct ToneGenerator {
    phase: f32,
    frequency: f32,
    target_gain: f32,
    gain: f32,
    sample_rate: f32,
}

impl ToneGenerator {
    pub const fn new() -> Self {
        ToneGenerator {
            phase: 0.0,
            frequency: 0.0,
            target_gain: 0.0,
            gain: 0.0,
            sample_rate: 0.0
        }
    }

    pub fn init(&mut self, sample_rate: f32, frequency: f32) {
        self.sample_rate = sample_rate;
        self.frequency = frequency;
    }

    pub fn render(&mut self, buffer: &mut [f32]) {
        for sample in buffer.iter_mut() {
            *sample = 0.3 * self.gain * (2.0 * std::f32::consts::PI * self.phase).sin();
            self.phase += self.frequency / self.sample_rate;
            self.phase = self.phase.rem_euclid(1.0);
            self.gain = 0.97 * self.gain + 0.03 * self.target_gain;
        }
    }

    pub fn buffer_max_level(&mut self, buffer: &[f32]) -> f32 {
        let mut max = 0.0;
        for sample in buffer {
            let abs = sample.abs();
            if abs > max {
                max = abs
            }
        }
        max
    }

    pub fn toggle_tone(&mut self) {
        self.target_gain = if self.target_gain > 0. {
            0.
        } else {
            1.
        }
    }
}