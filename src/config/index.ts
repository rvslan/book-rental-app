import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  return {
    port: parseInt(process.env.APP_PORT),
  };
}

export { validationSchema } from './validation.schema';