import 'chrome';

let urlFilters: chrome.webRequest.RequestFilter = {
    urls: [
        '*://facebook.com/*'
    ]
}

let extraInfo: string[] = [
    'blocking'
]

console.log('Created!');

chrome.webRequest.onBeforeRequest.addListener((details: chrome.webRequest.WebRequestBodyDetails): chrome.webRequest.BlockingResponse => {
    console.log(details);
    return { cancel: true };
}, urlFilters, extraInfo);