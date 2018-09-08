// Dependencies
const path = require('path');
const fs = require('fs-extra');

// Init
const additionalExtensions = {
  gzip: '.gz',
  brotli: '.br',
};
const ignoredExtensions = ['.map'];

// Exports
module.exports = (outputPath, manifestFile) => {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.resolve(outputPath, manifestFile)));
    const files = manifest.assets.reduce((acc, asset) => {
      const file = asset.name;
      const size = asset.size;
      const ext = path.extname(file);
      if (!ignoredExtensions.includes(ext)) {
        const filePath = path.resolve(outputPath, file);
        try {
          const additionalExtensionsFound = Object.entries(additionalExtensions).reduce((extAcc, [extK, extV]) => {
            try {
              const extFile = fs.statSync(filePath + extV);
              extAcc[extK] = extFile.size;
            } catch (err) {}
            return extAcc;
          }, {});
          const chunk =
            asset.chunkNames.length > 0
              ? asset.chunkNames.reduce((cacc, ccur) => {
                  if (cacc === '') return ccur + ext;
                  return `${cacc}, ${ccur + ext}`;
                }, '')
              : file;
          acc[chunk] = {
            file,
            size,
            ...additionalExtensionsFound,
          };
        } catch (err) {}
      }
      return acc;
    }, {});
    // const files = Object.entries(manifest.assetsByChunkName)
    //   .map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
    //   .reduce((acc, [k, v]) => {
    //     v.forEach(f => {
    //       const ext = path.extname(f);
    //       if (!ignoredExtensions.includes(ext)) {
    //         const filePath = path.resolve(outputPath, f);
    //         try {
    //           const rawStat = fs.statSync(filePath);
    //           const additionalExtensionsFound = Object.entries(additionalExtensions).reduce((extAcc, [extK, extV]) => {
    //             try {
    //               const extFile = fs.statSync(filePath + extV);
    //               extAcc[extK] = extFile.size;
    //             } catch (err) {}
    //             return extAcc;
    //           }, {});
    //           acc[k + ext] = {
    //             file: f,
    //             size: rawStat.size,
    //             ...additionalExtensionsFound,
    //           };
    //         } catch (err) {}
    //       }
    //     });
    //     return acc;
    //   }, {});
    return files;
  } catch (err) {
    return {};
  }
};
