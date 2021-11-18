declare type DefautlDotHttpInit = {
    throttle?: number;
    baseUrl?: string;
    url?: string;
    onSend?(e: DotHttpInit): void | Promise<void>;
};

export declare type DotHttpInit = RequestInit & DefautlDotHttpInit & {
    transform?<TOut, TIn>(t?: TIn): TOut;
};

export declare type DotHttpInitOf<T = unknown, TData = T, TQuery = unknown, TransformedType = TData> = RequestInit & DefautlDotHttpInit & {
    data?: TData,
    query?: TQuery,
    transform?: (v?: T) => TransformedType;
};

export declare type DotHttpInitQueryOf<T = unknown, TData = T, TQuery = unknown, TransformedType = TData> = RequestInit & DefautlDotHttpInit & {
    data?: TData,
    query: TQuery,
    transform?: (v?: T) => TransformedType;
};

export declare type DotHttpInitFullOf<T = unknown, TData = T, TQuery = unknown, TransformedType = TData> = RequestInit & DefautlDotHttpInit & {
    data: TData,
    query?: TQuery,
    transform?: (v?: T) => TransformedType;
};

export declare type DotHttpInitDataOf<T = unknown, TData = T, TQuery = unknown, TransformedType = TData> = RequestInit & DefautlDotHttpInit & {
    data?: TData,
    query?: TQuery,
    transform?: (v?: T) => TransformedType;
};

export type HttpGet<TOut, TQuery = null, TData = null> = {
    get<TTransform = TOut>(query?: TQuery, init?: DotHttpInitOf<TOut, TData, TQuery, TTransform>): Promise<TTransform>;
}

export type HttpGetFull<TOut, TQuery, TData = TOut> = {
    get<TTransform = TOut>(query: NonNullable<TQuery>, init: NonNullable<DotHttpInitFullOf<TOut, NonNullable<TData>, TQuery, TTransform>>): Promise<TTransform>;
}

export type HttpGetQuery<TOut, TQuery> = {
    get<TTransform = TOut>(query: NonNullable<TQuery>, init?: DotHttpInitOf<TOut, undefined, NonNullable<TQuery>, TTransform>): Promise<TTransform>;
}

export type HttpGetData<TData, TOut = TData> = {
    get<TTransform = TOut>(query: null, init: NonNullable<DotHttpInitDataOf<TOut, NonNullable<TData>, null, TTransform>>): Promise<TTransform>;
}

export type HttpDelete<TOut = void, TQuery = null, TData = TOut> = {
    delete<TTransform = TOut>(query?: TQuery, init?: DotHttpInitOf<TOut, TData, TQuery, TTransform>): Promise<TTransform>;
}

export type HttpDeleteFull<TQuery, TData = TOut, TOut = void> = {
    delete<TTransform = TOut>(query: NonNullable<TQuery>, init: NonNullable<DotHttpInitFullOf<TOut, NonNullable<TData>, TQuery, TTransform>>): Promise<TTransform>;
}

export type HttpDeleteQuery<TQuery, TOut = void> = {
    delete<TTransform = TOut>(query: NonNullable<TQuery>, init?: DotHttpInitOf<TOut, undefined, NonNullable<TQuery>, TTransform>): Promise<TTransform>;
}

export type HttpDeleteData<TData, TOut = void> = {
    delete<TTransform = TOut>(query: null, init: DotHttpInitDataOf<TOut, TData, null, TTransform>): Promise<TTransform>;
}

export type HttpPost<TData, TQuery = null, TOut = void> = {
    post<TTransform = TOut>(query?: TQuery, init?: DotHttpInitOf<TOut, TData, TQuery, TTransform>) : Promise<TTransform>;
}

export type HttpPostFull<TData = TOut, TQuery, TOut = TData> = {
    post<TTransform = TOut>(query: NonNullable<TQuery>, init: NonNullable<DotHttpInitFullOf<TOut, TData, TQuery, TTransform>>) : Promise<TTransform>;
}

export type HttpPostQuery<TQuery, TOut = void> = {
    post<TTransform = TOut>(query: NonNullable<TQuery>, init?: DotHttpInitOf<TOut, undefined, NonNullable<TQuery>, TTransform>) : Promise<TTransform>;
}

export type HttpPostData<TData, TOut = TData> = {
    post<TTransform = TOut>(query: null, init: DotHttpInitDataOf<TOut, TData, null, TTransform>) : Promise<TTransform>;
}

export type HttpPut<TData, TQuery = null, TOut = void> = {
    put<TTransform = TOut>(query?: TQuery, init?: DotHttpInitOf<TOut, TData, TQuery, TTransform>) : Promise<TTransform>;
}

export type HttpPutFull<TData = TOut, TQuery, TOut = TData> = {
    put<TTransform = TOut>(query: NonNullable<TQuery>, init: NonNullable<DotHttpInitFullOf<TOut, TData, TQuery, TTransform>>) : Promise<TTransform>;
}

export type HttpPutQuery<TQuery, TOut = void> = {
    put<TTransform = TOut>(query: NonNullable<TQuery>, init?: DotHttpInitOf<TOut, undefined, NonNullable<TQuery>, TTransform>) : Promise<TTransform>;
}

export type HttpPutData<TData, TOut = TData> = {
    put<TTransform = TOut>(query: null, init: DotHttpInitDataOf<TOut, TData, null, TTransform>) : Promise<TTransform>;
}

export type HttpPatch<TData, TQuery = null, TOut = void> = {
    patch<TTransform = TOut>(query?: TQuery, init?: DotHttpInitOf<TOut, TData, TQuery, TTransform>) : Promise<TTransform>;
}

export type HttpPatchFull<TData = TOut, TQuery, TOut = TData> = {
    patch<TTransform = TOut>(query: NonNullable<TQuery>, init: NonNullable<DotHttpInitFullOf<TOut, TData, TQuery, TTransform>>) : Promise<TTransform>;
}

export type HttpPatchQuery<TQuery, TOut = void> = {
    patch<TTransform = TOut>(query: NonNullable<TQuery>, init?: DotHttpInitOf<TOut, undefined, NonNullable<TQuery>, TTransform>) : Promise<TTransform>;
}

export type HttpPatchData<TData, TOut = TData> = {
    patch<TTransform = TOut>(query: null, init: DotHttpInitDataOf<TOut, TData, null, TTransform>) : Promise<TTransform>;
}