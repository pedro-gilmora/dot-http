type DefautlHttpCallInit = {  
  throttle?: number;
  baseUrl?: string;
  url?: string;
  onSend?(e: HttpCallInit) : void | Promise<void>;
}

export type HttpCallInit = RequestInit & DefautlHttpCallInit & {
  transform?<TOut, TIn>(t: TIn): TOut
}

export type HttpCallInitOf<T, TransformedType = unknown> = RequestInit & DefautlHttpCallInit & {
  transform?: (v: T) => TransformedType
};

export type HttpGet<TResult> = { get(init?: HttpCallInit): Promise<TResult>; };
export type HttpGetQuery<TResult, TQuery> = { get(query?: TQuery, init?: HttpCallInit): Promise<TResult>; };
export type HttpPost<TResult> = { post(init?: HttpCallInit): Promise<TResult>; };
export type HttpPostBody<TResult, TData extends any> = { post(data?: TData, init?: HttpCallInit): Promise<TResult>; };
export type HttpPut<TResult> = { put(init?: HttpCallInit): Promise<TResult>; };
export type HttpPutBody<TResult, TData extends any> = { put(data?: TData, init?: HttpCallInit): Promise<TResult>; };
export type HttpDelete<TResult> = { delete(init?: HttpCallInit): Promise<TResult>; };
export type HttpDeleteQuery<TResult, TQuery> = { delete(query?: TQuery, init?: HttpCallInit): Promise<TResult>; };
export type HttpGetFetchAll<TResult> = { get(query?: Record<string, any>, init?: HttpCallInit): Promise<TResult[]>; };
export type HttpPostFetchAll<TResult> = { post(data?: Record<string, any>, init?: HttpCallInit): Promise<TResult[]>; };
export type HttpPutFetchAll<TResult> = { put(data?: Record<string, any>, init?: HttpCallInit): Promise<TResult[]>; };


export type HttpCallerInstance = {  
  get<TResult>(query?: any, init?: HttpCallInit): Promise<TResult>;
  post<T, TransformedT = T>(data?: T, init?: HttpCallInitOf<T, TransformedT>): Promise<TransformedT>;
  put<T>(data?: T, init?: HttpCallInitOf<T>): Promise<T>;
  delete<TOut>(query?: any, init?: HttpCallInit): Promise<TOut>;
  setOptions(arg: any): HttpCallerInstance;
  $path: string;
} & {
  [x: string|number]: HttpCallerInstance
};
