let referenceTab = -1;
let analysisTab = -1;
let hide = false;
let currentPgn = "";

function setId(tabInfo) {
    analysisTab = tabInfo.id;
}

function setPgn(response) {
    browser.tabs.sendMessage(analysisTab, {code: 2, pgn: response.pgn})
    setTimeout(transferPgn, 200);
}

function transferPgn() {
    browser.tabs.sendMessage(referenceTab, {code: 1}).then(setPgn);
}

function tabUpdated(tabId, changeInfo, tabInfo) {
    if (hide && tabId !== referenceTab && tabInfo.active) {
        browser.tabs.hide(referenceTab);
        hide = false;
    }
    if (changeInfo.status === "complete" && analysisTab === tabId) {
        transferPgn();
    }
}

function onMessage(request, sender, sendResponse) {
    if (request.code === 0) {
        currentPgn = "";
        browser.tabs.query({currentWindow: true, active: true},
            function (tabs) {
                referenceTab = tabs[0].id;
                hide = true;
                browser.tabs.create({url: "https://lichess.org/analysis"}).then(setId);
            });

    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.tabs.onUpdated.addListener(tabUpdated);
