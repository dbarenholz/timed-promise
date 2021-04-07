/**
 * A regex that tests if an executor is native, or not.
 *
 * @param {Function} executor executor to check.
 * @returns {Boolean} `true` if executor is native, `false` otherwise.
 */
function isNativePromiseExecutor<T>(executor: Function): boolean {
  return /^function[\sA-Za-z0-9]*\(\s*\)\s*{\s*\[\s*native\s+code\s*\]\s*}\s*$/.test(executor.toString());
}

/**
 * @author Barenholz D.
 * @type TimedPromiseType<T>
 * @description The particular fields in a timed promise and their typings.
 * @field parent:  a possible parent promise
 * @field created: time (unix time) at which promise was created
 * @field timeout: number of ms before timedpromise should throw error / reject
 * @field timer:   the actual timer that keeps track of the timeout
 * @field pending: boolean indicating if promise is pending, or completed / settled
 * @field resolve: resolve method in promises
 * @field reject:  reject method in promises
 * @see Promise
 * @version 0.2.0
 */
type TimedPromiseType = {
  parent: TimedPromise<any>;
  created: number;
  timeout: number;
  timer: NodeJS.Timeout;
  pending: boolean;
  resolve: (value: any, ms?: number) => void;
  reject: (reason?: any) => void;
};

/**
 * Represents the completion of an asynchronous operation, **with timeouts**.
 */
interface TimedPromiseInterface<T> extends Promise<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the TimedPromise.
   * @param {void} onfulfilled The callback to execute when the TimedPromise is resolved.
   * @param {void} onrejected The callback to execute when the TimedPromise is rejected.
   *
   * @returns {TimedPromise<TypeA | TypeB>} A TimedPromise for the completion of which ever callback is executed.
   */
  then<TypeA = T, TypeB = never>(
    onfulfilled?: ((value: T, ms?: number) => TypeA | PromiseLike<TypeA>) | undefined | null,
    onrejected?: ((reason: any, ms?: number) => TypeB | PromiseLike<TypeB>) | undefined | null
  ): TimedPromise<TypeA | TypeB>;

  /**
   * Attaches a callback for only the rejection of the TimedPromise.
   *
   * @param {void} onrejected The callback to execute when the TimedPromise is rejected.
   *
   * @returns {TimedPromise<TResult>} A TimedPromise for the completion of the callback.
   */
  catch<TResult = never>(
    onrejected?: ((reason: any, ms?: number) => TResult | PromiseLike<TResult>) | undefined | null
  ): TimedPromise<T | TResult>;
}

/**
 * @author Barenholz D.
 * @class TimedPromise
 * @description A promise that can be timed out, with typings.
 * @extends Promise<T> Adds timeouts to promises.
 * @version 0.2.0
 */
export default class TimedPromise<T> extends Promise<T> implements TimedPromiseInterface<T> {
  timedPromise: TimedPromiseType;

  /**
   * Constructor. Creates a TimedPromise object.
   * @param executor Either a (timed)-promise, or an executor, possibly with timeout.
   */
  constructor(
    executor:
      | ((resolve?: (value: T) => void, reject?: (reason?: any) => void, timeout?: number) => void)
      | Promise<T>
      | PromiseLike<T>
  ) {
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
      timedPromise.resolve = (value: T) => {
        if (timedPromise.pending) {
          timedPromise.pending = false;
          if (timedPromise.timer) {
            clearTimeout(timedPromise.timer);
            timedPromise.timer = null;
          }

          return resolve(value);
        }
      };
      timedPromise.reject = (value: T) => {
        if (timedPromise.pending) {
          timedPromise.pending = false;
          if (timedPromise.timer) {
            clearTimeout(timedPromise.timer);
            timedPromise.timer = null;
          }

          return reject(value);
        }
      };

      // if a function, check if native
      if (executor instanceof Function && isNativePromiseExecutor<T>(executor)) {
        executor(timedPromise.resolve, timedPromise.reject);
      }
      // if a promise, then use promise stuff
      if (executor instanceof Promise) {
        executor.then(timedPromise.resolve, timedPromise.reject);
      }
      // non-native function
      if (executor instanceof Function && !isNativePromiseExecutor<T>(executor)) {
        executor(timedPromise.resolve, timedPromise.reject, Infinity);
      }
    });

    this.timedPromise = timedPromise;
  }

  /**
   * Allows `.timeout()` call on a TimedPromise object to set the timeout.
   * @param {Number} ms                      the timeout value in ms
   * @param {String} reason                  possible custom reason why a promise rejected
   * @param {Boolean} catchable_by_parent    boolean stating whether or not this rejection is catchable by a parent promise
   * @returns {TimedPromise<T>} `this`, TimedPromise instance.
   */
  timeout(ms: number, reason: String = "promise timeout", catchable_by_parent: Boolean = false): TimedPromise<T> {
    if (this.timedPromise && this.timedPromise.pending && this.remaining() > ms) {
      if (catchable_by_parent && this.timedPromise.parent && this.timedPromise.parent.timeout) {
        this.timedPromise.parent.timeout(ms, reason, catchable_by_parent);
      }

      this.timedPromise.timeout = Date.now() + ms;

      if (this.timedPromise.timer) {
        clearTimeout(this.timedPromise.timer);
      }

      this.timedPromise.timer = setTimeout(() => {
        this.timedPromise.timer = null;
        this.timedPromise.reject(reason);
      }, ms);

      if (!catchable_by_parent && this.timedPromise.parent && this.timedPromise.parent.timeout) {
        this.timedPromise.parent.timeout(ms, reason, catchable_by_parent);
      }
    }

    return this;
  }

  /**
   * @returns {Number} time of creation of TimedPromise object.
   */
  created(): number {
    return this.timedPromise.created;
  }

  /**
   * @returns {Number} time elapsed since creation of TimedPromise object
   */
  elapsed(): number {
    return Date.now() - this.timedPromise.created;
  }

  /**
   * @returns {Number} the time remaining before the TimedPromise object rejects.
   */
  remaining(): number {
    if (this.timedPromise.pending) {
      return this.timedPromise.timeout === Infinity ? Infinity : Math.max(0, this.timedPromise.timeout - Date.now());
    } else {
      return 0;
    }
  }

  /**
   * @returns {Boolean} whether or not this TimedPromise object is still pending.
   */
  get settled(): boolean {
    return !this.timedPromise.pending;
  }

  /**
   * Attaches callbacks for the resolution and/or rejection of the TimedPromise.
   * @param {void} onfulfilled The callback to execute when the TimedPromise is resolved.
   * @param {void} onrejected The callback to execute when the TimedPromise is rejected.
   *
   * @returns {TimedPromise<TypeA | TypeB>} A TimedPromise for the completion of which ever callback is executed.
   */
  then<TypeA = T, TypeB = never>(
    onfulfilled?: ((value: T, ms?: number) => TypeA | PromiseLike<TypeA>) | undefined | null,
    onrejected?: ((reason: any, ms?: number) => TypeB | PromiseLike<TypeB>) | undefined | null
  ): TimedPromise<TypeA | TypeB> {
    let thenPromise = super.then(
      !onfulfilled || isNativePromiseExecutor(onfulfilled)
        ? onfulfilled
        : (value) => onfulfilled(value, this.remaining()),
      !onrejected || isNativePromiseExecutor(onrejected) ? onrejected : (reason) => onrejected(reason, this.remaining())
    ) as TimedPromise<TypeA | TypeB>;

    thenPromise.timedPromise.parent = this;

    return thenPromise;
  }

  /**
   * Attaches a callback for only the rejection of the TimedPromise.
   *
   * @param {void} onrejected The callback to execute when the TimedPromise is rejected.
   *
   * @returns {TimedPromise<TResult>} A TimedPromise for the completion of the callback.
   */
  catch<TypeA = never>(
    onrejected?: ((reason: any, ms?: number) => TypeA | PromiseLike<TypeA>) | undefined | null
  ): TimedPromise<T | TypeA> {
    let catchPromise = super.catch(
      !onrejected || isNativePromiseExecutor(onrejected) ? onrejected : (reason) => onrejected(reason, this.remaining())
    ) as TimedPromise<T>;

    catchPromise.timedPromise.parent = this;

    return catchPromise;
  }
}
