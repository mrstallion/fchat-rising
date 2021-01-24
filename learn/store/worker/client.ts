import _ from 'lodash';
import log from 'electron-log'; //tslint:disable-line:match-default-export-name


import { IndexedRequest, IndexedResponse, ProfileStoreCommand } from './types';

export interface WaiterDef {
  id: string;
  resolve(result?: any): void;
  reject(result?: any): void;
}

export class WorkerClient {
  private readonly worker: Worker;

  private idCounter = 0;

  private waiters: WaiterDef[] = [];

  constructor(jsFile: string) {
    this.worker = new Worker(jsFile);
    this.worker.onmessage = this.generateMessageProcessor();
  }


  private generateId(): string {
    this.idCounter++;

    return `wc-${this.idCounter}`;
  }


  private when(id: string, resolve: (result?: any) => void, reject: (reason?: any) => void): void {
    this.waiters.push({ id, resolve, reject });
  }


  private generateMessageProcessor(): ((e: Event) => void) {
    return (e: Event) => {
      const res = (e as any).data as IndexedResponse;

      log.silly('store.worker.client.msg', { res });

      if (!res) {
        log.error('store.worker.client.msg.invalid', { res });
        return;
      }

      const waiter = _.find(this.waiters, (w) => (w.id === res.id));

      if (!waiter) {
        log.error('store.worker.client.msg.unknown', { res });
        return;
      }

      if (res.state === 'ok') {
        waiter.resolve(res.result);
      } else {
        waiter.reject(new Error(res.msg));
      }

      this.clearWaiter(waiter.id);
    };
  }


  private clearWaiter(id: string): void {
    this.waiters = _.filter(this.waiters, (w) => (w.id !== id));
  }


  async request(cmd: ProfileStoreCommand, params: Record<string, any> = {}): Promise<any> {
    const id = this.generateId();

    const request: IndexedRequest = {
      cmd,
      id,
      params
    };

    return new Promise(
      (resolve, reject) => {
        try {
          this.when(
            id,
            resolve,
            reject
          );

          this.worker.postMessage(request);
        } catch (err) {
          reject(err);
          this.clearWaiter(id);
        }
      }
    );
  }
}
