import { merge, sleep } from "./utils";
import { FetchError } from "./errors";

type DefautlDotHttpInit = {
  throttle?: number;
  baseUrl?: string;
  url?: string;
  query?: any,
  onSend?(e: DotHttpInit): void | Promise<void>;
}

export type DotHttpInit = RequestInit & DefautlDotHttpInit & {
  transform?<TOut, TIn>(t: TIn): TOut
}

export type DotHttpInitOf<T, TransformedType = unknown> = RequestInit & DefautlDotHttpInit & {
  transform?: (v: T) => TransformedType
};

export type DotHttpAsyncInstance = {
  $path: Promise<string>;
  get<T, TransformedType = T>(query?: Record<string, any>, init?: DotHttpInitOf<T, TransformedType>): Promise<TransformedType>;
  post<T, TransformedT = T>(data?: T, init?: DotHttpInitOf<T, TransformedT>): Promise<TransformedT>;
  put<T, TransformedT = T>(data?: T, init?: DotHttpInitOf<T, TransformedT>): Promise<TransformedT>;
  patch<T, TransformedT = T>(data?: Partial<T>, init?: DotHttpInitOf<T, TransformedT>): Promise<TransformedT>;
  delete<T, TransformedType = T>(query?: Record<string, any>, init?: DotHttpInitOf<T, TransformedType>): Promise<TransformedType>;
  withOptions(arg: DotHttpInit): DotHttpAsyncInstance;
  withQuery(arg: Record<string, any>): DotHttpAsyncInstance;
} & {
  [x: string | number]: DotHttpAsyncInstance
}
export type DotHttpInstance = {
  $path: string;
  get<T, TransformedType = T>(query?: Record<string, any>, init?: DotHttpInitOf<T, TransformedType>): Promise<TransformedType>;
  post<T, TransformedT = T>(data?: T, init?: DotHttpInitOf<T, TransformedT>): Promise<TransformedT>;
  put<T, TransformedT = T>(data?: T, init?: DotHttpInitOf<T, TransformedT>): Promise<TransformedT>;
  patch<T, TransformedT = T>(data?: Partial<T>, init?: DotHttpInitOf<T, TransformedT>): Promise<TransformedT>;
  delete<T, TransformedType = T>(query?: Record<string, any>, init?: DotHttpInitOf<T, TransformedType>): Promise<TransformedType>;
  withOptions(arg: DotHttpInit): DotHttpInstance;
  withQuery(arg: Record<string, any>): DotHttpInstance;
} & {
  [x: string | number]: DotHttpInstance
}

const throttleDetect = /\$Throttle.*?\((.*?)\)/gm;

export function encode(s: string | number | boolean) {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    x => `%${x
      .charCodeAt(0)
      .toString(16)
      .toUpperCase()}`
  );
}

// noinspection JSUnusedGlobalSymbols
export function fromQuery(obj?: string): Record<string, any> {
  return Object.fromEntries(obj?.split('&')?.map(x => x.split('=').map((x, i) => {
    if (i === 0)
      return x;
    try {
      return JSON.parse(x);
    }
    catch (e) {
      return x;
    }
  })) ?? [])
}

export function toQuery(obj: any) {
  return (
    "?" +
    Object.entries<any>(obj || {})
      .filter(([, val]) => val !== undefined)
      .map(([key, val]) => {
        return `${key}=${encode(
          val instanceof Date
            ? val.toJSON()
            : val instanceof Object
              ? JSON.stringify(val)
              : (val ?? ""))}`;
      })
      .join("&")
  );
}

const nonLocal = /^(?:\/\/|[\w+]{3,}:\/\/(\/)?)/;

export function fixUpUrl(url: string, baseUrl: string | undefined = undefined) {
  if (!nonLocal.test(url))
    url = (baseUrl ?? location.origin) + (url[0] !== "/" ? "/" : "") + url;
  return url;
}

async function throttleUp(options: DotHttpInit, callingPoint: string, ms: number) {
  const
    controller = throttlingMap[callingPoint] ?? (throttlingMap[callingPoint] = {}),
    current = Date.now();

  const lastThrottling = Object.keys(controller).pop()!;

  controller[current] = new AbortController();

  // console.log("Last registry:", lastThrottling);

  if (controller[lastThrottling]) {
    controller[lastThrottling].abort();
  }

  options.signal = controller[current].signal

  await sleep(ms);

  try {
    return await fetch(options.url!, options);
  }
  catch (e) {
    throw e;
  }
  finally {
    delete controller[current];
  }

}

type ThrottlingRegistry = {
  //method$Throttle location
  [x: string]: {
    [x: string]: AbortController;
  };
};

const throttlingMap = {} as ThrottlingRegistry;

export default class DotHttp {

  #opts: string | DotHttpInit |  (() => Promise<string | DotHttpInit>);

  constructor(opts?: string | DotHttpInit | (() => Promise<string | DotHttpInit>)) {
    this.#opts = opts ?? {};
  }

  private async doRequest(
    method: string,
    pathAndQuery: string,
    { onSend, query, throttle, baseUrl, transform, ...options }: DotHttpInit
  ): Promise<any> {

    let opts = await this.resolveOptions();

    options = options ?? {};

    delete options.method;

    if (options.headers instanceof Headers)
      options.headers = Object.fromEntries(options.headers.entries())

    if (opts.headers instanceof Headers)
      opts.headers = Object.fromEntries(opts.headers.entries())

    if (!opts.headers)
      opts.headers = {};
    if (!options.headers)
      options.headers = {};

    options = merge({
      method,
      ...opts,
    }, options);

    options.url = fixUpUrl(pathAndQuery ?? '', (opts as DotHttpInit).baseUrl);

    if (options.body instanceof FormData)
      (options.headers as any)['Content-Type'] = "multipart/form-data";
    else if (options.body instanceof Object)
      (options.headers as any)['Content-Type'] = "application/json";
    else if ((options.body as any) instanceof Blob) {
      (options.headers as any)['Content-Type'] = "multipart/form-data";
      const form = new FormData()
      form.append("content", options.body as any);

      if ((options.body as any) instanceof File)
        form.append("fileName", ((options.body as any) as File).name);

      options.body = form
    }

    if (options.body instanceof Object)
      options.body = options.body instanceof FormData ? options.body : JSON.stringify(options.body ?? null);

    let afterOnSend = onSend?.(options)

    if (afterOnSend instanceof Promise)
      await afterOnSend;


    const callingPoint = (new Error().stack?.split(throttleDetect)?.[1] ?? '').trim();

    const response = (callingPoint && throttle
      ? await throttleUp(options, callingPoint, throttle)
      : await fetch(options.url!, options));

    let result: any

    if (response.headers.get('Content-Type') == "application/octet-stream")
      result = await response.blob();
    else if (response.headers.get('Content-Type')?.includes('application/json'))
      result = await response.json();
    else if (response.headers.get('Content-Type')?.includes('multipart/form-data'))
      result = await response.formData();
    else
      result = await response.text();

    result = transform?.(result) ?? result

    if (result instanceof Promise)
      result = await result

    if (response.ok)
      return result

    let { status: code, statusText: message } = response;

    throw new FetchError(code, message, result);
  }

  private async resolveOptions() {
    if (typeof this.#opts === 'function') {
      this.#opts = await this.#opts();
      return this.#opts = (typeof this.#opts === "string") ? ({ baseUrl: this.#opts }) : this.#opts;
    }
    return Promise.resolve(this.#opts as DotHttpInit);
  }

  static create<T extends string | DotHttpInit | (() => Promise<string | DotHttpInit>)>(init: T) : (T extends () => Promise<string | DotHttpInit> ? DotHttpAsyncInstance : DotHttpInstance){

    const instance = new DotHttp(typeof init === 'string' ? { baseUrl: init } : init),
      isAsyncConfig = typeof init === 'function';

    return new Proxy([] as string[], {

      // @ts-ignore
      get(path, part: string | number) {

        const partStr = `${encodeURIComponent(part?.toString() ?? '')}`,
          pathStr = path.join('/');

        if (["get", "post", "put", "patch", "delete"].includes(partStr)) {

          return (async (...[send, options = {} as any]) => {
            let query: string;
            if (["get", "delete"].includes(partStr))
              query = send
            else {
              query = options.query;
              delete options.query
              if (send)
                options.body = send;
              else {
                options.body = options.data;
                delete options.data;
              }
            }

            let queryString = toQuery(query ?? {}),
              url = pathStr + (queryString.trim() !== '?' ? queryString : '');

            return instance.doRequest(partStr, url, options)
          });
        }

        const propValue = (instance as any)[partStr];

        if (typeof propValue === 'function')
          return propValue;

        if (part === "$path"){
          if(isAsyncConfig)
            return instance.resolveOptions().then(opts => 
              fixUpUrl(pathStr, opts.baseUrl)
            );
          return fixUpUrl(pathStr, (instance.#opts as DotHttpInit).baseUrl);
        }

        return new Proxy([...path, part?.toString()] as string[], this as ProxyHandler<string[]>);
      }

    }) as any
  }
}
