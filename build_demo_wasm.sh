cd demo_synth

cargo build --target wasm32-unknown-unknown --release

echo "Copying"
cp target/wasm32-unknown-unknown/release/demo_synth.wasm ../demo
echo "Stripping"
wasm-strip ../demo/demo_synth.wasm

cd ..