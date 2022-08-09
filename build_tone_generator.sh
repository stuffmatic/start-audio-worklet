cd tone_generator

cargo build --target wasm32-unknown-unknown --release

echo "Copying"
cp target/wasm32-unknown-unknown/release/tone_generator.wasm ../demo
echo "Stripping"
wasm-strip ../demo/tone_generator.wasm

cd ..