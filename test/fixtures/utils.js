// Dependencies
const path = require('path');

// Init
const hasFile = (fs, p) => fs.existsSync(p);
const getFile = (fs, p) =>
  hasFile(fs, p) && {
    ...fs.statSync(p),
    size: fs.meta(p).byteLength,
    name: path.basename(p),
  };
const getFiles = (fs, p) =>
  fs
    .readdirSync(p)
    .map(f => getFile(fs, path.resolve(p, f)))
    .sort((a, b) => a.name.localeCompare(b.name));
const getMatch = (fs, p, regex) => getFiles(fs, p).filter(f => regex.test(f.name));
const resolver = (...args) => (...p) => path.resolve(...args, (p && p.length > 0 && p.join(path.sep)) || '');

// Exports
module.exports.hasFile = hasFile;
module.exports.getFile = getFile;
module.exports.getFiles = getFiles;
module.exports.getMatch = getMatch;
module.exports.resolver = resolver;
