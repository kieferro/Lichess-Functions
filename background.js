let referenceTab = -1;
let hide = false;


function tabUpdated(tabId, changeInfo, tabInfo) {
    if (hide && tabId !== referenceTab && tabInfo.active) {
        browser.tabs.hide(referenceTab);
    }
}

function openNewTab(request, sender, sendResponse) {

    console.log(request);
    if (request.code === 0) {
        browser.tabs.query({currentWindow: true, active: true},
            function (tabs) {
                referenceTab = tabs[0].id;
                hide = true;
                browser.tabs.create({url: "https://lichess.org/analysis"});
            });

    }
}

browser.runtime.onMessage.addListener(openNewTab);
browser.tabs.onUpdated.addListener(tabUpdated);
