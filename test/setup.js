import { jsdom } from 'jsdom';

global.document = jsdom('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
