
import './mocks'; 
import DotHttp from "../";
import { FetchError } from '../errors';
import { Post, User, UserPost } from './types';
import { sleep } from '../utils';

let $api = DotHttp.create(() => sleep(100).then(() => `https://my-json-server.typicode.com`)); // returns a type DotHttpInstance;

const
    paramRestProp = 'posts',
    $endpointBase = $api.typicode.demo[paramRestProp],
    endpointTestPath = 'https://my-json-server.typicode.com/typicode/demo/posts';

    $api

it('URL should be built-in properly with', function () {
    expect($endpointBase.$path).resolves.toBe(endpointTestPath);
});

it('Should work with dynamic keys', function () {
    const dynProp = 'dynamic';
    expect($endpointBase[dynProp].$path).resolves.toBe(`${endpointTestPath}/dynamic`);
})

it('Should fetch typed result with callback', function () {
    $endpointBase.get<Post[]>().then(posts => expect(posts).toHaveLength(3))
});

it('Should fetch typed result with async/await and generate query params', async function () {
    const d = new Date();

    const query = { a: 'b', b: 2, c: true, d, e: null };

    const posts = await $endpointBase[1].get<Post>(query, {
        onSend({ url }) {
            const builtinUrl = endpointTestPath + `/1?a=b&b=2&c=true&d=${encodeURIComponent(d.toJSON())}&e=`;
            expect(url).toBe(builtinUrl);
        }
    });
    expect(posts).toStrictEqual({"id": 1, "title": "Post 1"})
});

it('Should post data', async function () {
    const post = await $endpointBase.post<Post>({ title: 'test' });
    expect(post).toStrictEqual({ id: 4, title: 'test' });
});

it('Should post data with query params', async function () {
    const post = await $endpointBase.post<Post>({ title: 'test' }, {
        query: {test: 1},
        onSend({ url }) {
            const builtinUrl = endpointTestPath + `?test=1`;
            expect(url).toBe(builtinUrl);
            console.log(url)
        }
    });
    expect(post).toStrictEqual({ id: 4, title: 'test' });
});

it('Should delete data', function () {
    const id = 1;
    expect($endpointBase[id].delete<void>()).resolves.toStrictEqual({});
});

it('Should fail on 404 with async/await', async function () {
    try {
        await $api.another.missing.endpoint.post({id:1, title: 'test'});
    } catch (error) {
        expect(error instanceof FetchError).toBeTruthy();
        let _err = error as FetchError;
        expect(_err.code).toBe(404);
        console.log(JSON.parse(_err.description))
    }
});

it('Should transform response with type check', async function () {
    const newPost = { title: 'test' } as Post;
    const user: User = { id: -1, name: 'admin'};
    const post: UserPost = await $endpointBase.post(newPost, {
        transform(post){
            return Object.assign(post, {user}); 
        }
    });
    expect(post).toStrictEqual({ id: 4, title: 'test', user })
});