#[macro_use]
extern crate lazy_static;

use std::sync::Mutex;

struct DemoSynth {
    phase: f32,
    frequency: f32,
    target_gain: f32,
    gain: f32,
    sample_rate: f32,
}

impl DemoSynth {
    fn new(sample_rate: f32) -> Self {
        DemoSynth {
            phase: 0.0,
            frequency: 440.0,
            target_gain: 0.0,
            gain: 0.0,
            sample_rate,
        }
    }

    fn render(&mut self, buffer: &mut [f32]) {
        for sample in buffer.iter_mut() {
            *sample = 0.3 * self.gain * (2.0 * std::f32::consts::PI * self.phase).sin();
            self.phase += self.frequency / self.sample_rate;
            self.phase = self.phase.rem_euclid(1.0);
            self.gain = 0.97 * self.gain + 0.03 * self.target_gain;
        }
    }

    fn buffer_max_level(&mut self, buffer: &[f32]) -> f32 {
        let mut max = 0.0;
        for sample in buffer {
            let abs = sample.abs();
            if abs > max {
                max = abs
            }
        }
        max
    }

    fn toggle_tone(&mut self) {
        self.target_gain = if self.target_gain > 0. {
            0.
        } else {
            1.
        }
    }
}

lazy_static! {
    static ref SYNTH: Mutex<DemoSynth> = Mutex::new(DemoSynth::new(44100.));
}

#[no_mangle]
pub extern "C" fn allocate_f32_array(size: usize) -> *mut f32 {
    let mut buf = Vec::<f32>::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr as *mut f32
}

#[no_mangle]
pub extern "C" fn render(raw_buffer: *mut f32, buffer_size: usize) {
    let mut synth = SYNTH.lock().unwrap();

    let buffer: &mut [f32] = unsafe { std::slice::from_raw_parts_mut(raw_buffer, buffer_size) };
    synth.render(buffer);
}

#[no_mangle]
pub extern "C" fn buffer_max_level(raw_buffer: *const f32, buffer_size: usize) -> f32 {
    let mut synth = SYNTH.lock().unwrap();
    let buffer: &[f32] = unsafe { std::slice::from_raw_parts(raw_buffer, buffer_size) };
    synth.buffer_max_level(buffer)
}

#[no_mangle]
pub extern "C" fn toggle_tone() {
    let mut synth = SYNTH.lock().unwrap();
    synth.toggle_tone()
}
