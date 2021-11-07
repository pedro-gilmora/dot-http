import { JSDOM } from 'jsdom';
import enableMocks from 'jest-fetch-mock';

enableMocks.dontMock();
const dom = new JSDOM();
global.Event = dom.window.Event;
global.EventTarget = dom.window.EventTarget;
global.FormData = dom.window.FormData;
global.File = dom.window.File;
global.Blob = dom.window.Blob;
