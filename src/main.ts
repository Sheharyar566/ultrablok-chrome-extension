/******************************************************************************************************************** */
/********************************** Primary settings for adBlocker ************************************************** */
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
        '*://*.moatads.com/*',
        '*://ads.videoadex.com/*',
        '*://*.stickyadstv.com/*',
        '*://cdn.taboola.com/*',
        '*://*.g.doubleclick.net/*',
        '*://*.youtube.com/pagead/*',
        '*://*.youtube.com/api/stats/ads?*',
        '*://*.googleadservices.com/pagead/*',
        '*://*.google.com/pagead/*',
        '*://*.google.com.pk/pagead/*',
        '*://jsc.adskeeper.co.uk/*',
        '*://st.bebi.com/*',
        '*://contextual.media.net/*',
        '*://inabsolor.com/*',
        '*://inpagepush.com/*',
        '*://pushsar.com/*'
    ]
};

/* Adding the "Blocking" capability to the extension */
/* Don't know much about this extra info array...  */
/* In fact, I didn't see much of an intro to this thing in the docs either */
let extraInfo: string[] = [
    'blocking'
]

/* Setting the background color for the extensions badge color */
chrome.browserAction.setBadgeBackgroundColor({
    color: [255, 140, 140, 1]
})

/******************************************************************************************************************** */
/*********************************************** Dictionaries to keep track of data ********************************* */

/* Creating a dictionary to hold values for each tab */
let countDictionary: Map<number, number> = new Map();

/* Creating a dictionary to hold urls for each tab */
let urlDictionary: Map<number, string> = new Map();

/******************************************************************************************************************** */
/************************************************* Several other url lists ****************************************** */
/* Creating a whitelist for the pages that are allowed by the user to show ads */
let whitelistedSites: string[] = [];

/* Getting the whitelisted sites from the whitelist everytime chrome starts */
chrome.storage.local.get((items: { [key: string]: string[]; }): void => {
    /* Storing the data from storage in a variable */
    let storedWhitelist: string[] | undefined = items.ultrablock_whitelist;

    /* Since it will be undefined on the first run, we need to check for undefined */
    if(storedWhitelist !== undefined) {
        whitelistedSites = storedWhitelist;
    }
});

/******************************************************************************************************************** */
/************************************************ Respective event listeners **************************************** */
/* Setting up an event listener before a request is initiated */
/* This lets us block certain requests (based on the list above) even before they begin */
chrome.webRequest.onBeforeRequest.addListener((details: chrome.webRequest.WebRequestBodyDetails): chrome.webRequest.BlockingResponse => {    
    /* Check if the tab's url (not the ad's url) is present in the whitelist */
    /* If it is present, then stop the ad blocking process */
    if(whitelistedSites.includes(<string>urlDictionary.get(details.tabId))) {
        /* Returning a Blocking response object that sets cancel to true according to the urls list */
        /* False if don't wanna block */
        return { cancel: false };
    } else {
        /* Have to check if the entry exists in the map before incrementing it */
        /* In case, it doesn't exist, then set it to 1 */
        /*  cause of course this event runs if and only if the request to an ad network is detected */
        /* Otherwise, just increment it */
        if(countDictionary.get(details.tabId) === undefined) {
            countDictionary.set(details.tabId, 1);
        } else {
            countDictionary.set(details.tabId, <number>countDictionary.get(details.tabId) + 1);
        }
        
        /* Changing the value of the extension icon badge text */
        chrome.browserAction.setBadgeText({
            text: (<number>countDictionary.get(details.tabId)).toString(),
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
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
    if(changeInfo.status === 'loading') {
        /* The count resetting functionality */
        countDictionary.set(tabId, 0);
        
        /* Extracting the domain from the url provided by the tab object */
        /* We can compare the obtained domain to block or unblock ads with */
        /* respective to the whitelist url */
        let domain: string = <string>tab.url?.split('/')[2];
        urlDictionary.set(tabId, domain);
        
        /* In case if the url is present in the whitelist (i.e. user disabled sites)*/
        /* Then change the icon to show the inactivity status */
        if(whitelistedSites.includes(<string>tab.url?.split('/')[2])) {
            /* Changing the browser action icon to inactive red style */
            chrome.browserAction.setIcon({
                path: {
                    "16": "../../assets/icons/inactive16.png",
                    "24": "../../assets/icons/inactive24.png",
                    "32": "../../assets/icons/inactive32.png",
                    "64": "../../assets/icons/inactive64.png",
                    "128": "../../assets/icons/inactive128.png"
                }
            });
        } else {
            /* Changing the browser action icon to active green style */
            chrome.browserAction.setIcon({
                path: {
                    "16": "../../assets/icons/icon16.png",
                    "24": "../../assets/icons/icon24.png",
                    "32": "../../assets/icons/icon32.png",
                    "64": "../../assets/icons/icon64.png",
                    "128": "../../assets/icons/icon128.png"
                }
            });
        }
        
        /* Saving the active site to the local storage */
        /* this makes it accessible to the extension scripts */
        /* We could have used message passing, but that only works when */
        /* the background script sends the message, however, that'd be an overkill */
        /* And far more complex to manage */
        /* Local storage, however, is far more manageable in this case */
        chrome.storage.local.set({
            "ultrablock_active_site": domain
        });
    }
});

/* Deleting the tab's ad count entry in case if the tab is closed */
/* This helps in preveting the map from over inflating even if the tabs were closed */
/* Cause if not deleted, the ad count would have stayed in the map, til the chrome window isn't closed */
chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): void => {
    countDictionary.delete(tabId);
    urlDictionary.delete(tabId);
});

/* Since the activity status of the extension changes between different tags */
/* i.e. user keeps it active on one tab, while disables on the other */
/* So, we need to check if the url is in the whitelist set by the user */
/* And this needs to be checked everytime an active tab is changed */
chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo): void => {
    /* Getting the url value from the urlDictionary which keeps track of the active urls */
    let url: string | undefined = urlDictionary.get(activeInfo.tabId);
    
    /* In case if the url is present in the whitelist (i.e. user disabled sites)*/
    /* Then change the icon to show the inactivity status */
    if(url && whitelistedSites.includes(url)) {
        /* Changing the browser action icon to inactive red style */
        chrome.browserAction.setIcon({
            path: {
                "16": "../../assets/icons/inactive16.png",
                "24": "../../assets/icons/inactive24.png",
                "32": "../../assets/icons/inactive32.png",
                "64": "../../assets/icons/inactive64.png",
                "128": "../../assets/icons/inactive128.png"
            }
        });
    } else {
        /* Changing the browser action icon to active green style */
        chrome.browserAction.setIcon({
            path: {
                "16": "../../assets/icons/icon16.png",
                "24": "../../assets/icons/icon24.png",
                "32": "../../assets/icons/icon32.png",
                "64": "../../assets/icons/icon64.png",
                "128": "../../assets/icons/icon128.png"
            }
        });
    }
    
    /* Saving the active site in local storage to make it accessible */
    chrome.storage.local.set({
        "ultrablock_active_site": url
    });
});

/* Checking if the extension has just been installed, or updated */
/* Cause we need to initiate an empty whitelist in the chrome's local storage */
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails): void => {
    if(details.reason === 'install') {
        chrome.storage.local.set({
            'ultrablock_whitelist': []
        }, () => {
            console.log('Empty whitelist initialized!');
        });
    }
});

/* Checking if the whitelisted sites in chrome has been updated */
/* This listener tracks the event related chrome.storage events */
chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange; }, areaName: string): void => {
    /* Since it returns a change object, which contains the changed data */
    /* Check if the key that got changed really was the whitelist */
    if(changes.ultrablock_whitelist !== undefined) {
        /* Store the new value to the whitelisted sites */
        whitelistedSites = changes.ultrablock_whitelist.newValue;
    }
});