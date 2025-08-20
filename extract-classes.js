// extract-classes.js
const fs = require("fs");

const css = fs.readFileSync("tailwind.css", "utf8");
const classRegex = /\.([a-zA-Z0-9\-\:\/]+)[\s\{\.]/g;

const classes = new Set();
let match;
while ((match = classRegex.exec(css)) !== null) {
  classes.add(match[1]);
}

fs.writeFileSync("tailwind-classes.json", JSON.stringify([...classes], null, 2));
console.log("Extracted", classes.size, "classes");
