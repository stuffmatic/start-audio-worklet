var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class WebAssemblyNotSupportedError extends Error {
}
class AudioWorkletNotSupportedError extends Error {
}
class WebAssemblyFetchError extends Error {
}
function startAudioWorklet(options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const defaultSampleRate = 44100;
        const sampleRate = (_a = options.sampleRate) !== null && _a !== void 0 ? _a : defaultSampleRate;
        let contextOptions = { sampleRate, latencyHint: "interactive" };
        let context;
        if (window.webkitAudioContext) {
            // AudioContext is undefined in Safari and old versions of Chrome
            context = new (window.webkitAudioContext)(contextOptions);
        }
        else {
            context = new AudioContext(contextOptions);
        }
        const wasmIsSupported = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function";
        if (!wasmIsSupported && options.wasmUrl !== undefined) {
            throw new WebAssemblyNotSupportedError("WebAssembly is not supported in this browser");
        }
        const audioWorkletIsSupported = context.audioWorklet !== undefined;
        if (!audioWorkletIsSupported) {
            throw new AudioWorkletNotSupportedError("AudioWorklet is not supported in this browser");
        }
        let micStream = null;
        if ((_b = options.workletNodeOptions.numberOfInputs) !== null && _b !== void 0 ? _b : 0 > 0) {
            try {
                micStream = yield navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            }
            catch (e) {
                if (options.requireMicAccess) {
                    throw e;
                }
            }
        }
        const urlTimestampSuffix = "?t=" + new Date().getTime();
        yield context.audioWorklet.addModule(options.workletSrcUrl + urlTimestampSuffix);
        const workletNode = new AudioWorkletNode(context, options.workletNodeName, options.workletNodeOptions);
        if (micStream != null) {
            const micSource = context.createMediaStreamSource(micStream);
            micSource.connect(workletNode);
        }
        const wasmUrl = options.wasmUrl;
        if (wasmUrl) {
            const fetchResult = yield fetch(wasmUrl + urlTimestampSuffix);
            if (!fetchResult.ok) {
                throw new WebAssemblyFetchError("wasm fetch failed with status " + fetchResult.status);
            }
            const wasmData = fetchResult.arrayBuffer();
            workletNode.port.postMessage({ type: 'wasmData', data: wasmData });
        }
        return workletNode;
    });
}
