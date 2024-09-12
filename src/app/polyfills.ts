// src/polyfills.ts
export {};

declare global {
    interface PromiseConstructor {
      withResolvers<T>(): {
        promise: Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
      };
    }
  }
  
  // Polyfill for Promise.withResolvers if not available
  if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function <T>() {
      let resolve: (value: T | PromiseLike<T>) => void;
      let reject: (reason?: any) => void;
  
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
  
      return { promise, resolve: resolve!, reject: reject! };
    };
  }
  