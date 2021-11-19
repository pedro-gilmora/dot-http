import { JSDOM } from 'jsdom';
import enableMocks from 'jest-fetch-mock';

enableMocks.dontMock();
const dom = new JSDOM();
global.Event = dom.window.Event;
global.EventTarget = dom.window.EventTarget;
global.FormData = dom.window.FormData;
global.File = dom.window.File;
global.location = dom.window.location;
global.Blob = dom.window.Blob;
global.AbortController = dom.window.AbortController;
