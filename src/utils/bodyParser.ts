// src/utils/bodyParser.ts
import { IncomingMessage } from 'http';

export const getRequestBody = (req: IncomingMessage): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
};
