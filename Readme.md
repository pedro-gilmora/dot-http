# 🧙‍♂️ **HTTP-Call**: a dynamical + self-constructive + dot-syntax HTTP-client for REST

**Table of content**:
- [🧙‍♂️ **HTTP-Call**: a dynamical + self-constructive + dot-syntax HTTP-client for REST](#️-http-call-a-dynamical--self-constructive--dot-syntax-http-client-for-rest)
  - [💁‍♂️ Why?](#️-why)
  - [🔨 Let's make it work easy](#-lets-make-it-work-easy)
    - [📝 In the beginning...](#-in-the-beginning)
    - [🌈 Types...](#-types)
    - [⚡ With Callback approach](#-with-callback-approach)
    - [🍬 With `async`/`await` approach and query parameters...](#-with-asyncawait-approach-and-query-parameters)
    - [💥 Error capture](#-error-capture)
    - [🔩 BTW... we can transform typed results](#-btw-we-can-transform-typed-results)
    - [🍬 With `async`/`await` approach and query parameters...](#-with-asyncawait-approach-and-query-parameters-1)
  - [To do next: API](#to-do-next-api)

## 💁‍♂️ Why? 
I just love self-constructive objects. So, why not to create a **dynamical self-constructive** HTTP client?


>https://user-images.githubusercontent.com/33942331/140660876-2eae5e31-2772-47c9-b3dd-d612a33014b5.mp4


👇Here we go...


<br/>
<hr/>

## 🔨 Let's make it work easy
<br/>

### 📝 In the beginning...
```ts
import { HttpCall } from "dyn-request";

const 
    $api = HttpCall.create({ baseUrl: `https://my-json-server.typicode.com` }),
    paramRestProp = 'posts',
    $endpointBase = $api.typicode.demo[ paramRestProp ];

...

console.log($endpointBase.$path);
```
And there was light...
``` 
https://my-json-server.typicode.com/typicode/demo/posts
```
<br/>

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
<br/>
<hr/>
<br/>

### ⚡ With Callback approach
<br/>

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


<br/>
<hr/>
<br/>


### 🍬 With `async`/`await` approach and query parameters...

<br/>

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
<br/>

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
<br/>

### 🔩 BTW... we can transform typed results

>Consider to not specify generic-type for result in HTTP verb method, transform hook will infer types for you 
```ts
const user = { id: -1, userName: 'admin' };
const posts: UserPost[] = await $endpointBase.get(undefined, 
  {
    transform(posts: Post[]){
      //returns UserPost[]
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

<br/>

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
<td align=right valign=top>
  
  Response
  
</td>
<td>

  ```json
{
    "id": 1,
    "title": "Post 1"
}
  ```

</td>
</tr>
</table>

## To do next: API
