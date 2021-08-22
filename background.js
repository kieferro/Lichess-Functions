let id_new_tab = -1;
let id_reference_tab = -1;
let reloaded = false;
let pgn = "";
let last_pgn = "";

function get_pgn() {
    browser.tabs.sendMessage(id_reference_tab, {code: 1});
}

function tab_updated(tabId, changeInfo, tabInfo) {
    if (tabId === id_new_tab && changeInfo.status === "complete" && !reloaded) {
        get_pgn();
        reloaded = true;
    }
}

function send_message() {
    browser.tabs.sendMessage(id_new_tab, {code: 2, pgn: pgn});
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
        browser.tabs.query({currentWindow: true, active: true},
            function (tabs) {
                id_reference_tab = tabs[0].id;
            });
        let creating = browser.tabs.create({url: "https://lichess.org/analysis"});
        creating.then(onGot, onError);
    } else if (request.code === 1) {
        pgn = request.pgn;
        setTimeout(get_pgn, 1000);
        console.log(pgn);

        if (pgn !== last_pgn) {
            setTimeout(send_message, 100);
        }
        last_pgn = pgn;
    }
}

browser.runtime.onMessage.addListener(open_new_tab);
browser.tabs.onUpdated.addListener(tab_updated);
