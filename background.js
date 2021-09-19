let referenceTab = -1;
let analysisTab = -1;
let hide = false;

function setId(tabInfo) {
    analysisTab = tabInfo.id;
}

function establishConnection() {
    browser.tabs.sendMessage(referenceTab, {code: 2});
}

function tabUpdated(tabId, changeInfo, tabInfo) {
    if (hide && tabId !== referenceTab && tabInfo.active) {
        browser.tabs.hide(referenceTab);
        hide = false;
    }
    if (changeInfo.status === "complete" && analysisTab === tabId) {
        setTimeout(establishConnection, 300);
    }
}

function start(message) {
    if (!message.permission) {
        return;
    }
    browser.tabs.query({currentWindow: true, active: true},
        function (tabs) {
            referenceTab = tabs[0].id;
            hide = true;
            browser.tabs.create({url: "https://lichess.org/analysis"}).then(setId);
        });
}

function onMessage(request, sender, sendResponse) {
    if (request.code === 0) {
        referenceTab = -1;
        analysisTab = -1;

        browser.tabs.query({currentWindow: true, active: true},
            function (tabs) {
                browser.tabs.sendMessage(tabs[0].id, {code: 1}).then(start);
            });
    } else if (request.code === 1) {
        browser.tabs.sendMessage(analysisTab, {code: 3, data: request});
    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.tabs.onUpdated.addListener(tabUpdated);
