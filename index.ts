import { merge, sleep } from "./utils";
import { FetchError } from "./errors";

type DefautlHttpCallInit = {
  throttle?: number;
  baseUrl?: string;
  url?: string;
  onSend?(e: HttpCallInit): void | Promise<void>;
}

export type HttpCallInit = RequestInit & DefautlHttpCallInit & {
  transform?<TOut, TIn>(t: TIn): TOut
}

export type HttpCallInitOf<T, TransformedType = unknown> = RequestInit & DefautlHttpCallInit & {
  transform?: (v: T) => TransformedType
};

export type HttpCallerInstance = {
  get<T, TransformedType = T>(query?: Record<string, any>, init?: HttpCallInitOf<T, TransformedType>): Promise<TransformedType>;
  post<T, TransformedT = T>(data?: T, init?: HttpCallInitOf<T, TransformedT>): Promise<TransformedT>;
  put<T, TransformedT = T>(data?: T, init?: HttpCallInitOf<T, TransformedT>): Promise<TransformedT>;
  delete<T, TransformedType = T>(query?: Record<string, any>, init?: HttpCallInitOf<T, TransformedType>): Promise<TransformedType>;
  withOptions(arg: HttpCallInit): HttpCallerInstance;
  withQuery(arg: Record<string, any>): HttpCallerInstance;
  $path: string;
} & {
  [x: string | number]: HttpCallerInstance
};

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
      .filter(([key, val]) => val !== undefined)
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

async function throttleUp<T>(promise: Promise<T>, callingPoint: string, ms: number){
  const 
    controller = throttlingMap[callingPoint] ?? (throttlingMap[callingPoint] = {}),
    current = Date.now();

  const lastThrottling = Object.keys(controller).pop()!;

  controller[current] = new AbortController();

  console.log("Last registry:", lastThrottling);

  await sleep(ms);
    
  if(controller[lastThrottling]){
    controller[lastThrottling].abort();
  }

  let result = await promise;
  
  try{
    if(controller[current]?.signal?.aborted){
      throw new Error(`Promise with result: [${result}] was cancelled by throttling`);
    }
    return result
  }
  catch(e){
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

export class HttpCall {

  #opts: HttpCallInit | (() => Promise<HttpCallInit>) = null as any;
  #query: Record<string, any>;

  constructor(opts?: any) {
    this.#opts = opts ?? {};
  }

  withOptions(url: string, options: HttpCallInit) {
    this.#opts = options ?? {};
    return this
  }

  withQuery(url: string, query: Record<string, any>) {
    this.#query = query ?? {};
    return this
  }

  getUrl(url: string) {
    return url
  }

  get<T>(url: string, data?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('get', url + toQuery(Object.assign(this.#query ?? {}, data ?? {})), undefined, merge(options, {}));
  }

  post<T>(url: string, data?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('post', url + toQuery(this.#query ?? {}), data, merge(options, {}));
  }

  put<T>(url: string, data?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('put', url + toQuery(this.#query ?? {}), data, merge(options, {}));
  }

  delete<T>(url: string, urlParams?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('delete', url + toQuery(Object.assign(this.#query ?? {}, urlParams ?? {})), undefined, merge(options, {}));
  }

  send<T>(url: string, urlParams?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest(options.method ?? 'get', url + toQuery(Object.assign(this.#query ?? {}, urlParams ?? {})), undefined, merge(options, {}));
  }

  private async doRequest(
    method: string, 
    url: string, 
    body: any, 
    {onSend, throttle, baseUrl, transform, ...options}: HttpCallInit
  ): Promise<any> {

    const opts = this.#opts;

    if (typeof opts === 'function')
      this.#opts = await opts();

    options = options ?? {};

    delete options.method;

    options = merge({
      method,
      headers: (opts as HttpCallInit).headers ?? {},
    }, options ?? {});

    options.url = fixUpUrl(url ?? '', (opts as HttpCallInit).baseUrl);

    if (body instanceof FormData)
      (options.headers as any)['Content-Type'] = "multipart/form-data";
    else if (body instanceof Object)
      (options.headers as any)['Content-Type'] = "application/json";
    else if (body instanceof File) {
      (options.headers as any)['Content-Type'] = "multipart/form-data";
      const form = new FormData()
      form.append("file", body);
      form.append("fileName", body.name);
      body = form
    }

    if (body)
      options.body = body instanceof FormData ? body : JSON.stringify(body ?? null);

    let afterOnSend = onSend?.(options)

    if (afterOnSend instanceof Promise)
      await afterOnSend;


    const callingPoint = (new Error().stack?.split(throttleDetect)?.[1] ?? '').trim();

    const response = await (callingPoint && throttle 
      ? throttleUp(fetch(options.url!, options), callingPoint, throttle) 
      : fetch(options.url!, options) );

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

  static create(init: HttpCallInit | Promise<HttpCallInit>) {

    const instance = new HttpCall(init);

    return new Proxy([] as string[], {

      // @ts-ignore
      get(path, part: string | number, r: any) {

        const partStr = `${encodeURIComponent(part?.toString() ?? '')}`,
          pathStr = path.join('/');

        if (partStr in instance) {

          const propValue = (instance as any)[partStr];

          if (typeof propValue === "function") {
            return (...args: any[]) => {
              const result = propValue.call(instance, pathStr, ...args);
              return result === instance ? r : result;
            };
          }

          return propValue
        }

        if (part === "$path") {
          return fixUpUrl(pathStr, (instance.#opts as HttpCallInit).baseUrl);
        }

        return new Proxy([...path, part?.toString()] as string[], this as ProxyHandler<string[]>);

      }

    }) as any as HttpCallerInstance
  }
}
