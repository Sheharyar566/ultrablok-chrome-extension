"use strict";
/******************************************************************************************************************** */
/********************************** Primary settings for adBlocker ************************************************** */
/* Creating a list of urls that need to be blocked by the adblocker */
let urlFilters = {
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
        '*://*.moatads.com/*',
    ]
};
/* Adding the "Blocking" capability to the extension */
/* Don't know much about this extra info array...  */
/* In fact, I didn't see much of an intro to this thing in the docs either */
let extraInfo = [
    'blocking'
];
/******************************************************************************************************************** */
/*********************************************** Dictionaries to keep track of data ********************************* */
/* Creating a dictionary to hold values for each tab */
let countDictionary = new Map();
/* Creating a dictionary to hold urls for each tab */
let urlDictionary = new Map();
/******************************************************************************************************************** */
/************************************************* Several other url lists ****************************************** */
/* Creating a whitelist for the pages that are allowed by the user to show ads */
let whitelist = [];
/******************************************************************************************************************** */
/************************************************ Respective event listeners **************************************** */
/* Setting up an event listener before a request is initiated */
/* This lets us block certain requests (based on the list above) even before they begin */
chrome.webRequest.onBeforeRequest.addListener((details) => {
    /* Check if the tab's url (not the ad's url) is present in the whitelist */
    /* If it is present, then stop the ad blocking process */
    if (whitelist.includes(urlDictionary.get(details.tabId))) {
        /* Returning a Blocking response object that sets cancel to true according to the urls list */
        /* False if don't wanna block */
        return { cancel: false };
    }
    else {
        /* Have to check if the entry exists in the map before incrementing it */
        /* In case, it doesn't exist, then set it to 1 */
        /*  cause of course this event runs if and only if the request to an ad network is detected */
        /* Otherwise, just increment it */
        if (countDictionary.get(details.tabId) === undefined) {
            countDictionary.set(details.tabId, 1);
        }
        else {
            countDictionary.set(details.tabId, countDictionary.get(details.tabId) + 1);
        }
        /* Changing the value of the extension icon badge text */
        chrome.browserAction.setBadgeText({
            text: countDictionary.get(details.tabId).toString(),
            tabId: details.tabId
        });
        /* Returning a Blocking response object that sets cancel to true according to the urls list */
        /* True if blocking */
        return { cancel: true };
    }
    return { cancel: true };
}, urlFilters, extraInfo);
/* Resetting the ad count of the tab to zero */
/* The onUpdated event changes the changeInfo only a few times with status being either "loading" or "complete" */
/* So I decided to reset the count while the page starts loading, cause till the complete staage reaches */
/* A few ads would possibly get loaded (not confirm) */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    var _a;
    if (changeInfo.status === 'loading') {
        /* The count resetting functionality */
        countDictionary.set(tabId, 0);
        /* Extracting the domain from the url provided by the tab object */
        /* We can compare the obtained domain to block or unblock ads with */
        /* respective to the whitelist url */
        let domain = (_a = tab.url) === null || _a === void 0 ? void 0 : _a.split('/')[2];
        urlDictionary.set(tabId, domain);
    }
});
/* Deleting the tab's ad count entry in case if the tab is closed */
/* This helps in preveting the map from over inflating even if the tabs were closed */
/* Cause if not deleted, the ad count would have stayed in the map, til the chrome window isn't closed */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    countDictionary.delete(tabId);
    urlDictionary.delete(tabId);
});
