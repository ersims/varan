import * as Yup from 'yup';

// Exports
export const validateConfig = (config: Record<string, unknown>) =>
  Yup.object({
    silent: Yup.boolean().default(false),
    configs: Yup.array().default([]),
  })
    .required()
    .validateSync(config);
