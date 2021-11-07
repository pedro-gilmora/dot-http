import { merge, sleep } from "./utils";
import { HttpCallerInstance, HttpCallInit } from "./shims-ts";
import { FetchError } from "./errors";

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

const throttlingMap = {} as { [x: string]: { controller: AbortController, awaiter: Promise<void> } };

export class HttpCall {

  #opts: HttpCallInit | (() => Promise<HttpCallInit>) = null as any;

  constructor(opts?: any) {
    this.#opts = opts ?? {};
  }

  withOptions(url: string, options: Record<string, any>) {
    this.#opts = options ?? {};
    return this
  }

  getUrl(url: string) {
    return url
  }

  get<T>(url: string, data?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('get', url + toQuery(data), null, merge(options, {}));
  }

  post<T>(url: string, data?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('post', url, data, merge(options, {}));
  }

  put<T>(url: string, data?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('put', url, data, merge(options, {}));
  }

  delete<T>(url: string, urlParams?: any, options: HttpCallInit = {}): Promise<T> {
    return this.doRequest('delete', url, urlParams, merge(options, {}));
  }

  private async doRequest(method: string, url: string, body: any, extraOptions: HttpCallInit): Promise<any> {
    let controller: AbortController, signal: AbortSignal | undefined = undefined
    const callingPoint = new Error().stack!.split(throttleDetect)?.[1] ?? '';
    if (extraOptions.throttle && callingPoint) {
      let { controller, awaiter } = throttlingMap[callingPoint] ?? {};

      //If exists a controller and throttle time overcome
      if (controller) {
        //Abort the actual controller
        controller.abort();
        await (awaiter = awaiter.then(async () => await sleep(extraOptions.throttle!)));
        awaiter = Promise.resolve()
      }

      //Create another controller and get the signal
      controller = new AbortController();
      signal = controller.signal;
      //Register the new session
      throttlingMap[callingPoint] = { controller, awaiter: awaiter ?? Promise.resolve() };
      console.log('Request registered')

    }

    const opts = this.#opts;

    if (typeof opts === 'function')
      this.#opts = await opts();

    url = fixUpUrl(url ?? '', (opts as HttpCallInit).baseUrl);
    extraOptions = extraOptions ?? {};

    delete extraOptions.method;

    extraOptions = merge({
      method,
      headers: (opts as HttpCallInit).headers ?? {},
      signal
      // mode: 'cors',
      // headers: await AuthService.instance?.genHeaders()
    }, extraOptions ?? {});

    tr:
    if (body instanceof FormData)
      (extraOptions.headers as any)['Content-Type'] = "multipart/form-data";
    else if (body instanceof Object)
      (extraOptions.headers as any)['Content-Type'] = "application/json";
    else if (body instanceof File) {
      (extraOptions.headers as any)['Content-Type'] = "multipart/form-data";
      const newForm = new FormData()
      newForm.append("file", body);
      newForm.append("fileName", body.name);
      body = newForm
    }
    if (body)
      extraOptions.body = body instanceof FormData ? body : JSON.stringify(body ?? null);

    extraOptions.onSend?.({ ...extraOptions, url })

    const response = await fetch(url, extraOptions);
    
    let result: any

    if (response.headers.get('Content-Type') == "application/octet-stream")
      result = await response.blob();
    else if (response.headers.get('Content-Type')?.includes('application/json'))
      result = await response.json();
    else if (response.headers.get('Content-Type')?.includes('multipart/form-data'))
      result = await response.formData();
    else
      result = await response.text();

    result = extraOptions.transform?.(result) ?? result

    if (response.ok)
      return result

    let { status: code, statusText: message } = response;

    throw new FetchError(code, message, result);
  }

  static create(init: HttpCallInit | Promise<HttpCallInit>) {
    const instance = new HttpCall(init)
    return new Proxy([] as string[], {
      // @ts-ignore
      get(path, part: string | number, r: any) {
        const partStr = `${encodeURIComponent(part?.toString() ?? '')}`,
          pathStr = path.join('/');

        if (partStr in instance) {

          const propValue = (instance as any)[partStr];

          if (/(add|remove|dispatch)?Event(Listener)/)

            if (typeof propValue === "function") {
              return (...args: any[]) => {
                const result = propValue.call(instance, pathStr, ...args);
                return result === instance ? r : result;
              }
            }

          return propValue
        }

        if (part === "$path") {
          return fixUpUrl(pathStr, (instance.#opts as HttpCallInit).baseUrl);
        }

        return new Proxy([...path, part?.toString()] as string[], this as ProxyHandler<string[]>)
      }
    }) as any as HttpCallerInstance
  }
}
