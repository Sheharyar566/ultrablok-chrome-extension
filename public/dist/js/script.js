"use strict";
/******************************************************************************************************* */
/********************************************** Global variables *************************************** */
/* Variable to store active site from chrome's local storage */
let ultrablock_active_site = '';
let isWhitelisted = false;
let sites = [];
/******************************************************************************************************* */
/********************************************Getting data from chrome storage ************************** */
/* Using a variable to get the data stored in chrome storage */
chrome.storage.local.get('ultrablock_active_site', (data) => {
    ultrablock_active_site = data.ultrablock_active_site;
});
/* Getting the whitelisted sites from chrome storage */
chrome.storage.local.get('ultrablock_whitelist', (data) => {
    sites = data.ultrablock_whitelist;
});
/*************************************************************************************************************** */
/********************************************** Popup content control ****************************************** */
/* The js file to control the content of popup html */
window.onload = () => {
    let toggleButton = document.querySelector('#switch-toggler');
    /* Checking the whitelist status of the website */
    checkStatus();
    /* Rendering the extension based on the initial whitelist status */
    render();
    /* Setting up a click event listener for the switch toggle */
    toggleButton.addEventListener('click', () => {
        /* Adding or removing the site from the whitelist */
        addOrRemoveWhitelist();
        /* Inverting the state, as it was initally set as enabled */
        /* And after clicking gets disabled */
        render();
    });
};
/****************************************************************************************************** */
/******************************************** Functions to whitelist or unwhitelist ******************* */
/* Fucntion to check whether is site is whitelisted or not */
const checkStatus = function () {
    isWhitelisted = sites.includes(ultrablock_active_site);
};
/* Creating a function to add the site to url whitelist */
const addOrRemoveWhitelist = function () {
    /* If the site is already whitelisted */
    if (isWhitelisted) {
        /* Remove from the whitelist */
        sites = sites.filter((site) => {
            return site !== ultrablock_active_site;
        });
        /* Update the whitelist in chrome.storage.local */
        console.log(sites);
        chrome.storage.local.set({
            'ultrablock_whitelist': sites
        });
        /* Set the state of the extension to disabled */
        isWhitelisted = false;
    }
    else {
        /* Pushing the list to the local whitelist */
        sites.push(ultrablock_active_site);
        /* Saving the data to local storage */
        chrome.storage.local.set({
            'ultrablock_whitelist': sites
        });
        /* Set the state of the extension to disabled */
        isWhitelisted = true;
    }
    /* Reloading the current tab to show the status */
    chrome.tabs.reload();
};
/* Function to change and render extension state */
const render = () => {
    let toggleButton = document.querySelector('#switch-toggler');
    let switchDiv = document.querySelector('#switch');
    let icon = document.querySelector('#icon');
    let arrowTop = document.querySelector('.arrow-top');
    let arrowBottom = document.querySelector('.arrow-bottom');
    let controllerPrimaryText = document.querySelector('#controller-main-text');
    let controllerSecondaryText = document.querySelector('#controller-secondary-text');
    let infoTop = document.querySelector('#info-top');
    let infoBottom = document.querySelector('#info-bottom');
    /* Showing the data from the local storage in the controller section */
    infoBottom.innerText = ultrablock_active_site;
    /* In case if the button was clicked, then disable the adblocker */
    if (isWhitelisted) {
        /* change the background and border color of toggle switch */
        /* Moreover, change its position from left to right */
        /* Also change the respective colors on entire page */
        toggleButton.style.left = '168px';
        toggleButton.style.backgroundColor = 'rgb(252, 56, 56)';
        toggleButton.style.borderColor = 'rgb(238, 61, 51)';
        /* Change the toggle container's background to red */
        switchDiv.style.backgroundColor = 'rgb(252, 56, 56, 0.1)';
        /* Change the controller's text */
        controllerPrimaryText.innerText = 'Enable';
        controllerSecondaryText.innerText = 'Block ads';
        /* Changing the info section's text */
        infoTop.innerText = 'Protection is disabled';
        /* Also animating the arrow icon */
        arrowTop.classList.add('transform');
        arrowBottom.classList.add('transform');
        /* Change the logo to red */
        icon.src = 'assets/icons/inactive64.png';
    }
    else {
        /* And when enabled, then revert back the original styles */
        toggleButton.style.left = '0';
        toggleButton.style.backgroundColor = 'rgb(53, 213, 211, 1)';
        toggleButton.style.borderColor = 'rgb(34, 208, 203, 1)';
        /* Change the toggle container's background color to aqua */
        switchDiv.style.backgroundColor = 'rgb(53, 213, 211, 0.1)';
        /* Change the controller's text */
        controllerPrimaryText.innerText = 'Disable';
        controllerSecondaryText.innerText = 'Don\'t block';
        /* Animating back to original state */
        arrowTop.classList.remove('transform');
        arrowBottom.classList.remove('transform');
        /* Changing the info section's text */
        infoTop.innerText = 'Protection is enabled';
        /* Change the logo to aqua */
        icon.src = 'assets/icons/icon64.png';
    }
};
