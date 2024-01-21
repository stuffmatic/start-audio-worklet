use core::cell::UnsafeCell;
mod tone_generator;
use tone_generator::ToneGenerator;

// A wrapper around UnsafeCell used to tell the compiler
// that we'll manually ensure that references to the wrapped
// object are handled properly in a thread safe manner.
struct SyncUnsafeCell<T>(UnsafeCell<T>);
unsafe impl<T> Sync for SyncUnsafeCell<T> {}

// A statically allocated global tone generator instance.
static TONE_GENERATOR: SyncUnsafeCell<ToneGenerator> = SyncUnsafeCell(UnsafeCell::new(ToneGenerator::new()));

/// Unsafely acquire a mutable reference to the global tone generator instance.
fn tone_generator_mut_ref() -> &'static mut ToneGenerator {
    // ⚠️ IT'S UP TO YOU TO ENSURE THERE IS NEVER
    // ⚠️ MORE THAN ONE ACTIVE REFERENCE AT ANY GIVEN MOMENT.
    unsafe { &mut *TONE_GENERATOR.0.get() }
}

#[no_mangle]
pub extern "C" fn allocate_f32_array(size: usize) -> *mut f32 {
    let mut buf = Vec::<f32>::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr as *mut f32
}

#[no_mangle]
pub extern "C" fn init(sample_rate: f32, frequency: f32) {
    let generator = tone_generator_mut_ref();
    generator.init(sample_rate, frequency);
}

#[no_mangle]
pub extern "C" fn render(raw_buffer: *mut f32, buffer_size: usize) {
    let generator = tone_generator_mut_ref();

    let buffer: &mut [f32] = unsafe { std::slice::from_raw_parts_mut(raw_buffer, buffer_size) };
    generator.render(buffer);
}

#[no_mangle]
pub extern "C" fn buffer_max_level(raw_buffer: *const f32, buffer_size: usize) -> f32 {
    let generator = tone_generator_mut_ref();
    let buffer: &[f32] = unsafe { std::slice::from_raw_parts(raw_buffer, buffer_size) };
    generator.buffer_max_level(buffer)
}

#[no_mangle]
pub extern "C" fn toggle_tone() {
    let generator = tone_generator_mut_ref();
    generator.toggle_tone()
}
