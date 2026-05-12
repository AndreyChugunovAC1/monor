import pino from 'pino';

export const logger = pino(
  pino.destination({ dest: './log.txt' })
);