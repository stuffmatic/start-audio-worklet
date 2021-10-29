const fs = require("fs")

fs.writeFileSync("lib/index_standalone.js", fs.readFileSync("lib/index.js").toString().replace(/export /g, ""))
console.log("Wrote modified lib/index_standalone.js")
