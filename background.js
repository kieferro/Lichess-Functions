let id_new_tab = -1;
let pgn = "";
let reloaded = false;

function tab_updated(tabId, changeInfo, tabInfo) {
    if (tabId === id_new_tab && changeInfo.status === "complete" && !reloaded) {
        setTimeout(send_message, 1000);
        reloaded = true;
    }
}

function send_message() {
    browser.tabs.query({currentWindow: true, active: true},
        function (tabs) {
            browser.tabs.sendMessage(id_new_tab, {code: 2, pgn: pgn});
        });
}

function onGot(tabInfo) {
    id_new_tab = tabInfo.id;
    reloaded = false;
}

function onError(error) {
    console.log("Error:", error);
}

function open_new_tab(request, sender, sendResponse) {
    if (request.code === 0) {
        let creating = browser.tabs.create({url: "https://lichess.org/analysis"});
        creating.then(onGot, onError);
        pgn = request.pgn;
    }
}

browser.runtime.onMessage.addListener(open_new_tab);
browser.tabs.onUpdated.addListener(tab_updated);
