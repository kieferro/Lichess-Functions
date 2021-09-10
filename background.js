let referenceTab = -1;
let analysisTab = -1;
let hide = false;
let alreadyTransfered = false;

function setId(tabInfo) {
    analysisTab = tabInfo.id;
}

function referenceClosed() {
    referenceTab = -1;
    analysisTab = -1;
}

function analysisClosed() {
    if (alreadyTransfered) {
        alreadyTransfered = false;
        browser.tabs.show(referenceTab);
        referenceTab = -1;
        analysisTab = -1;
    }
}

function setPgn(response) {
    if (analysisTab !== -1) {
        browser.tabs.sendMessage(analysisTab, {
            code: 3,
            pgn: response.pgn,
            timeWhite: response.timeWhite,
            timeBlack: response.timeBlack
        }).then(function () {
            alreadyTransfered = true;
        }).catch(analysisClosed);
        setTimeout(transferPgn, 200);
    }
}

function transferPgn() {
    if (referenceTab !== -1) {
        browser.tabs.sendMessage(referenceTab, {code: 2}).then(setPgn).catch(referenceClosed);
    }
}

function tabUpdated(tabId, changeInfo, tabInfo) {
    if (hide && tabId !== referenceTab && tabInfo.active) {
        browser.tabs.hide(referenceTab);
        hide = false;
    }
    if (changeInfo.status === "complete" && analysisTab === tabId) {
        alreadyTransfered = false;
        transferPgn();
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
    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.tabs.onUpdated.addListener(tabUpdated);
