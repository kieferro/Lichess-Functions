let referenceTab = -1;
let analysisTab = -1;
let hide = false;

function setId(tabInfo) {
    analysisTab = tabInfo.id;
}

function tabUpdated(tabId, changeInfo, tabInfo) {
    if (hide && tabId !== referenceTab && tabInfo.active) {
        browser.tabs.hide(referenceTab);
        hide = false;
    }
    if (changeInfo.status === "complete" && analysisTab === tabId) {
        browser.tabs.sendMessage(tabId, {code: 1, referenceTab: referenceTab});
    }
}

function onMessage(request, sender, sendResponse) {
    if (request.code === 0) {
        browser.tabs.query({currentWindow: true, active: true},
            function (tabs) {
                referenceTab = tabs[0].id;
                hide = true;
                browser.tabs.create({url: "https://lichess.org/analysis"}).then(setId);
            });

    } else if (request.code === 1) {
        let message = request.message;
        message.response = sender.tab.id;
        browser.tabs.sendMessage(request.sendToId, message);
    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.tabs.onUpdated.addListener(tabUpdated);
