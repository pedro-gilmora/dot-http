
import './mocks'; 
import { HttpCall } from "../";
import { FetchError } from '../errors';
import { Post, User, UserPost } from './types';

const $api = HttpCall.create({ baseUrl: `https://my-json-server.typicode.com` }) // returns a type HttpCallInstance;

const
    paramRestProp = 'posts',
    $endpointBase = $api.typicode.demo[paramRestProp],
    endpointTestPath = 'https://my-json-server.typicode.com/typicode/demo/posts';

it('URL should be built-in properly', function () {
    expect($endpointBase.$path).toBe(endpointTestPath);
});

it('Should work with dynamic keys', function () {
    const dynProp = 'dynamic';
    expect($endpointBase[dynProp].$path).toBe(`${endpointTestPath}/dynamic`);
})

it('Should fetch typed result with callback', function () {
    $endpointBase.get<Post[]>().then(posts => expect(posts).toHaveLength(3))
})

it('Should fetch typed result with async/await and generate query params', async function () {
    const d = new Date();
    const posts = await $endpointBase.get<Post[]>({ a: 'b', b: 2, c: true, d, e: null }, {
        onSend({ url }) {
            const builtinUrl = endpointTestPath + `?a=b&b=2&c=true&d=${encodeURIComponent(d.toJSON())}&e=`;
            expect(url).toBe(builtinUrl);
            console.log(url)
        }
    });
    expect(posts).toHaveLength(3)
});

it('Should post data', async function () {
    const post = await $endpointBase.post<Post>({ title: 'test' });
    expect(post).toStrictEqual({ id: 4, title: 'test' })
});

it('Should delete data', function () {
    const id = 1;
    expect($endpointBase[id].delete<void>()).resolves.toStrictEqual({})
});

it('Should fail on 404 with async/await', async function () {
    try {
        await $api.another.missing.endpoint.post({id:1, title: 'test'});
    } catch (error) {
        expect(error instanceof FetchError).toBeTruthy();
        let _err = error as FetchError;
        expect(_err.code).toBe(404);
        console.log(_err)
    }
});

it('Should transform response with type check', async function () {
    const newPost = { title: 'test' } as Post;
    const post = await $endpointBase.post(newPost, {
        transform(post){
            return Object.assign(post, {user: {} as User}) as UserPost; 
        }
    });
    expect(post).toStrictEqual({ id: 4, title: 'test', user: {} })
});
