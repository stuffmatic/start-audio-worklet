const fs = require("fs")

fs.writeFileSync("lib/audio_worklet_starter.js", fs.readFileSync("lib/index.js").toString().replace(/export /g, ""))
console.log("Wrote modified lib/audio_worklet_starter.js")
