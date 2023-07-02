import * as Joi from 'joi';

export const validationSchema = Joi.object({
 NODE_ENV: Joi.string().required(),
 APP_PORT: Joi.number().required(),
 AT_SECRET: Joi.string().required(),
 RT_SECRET: Joi.string().required(),
 SALT_ROUNDS: Joi.number().required(),
 DATABASE_URL: Joi.string().required(),
});
