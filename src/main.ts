/* Creating a list of urls that need to be blocked by the adblocker */
let urlFilters: chrome.webRequest.RequestFilter = {
    urls: [
        '*://adservice.google.com.pk/*',
        '*://adservice.google.com/*',
        '*://securepubads.g.doubleclick.net/*',
        '*://*.adsafeprotected.com/*',
        '*://c.aaxads.com/*',
        '*://l3.aaxads.com/*',
        '*://*.amazon-adsystem.com/*',
        '*://*.google.com/ads/*',
        '*://google.com/ads/*',
        '*://ads.pubmatic.com/*',
        '*://pubads.g.doubleclick.net/*',
        '*://acuityplatform.com/Adserver/*',
        '*://match.adsby.bidtheatre.com/*',
        '*://*.casalemedia.com/*',
        '*://*.ads.justpremium.com/*',
        '*://*.mfadsrvr.com/*',
        '*://simage2.pubmatic.com/AdServer/*',
        '*://*.adsrvr.org/*',
        '*://www.google.com.pk/ads/*',
        '*://*.ads.tremorhub.com/*',
        '*://*.servebom.com/*',
        '*://*.casalemedia.com/*',
        '*://*.advertising.com/*',
        '*://*.moatads.com/*'
    ]
}

/* Adding the "Blocking" capability to the extension */
/* Don't know much about this extra info array...  */
/* In fact, I didn't see much of an intro to this thing in the docs either */
let extraInfo: string[] = [
    'blocking'
]

/* Creating a dictionary to hold values for each tab */
let dictionary: Map<number, number> = new Map();

/* Setting up an event listener before a request is initiated */
/* This lets us block certain requests (based on the list above) even before they begin */
chrome.webRequest.onBeforeRequest.addListener((details: chrome.webRequest.WebRequestBodyDetails): chrome.webRequest.BlockingResponse => {
    /* Have to check if the entry exists in the map before incrementing it */
    /* In case, it doesn't exist, then set it to 1 */
    /*  cause of course this event runs if and only if the request to an ad network is detected */
    /* Otherwise, just increment it */
    if(dictionary.get(details.tabId) === undefined) {
        dictionary.set(details.tabId, 1);
    } else {
        dictionary.set(details.tabId, <number>dictionary.get(details.tabId) + 1);
    }


    /* Changing the value of the extension icon badge text */
    chrome.browserAction.setBadgeText({
        text: (<number>dictionary.get(details.tabId)).toString(),
        tabId: details.tabId
    });

    /* Returning a Blocking response object that sets cancel to true according to the urls list */
    return { cancel: true };
}, urlFilters, extraInfo);

/* Resetting the ad count of the tab to zero */
/* The onUpdated event changes the changeInfo only a few times with status being either "loading" or "complete" */
/* So I decided to reset the count while the page starts loading, cause till the complete staage reaches */
/* A few ads would possibly get loaded (not confirm) */
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
    if(changeInfo.status === 'loading') {
        dictionary.set(tabId, 0);
    }
});

/* Deleting the tab's ad count entry in case if the tab is closed */
/* This helps in preveting the map from over inflating even if the tabs were closed */
/* Cause if not deleted, the ad count would have stayed in the map, til the chrome window isn't closed */
chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): void => {
    dictionary.delete(tabId);
});