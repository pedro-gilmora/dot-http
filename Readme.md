# 🧙‍♂️ **Dyn-Request**: a dynamical dotted-object syntax http-client for REST

- [🧙‍♂️ **Dyn-Request**: a dynamical dotted-object syntax http-client for REST](#️-dyn-request-a-dynamical-dotted-object-syntax-http-client-for-rest)
  - [💁‍♂️ Why?](#️-why)
  - [🔨 Let's make it work easy](#-lets-make-it-work-easy)
    - [📝 In the beginning...](#-in-the-beginning)
    - [⚡ With Callback approach](#-with-callback-approach)
    - [🍬 With `async`/`await` approach with query parameters...](#-with-asyncawait-approach-with-query-parameters)
    - [💥 Error capture](#-error-capture)

## 💁‍♂️ Why? 
I just love self-constructive objects. So, why not to create **dynamical self-constructive** HTTP client?

👇Here we go...

<br/>

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

### ⚡ With Callback approach

While we do this...
```ts
$endpointBase.get<Post[]>().then(console.log);
```
We'll get this
<table>
<tr>
<td>
  
  Url

</td>
<td>

  `https://my-json-server.typicode.com/typicode/demo/posts`

</td>
</tr>
<tr>
<td>
  
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

  ### 🍬 With `async`/`await` approach with query parameters...

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
<td>
  
  Url

</td>
<td>

  ```https://my-json-server.typicode.com/typicode/demo/posts?a=b&b=2&c=true&d=2021-11-07T16%3A42%3A16.631Z&e=```

</td>
</tr>
<tr>
<td>
  
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
<br/>

### 💥 Error capture

You can easily handle errors like this (using the same [creation context]()). `FetchError` might to the rescue in case you need it

```ts
try {
    await $api.another.missing.endpoint.post({id:1, title: 'test'});
} catch (error) {
    if(error instanceof FetchError && error.code === 404)
        notifyError("We couldn't contact the server");
}
```










