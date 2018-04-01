// Exports
module.exports = (configFilesOrObjectsOrFns, opts) => {
  const configs = (Array.isArray(configFilesOrObjectsOrFns) ? configFilesOrObjectsOrFns : [configFilesOrObjectsOrFns]).filter(Boolean);

  // Check for required files
  if (configs.length === 0) throw new Error('Must specify at least one config');

  // Load config files
  return configs.map((config) => {
    const rawConfig = (typeof config === 'string') ? require(config) : config;
    return typeof rawConfig === 'function' ? rawConfig(opts) : rawConfig;
  });
};
