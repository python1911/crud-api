export const sendMessageToMaster = <T = any>(action: string, payload?: any): Promise<T> => {
  return new Promise((resolve) => {
    const messageId = Date.now().toString() + Math.random();

    const handler = (message: any) => {
      if (message.messageId === messageId) {
        process.removeListener('message', handler);
        resolve(message.result);
      }
    };

    process.on('message', handler);

    if (process.send) {
      process.send({ action, payload, messageId });
    }
  });
};
