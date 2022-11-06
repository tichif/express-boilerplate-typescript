import * as redis from 'redis';

import config from '../config';
import Logging from './log';

const client = redis.createClient({
  url: `redis://${config.redisServer}`,
});

client.connect();

client.on('connect', () => Logging.info('Redis Client Connected.'));

client.on('error', (err) => Logging.error(`Redis Client Error: ${err}`));

export async function clearCache() {
  await client.flushAll();
}

export default client;
