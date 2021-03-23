function isNativePromiseExecutor<T>(executor: Function | Promise<T>) {
  return /^function[\sA-Za-z0-9]*\(\s*\)\s*{\s*\[\s*native\s+code\s*\]\s*}\s*$/.test(executor.toString());
}

/**
 * @author Barenholz D.
 * @type TimedPromiseType<T>
 * @description The particular fields in a timed promise.
 * @version 0.1.1
 */
type TimedPromiseType<T> = {
  parent: TimedPromise<T>;
  created: number;
  timeout: number;
  timer: any;
  pending: boolean;
  resolve: (value: any, ms?: number) => void;
  reject: (reason?: any) => void;
};

/**
 * @author Barenholz D.
 * @class TimedPromise
 * @description A promise that can be timed out.
 * @extends Promise<T>
 * @version 0.1.1
 */
export default class TimedPromise<T> extends Promise<T> {
  // Initialise type
  timedPromise: TimedPromiseType<T>;

  // constructor: Create the TimedPromise object
  constructor(executor: (resolve?: (value: T) => void, reject?: (reason?: any) => void, timeout?: number) => void) {
    let timedPromise = {
      parent: null,
      created: Date.now(),
      timeout: Infinity,
      timer: null,
      pending: true,
      resolve: null,
      reject: null,
    };

    // Call super with resolve reject to set own resolve and reject methods
    super((resolve, reject) => {
      // Set resolve method
      timedPromise.resolve = (value) => {
        if (timedPromise.pending) {
          timedPromise.pending = false;
          if (timedPromise.timer) {
            clearTimeout(timedPromise.timer);
            timedPromise.timer = null;
          }

          return resolve(value);
        }
      };
      // Set reject method
      timedPromise.reject = (value) => {
        if (timedPromise.pending) {
          timedPromise.pending = false;
          if (timedPromise.timer) {
            clearTimeout(timedPromise.timer);
            timedPromise.timer = null;
          }

          return reject(value);
        }
      };

      // if native, use native one
      if (isNativePromiseExecutor<T>(executor)) {
        executor(timedPromise.resolve, timedPromise.reject);
        // if promise-like, then call then with resolve and reject
      } else if (executor instanceof Promise) {
        executor.then(timedPromise.resolve, timedPromise.reject);
        // otherwise use nextTick and call our own thing
      } else {
        try {
          executor(timedPromise.resolve, timedPromise.reject, this.remaining());
        } catch {
          executor(timedPromise.resolve, timedPromise.reject, Infinity);
        }
      }
    });

    this.timedPromise = timedPromise;
  }

  // set timeout
  timeout(
    // The timeout itself, in milliseconds
    ms: number,
    // The supplied reason for rejecting the promise
    reason: String = "TimedPromise Timeout",
    // Whether or not this is catchable by a parent promise
    catchable_by_parent: Boolean = false
  ) {
    // Test if current TimedPromise has remaining time
    if (this.timedPromise && this.timedPromise.pending && this.remaining() > ms) {
      // If the promise has a parent with timeout value
      if (catchable_by_parent && this.timedPromise.parent && this.timedPromise.parent.timeout) {
        // Use parents timeout
        this.timedPromise.parent.timeout(ms, reason, catchable_by_parent);
      }

      // Set timeout value
      this.timedPromise.timeout = Date.now() + ms;

      // Clear timeout if it exists
      if (this.timedPromise.timer) {
        clearTimeout(this.timedPromise.timer);
      }

      // Set timer (timeout itself) to reject promise
      this.timedPromise.timer = setTimeout(() => {
        this.timedPromise.timer = null;
        this.timedPromise.reject(reason);
      }, ms);

      //
      if (!catchable_by_parent && this.timedPromise.parent && this.timedPromise.parent.timeout) {
        this.timedPromise.parent.timeout(ms, reason, catchable_by_parent);
      }
    }

    return this;
  }

  /**
   *
   * @returns
   */
  created(): number {
    return this.timedPromise.created;
  }

  elapsed(): number {
    return Date.now() - this.timedPromise.created;
  }

  remaining(): number {
    if (this.timedPromise.pending) {
      return this.timedPromise.timeout === Infinity ? Infinity : Math.max(0, this.timedPromise.timeout - Date.now());
    } else {
      return 0;
    }
  }

  then<TypeA = T, TypeB = never>(
    onFulfilled?: (value: T, ms?: number) => TypeA | PromiseLike<TypeA>,
    onRejected?: (reason: any, ms?: number) => TypeB | PromiseLike<TypeB>
  ): TimedPromise<TypeA | TypeB> {
    // Setting type to any fixes type issue
    // TODO: Fix type; should be TimedPromise
    let thenPromise: any = super.then(
      !onFulfilled || isNativePromiseExecutor(onFulfilled)
        ? onFulfilled
        : (value) => onFulfilled(value, this.remaining()),
      // onrejected
      !onRejected || isNativePromiseExecutor(onRejected) ? onRejected : (reason) => onRejected(reason, this.remaining())
    );

    thenPromise.timedPromise.parent = this;

    return thenPromise;
  }

  catch(onRejected?: ((reason: any, ms?: number) => PromiseLike<never>) | undefined | null): TimedPromise<T> {
    const catchPromise: any = super.catch(
      !onRejected || isNativePromiseExecutor(onRejected) ? onRejected : (reason) => onRejected(reason, this.remaining())
    );

    catchPromise.timedPromise.parent = this;

    return catchPromise;
  }

  get settled() {
    return !this.timedPromise.pending;
  }
}
