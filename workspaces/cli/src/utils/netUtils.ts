import { createServer } from "node:net";

export async function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = createServer()
      .once('error', () => {
        resolve(false);
      })
      .once('listening', () => {
        tester.close();
      })
      .once('close', () => resolve(true)) // Port is free
      .listen(port, '127.0.0.1');
  });
}
