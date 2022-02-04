const fs = require("fs")

// The following hack generates a standalone js file by removing
// the export keywords 😬
const libSrc = fs.readFileSync("lib/index.js").toString()
const standaloneSrc = libSrc.replace(/export /g, "")
fs.writeFileSync("lib/start_audio_worklet.js", standaloneSrc)
