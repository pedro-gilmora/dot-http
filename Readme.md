# 🧙‍♂️ **DotHTTP**: a dynamical + self-constructive + dot-syntax HTTP-client for REST

> This packages relies on `fetch` API

**Table of content**:
- [🧙‍♂️ **DotHTTP**: a dynamical + self-constructive + dot-syntax HTTP-client for REST](#️-dothttp-a-dynamical--self-constructive--dot-syntax-http-client-for-rest)
  - [💁‍♂️ Why?](#️-why)
  - [🔨 Let's make it work easy](#-lets-make-it-work-easy)
    - [📝 In the beginning...](#-in-the-beginning)
    - [🌈 Types...](#-types)
    - [⚡ With Callback approach](#-with-callback-approach)
    - [🍬 With `async`/`await` approach and query parameters...](#-with-asyncawait-approach-and-query-parameters)
    - [💥 Error capture](#-error-capture)
    - [🔩 BTW... we can transform typed results](#-btw-we-can-transform-typed-results)
    - [🍬 With `async`/`await` approach and query parameters...](#-with-asyncawait-approach-and-query-parameters-1)
  - [API](#api)
    - [**`DotHttp` instance**](#dothttp-instance)
    - [**Request extra-config**](#request-extra-config)

## 💁‍♂️ Why? 
I just love self-constructive objects. So, why not to create a **dynamical self-constructive** HTTP client?


<video src="https://user-images.githubusercontent.com/33942331/140660876-2eae5e31-2772-47c9-b3dd-d612a33014b5.mp4"></video>


👇Here we go...


<hr/>

## 🔨 Let's make it work easy

### 📝 In the beginning...
```ts
import api from "dot-http";

const 
    $api = api.create(`https://my-json-server.typicode.com`),
    restPathParamProp = 'posts',
    $endpointBase = $api.typicode.demo[ restPathParamProp ];
...

console.log($endpointBase.$path);
```
And there was light...
``` 
https://my-json-server.typicode.com/typicode/demo/posts
```

### 🌈 Types...

```ts
export interface Post {
    id?: number;
    title: string;
}

export interface User {
  id: number;
  userName: string;
}

export interface UserPost extends Post{
  user: User
}
```
<hr/>

### ⚡ With Callback approach

While we do this...
```ts
$endpointBase.get<Post[]>().then(console.log);
```
We'll get this
<table>
<tr>
<td align="right">
  
  Url

</td>
<td>

  `https://my-json-server.typicode.com/typicode/demo/posts`

</td>
</tr>
<tr>
<td align="right" valign="top">  
  Response  
</td>
<td>

  ```json 
[
    {
        "id": 1,
        "title": "Post 1"
    },
    {
        "id": 2,
        "title": "Post 2"
    },
    {
        "id": 3,
        "title": "Post 3"
    }
]
```

</td>
</tr>
</table>


<hr/>


### 🍬 With `async`/`await` approach and query parameters...


Query parameters objects will be serialized as query string.
```ts
const queryParams = { a: 'b', b: 2, c: true, d: new Date(), e: null },
    id = 1;

const filtered = await $endpointBase[id].get<Post[]>(queryParams, { 
    // Tadaa: We have the ability to intercept the request before send it... 👏👏👏
    onSend({ url }) { 
        console.log(url);
    }
});
```

<table>
<tr>
<td align=right>
  
  Url

</td>
<td>

  ```https://my-json-server.typicode.com/typicode/demo/posts?a=b&b=2&c=true&d=2021-11-07T16%3A42%3A16.631Z&e=```

</td>
</tr>
<tr>
<td align=right valign=top >
  
  Response
  
</td>
<td valign="top">

  ```json
{
    "id": 1,
    "title": "Post 1"
}
  ```

</td>
</tr>
</table>

### 💥 Error capture

You can easily handle errors like this (using the same [creation context](#-in-the-beginning)). `FetchError` might to the rescue in case you need it


```ts
try {
    await $api.another.missing.endpoint.post({id:1, title: 'test'});
} catch (error) {
    if(error instanceof FetchError && error.code === 404)
        await notifyError("We couldn't contact the server", /*timeout*/3500);
}
```

### 🔩 BTW... we can transform typed results

>Consider to not specify generic-type for result in HTTP verb methods, `transform` hook will help infer types for you by specifying parameters and return types 
```ts
const user = { id: -1, userName: 'admin' };
const posts: UserPost[] = await $endpointBase.get(undefined, 
  {
    transform(posts: Post[]){
      //returns (Post & {user: User})[] which is compatible with UserPost[] 
      return posts.map(post => Object.assign(post, {user}));
    }
  }
);
```
We'll get this
<table>
<tr>
<td align=right>
  
  Url

</td>
<td>

  **`GET: `**`https://my-json-server.typicode.com/typicode/demo/posts`

</td>
</tr>
<tr>
<td align=right valign=top>
  
  Response
  
</td>
<td>

  ```json 
[
    {
        "id": 1,
        "title": "Post 1",
        "user": { 
          "id": -1, 
          "name": "admin" 
        }
    },
    {
        "id": 2,
        "title": "Post 2",
        "user": { 
          "id": -1, 
          "name": "admin" 
        }
    },
    {
        "id": 3,
        "title": "Post 3",
        "user": { 
          "id": -1, 
          "name": "admin" 
        }
    }
]
```

</td>
</tr>
</table>

----------

## API

### **`DotHttp` instance** 
<table>
  <tr>
  <th align=right valign=top >
    Members
  </th>
  <th valign="top">
    Description
  </th>
  </tr>
  <tr>
  <td valign=top >

```ts
$path: string
```

  </td>
  <td valign="top">
    <h3><i>Retrieve the built-in URL path</i></h3>
  </td>
  </tr>
  <tr>
  <td>

```ts
get<T, TOut = T>(
  query?: Record<string, any>,
  init?: DotHttpInitOf<T,TOut>
)
```

  </td>
  <td valign="top">
    <h3><i>Performs a GET request</i></h3>
    <table>
      <tr>
        <th>Parameter
        </th>
        <th>
          Description
        </th>
      </tr>
      <tr>
        <td valign="top">

```ts
query?: Record<string, any>
```        
  </td>
        <td valign="top">
          Record object to be converted to query string
        </td>
      </tr>
      <tr>
        <td valign="top">

```ts
init?: DotHttpInitOf<T,TOut>
```        
  </td>
        <td valign="top">
          Custom request configuration
        </td>
      </tr>
    </table>
  </td>
  </tr>
  <tr>
  <td>

```ts
post<T, TOut = T>(
  data?: T, 
  init?: DotHttpInitOf<T, TOut>
): Promise<TOut>;
```

  </td>
  <td valign="top">
   <h3><i> Performs a POST request</i></h3>
    <table>
      <tr>
        <th>Parameter
        </th>
        <th>
          Description
        </th>
      </tr>
      <tr>
        <td valign="top">

```ts
data?: T
```        
  </td>
        <td valign="top">
          Data to be sent.<br/> 
          Return type will be inferred from this parameter in case of request <code>transform</code> option has not been specified.
        </td>
      </tr>
      <tr>
        <td valign="top">

```ts
init?: DotHttpInitOf<T,TOut>
```        
  </td>
        <td valign="top">
          Custom request configuration
        </td>
      </tr>
    </table>
  </td>
  </tr>
  <tr>
  <td>

```ts
put<T, TOut = T>(
  data?: T, 
  init?: DotHttpInitOf<T, TOut>
): Promise<TOut>;
```

  </td>
  <td valign="top">
   <h3><i> Performs a PUT request</i></h3>
    <table>
      <tr>
        <th>Parameter
        </th>
        <th>
          Description
        </th>
      </tr>
      <tr>
        <td valign="top">

```ts
data?: T
```        
  </td>
        <td valign="top">
          Data to be sent.<br/> 
          Return type will be inferred from this parameter in case of request <code>transform</code> option has not been specified.
        </td>
      </tr>
      <tr>
        <td valign="top">

```ts
init?: DotHttpInitOf<T,TOut>
```        
  </td>
        <td valign="top">
          Custom request configuration
        </td>
      </tr>
    </table>
  </td>
  </tr>
  <tr>
  <td>

```ts
patch<T, TOut = T>(
  data?: Partial<T>, 
  init?: DotHttpInitOf<T, TOut>
): Promise<TOut>;
```

  </td>
  <td valign="top">
   <h3><i> Performs a PUT request</i></h3>
    <table>
      <tr>
        <th>Parameter
        </th>
        <th>
          Description
        </th>
      </tr>
      <tr>
        <td valign="top">

```ts
data?: Partial<T>
```        
  </td>
        <td valign="top">
          Data to be sent.<br/> 
          Return type will be inferred from this parameter in case of request <code>transform</code> option has not been specified.
        </td>
      </tr>
      <tr>
        <td valign="top">

```ts
init?: DotHttpInitOf<T,TOut>
```        
  </td>
        <td valign="top">
          Custom request configuration
        </td>
      </tr>
    </table>
  </td>
  </tr>
  <tr>
  <td>

```ts
delete<T, TOut = T>(
  query?: Record<string, any>,
  init?: DotHttpInitOf<T,TOut>
)
```

  </td>
  <td valign="top">
    <h3><i>Performs a DELETE request</i></h3>
    <table>
      <tr>
        <th>Parameter
        </th>
        <th>
          Description
        </th>
      </tr>
      <tr>
        <td valign="top">

```ts
query?: Record<string, any>
```        
  </td>
        <td valign="top">
          Record object to be converted to query string
        </td>
      </tr>
      <tr>
        <td valign="top">

```ts
init?: DotHttpInitOf<T,TOut>
```        
  </td>
        <td valign="top">
          Custom request configuration
        </td>
      </tr>
    </table>
  </td>
  </tr>
</table>


### **Request extra-config**
<table>
<tr>
<th>
Member
</th>
<th>
Description
</th>
</tr>
<tr>
<td>

```ts
onSend?(e: DotHttpInit): void | Promise<void>
```

</td>
<td>
Capture the current request before send it to the server
</td>
</tr>
<tr>
<td>

```ts
transform?(e: T): TOut | Promise<TOut>
```

</td>
<td>
When server response is OK, will be taken for transformation and return value of the operation. Type will be inferred from this
</td>
</tr>
<tr>
<td>

```ts
throttle?: number
```

</td>
<td>
For concurrent requests and mitigate server processing for several requests in the specified amount of time. 
<i>Ex: Typeahead filter behavior</i>
</td>
</tr>
<tr>
<td>

```ts
baseUrl?: string
```

</td>
<td>
Server or initial path for requests
</td>
</tr>
</table>
