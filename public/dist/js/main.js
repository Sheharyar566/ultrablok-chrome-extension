import 'chrome';
let urlFilters = {
    urls: [
        '*://facebook.com/*'
    ]
};
let extraInfo = [
    'blocking'
];
console.log('Created!');
chrome.webRequest.onBeforeRequest.addListener((details) => {
    console.log(details);
    return { cancel: true };
}, urlFilters, extraInfo);
