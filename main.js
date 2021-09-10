﻿let ratings = 0;
let tvs_loaded = 0;
let last_text = null;
let currentPgn = "";
let stopAnalysis = false;
let callers = [addFollowing, pushButton, addReport, addTv, hideRatings];

function removeFromCallers(caller) {
    const index = callers.indexOf(caller);

    if (index > -1) {
        callers.splice(index, 1);
    }
}

function getPgn() {
    let move_nodes = document.getElementsByTagName("u8t");
    let pgn = "";

    for (let i = 0; i < move_nodes.length / 2; i++) {
        let first = move_nodes[i * 2].innerHTML;
        // to remove draw offers from the move text
        first = first.split("<")[0];

        pgn += (i + 1).toString() + "." + first;

        if (i * 2 + 1 < move_nodes.length) {
            let second = move_nodes[i * 2 + 1].innerHTML;
            second = second.split("<")[0];
            pgn += " " + second + " ";
        }
    }
    return pgn;
}

function getAnalyzable() {
    if (document.getElementsByTagName("l4x").length === 0) {
        return false;
    }
    const players = document.getElementsByClassName("text ulpt");

    if (players.length < 2) {
        return true;
    }

    const text = players[players.length - 1].textContent;
    const name = document.getElementById("user_tag").text;

    return name !== text;
}

function getTimeSituation(upper) {
    let topClock = document.getElementsByClassName("rclock rclock-top running");

    if (topClock.length === 0) {
        topClock = document.getElementsByClassName("rclock rclock-top");
    }
    topClock = topClock[0].textContent;

    let bottomClock = document.getElementsByClassName("rclock rclock-bottom running");

    if (bottomClock.length === 0) {
        bottomClock = document.getElementsByClassName("rclock rclock-bottom");
    }
    bottomClock = bottomClock[0].textContent;

    if (upper) {
        return topClock;
    }
    return bottomClock;
}

function onKey(event) {
    if (event.key === "p" && event.altKey) {
        stopAnalysis = !stopAnalysis;
    }
}

function onMessage(request, sender, sendResponse) {
    if (request.code === 0) {
        location.reload();
    } else if (request.code === 1) {
        sendResponse({permission: getAnalyzable()});
    } else if (request.code === 2) {
        sendResponse({pgn: getPgn(), timeWhite: getTimeSituation(true), timeBlack: getTimeSituation(false)});
    } else if (request.code === 3) {
        if (stopAnalysis) {
            currentPgn = "";
            return;
        }
        document.title = "Live Analyse";

        console.log(request.timeWhite, request.timeBlack);

        let textField = document.getElementsByClassName("copyable autoselect");
        let button = document.getElementsByClassName("button button-thin action text");

        if (request.pgn !== currentPgn && textField.length > 1 && button.length > 0) {
            textField[1].value = request.pgn;
            button[0].click();
            currentPgn = request.pgn;
        }
        const dropdowns = document.getElementsByClassName("mselect");

        for (let i = 0; i < dropdowns.length; i++) {
            //dropdowns[i].remove();
        }
    }
}

function showAll() {
    if (document.getElementsByClassName("status").length > 0) {
        const l = document.getElementsByTagName("rating");

        for (let i = 0; i < l.length; i++) {
            l[i].style.display = "block";
        }
    }
}

function activateAnalysis() {
    if (document.visibilityState === "hidden") {
        return;
    }
    let toggle = document.getElementById("analyse-toggle-ceval");

    if (toggle == null) {
        return;
    }
    if (!toggle.checked) {
        toggle.parentNode.childNodes[1].click();
    }
    removeFromCallers(activateAnalysis);
}

function hideRatings() {
    let status_now = 0;

    if (document.getElementsByClassName("game__meta__infos").length > 0) {
        if (document.getElementsByClassName("timeago set").length + document.getElementsByClassName("set").length > 0) {
            status_now = 1;
        } else {
            status_now = 2;

            const name = document.getElementById("user_tag").text;
            const players = document.getElementsByClassName("text ulpt");
            const self_node = players[players.length - 1];
            const text = self_node.textContent;

            if (text !== name) {
                status_now = 0;
            }

        }
    }
    if (status_now === 0) {
        showAll();
        return;
    }
    if (status_now === 1 && ratings <= 1) {
        showAll();
        return;
    }
    if (status_now === 2 && ratings === 0) {
        showAll();
        return;
    }

    const l = document.getElementsByTagName("rating");

    for (let i = 0; i < l.length; i++) {
        l[i].style.display = "none";
    }
    for (let i = 0; i < 2; i++) {
        let text_element = document.getElementsByClassName("user-link")[i].innerHTML;

        if (text_element.includes("hidden") || !text_element.includes("(")) {
            continue;
        }

        text_element = text_element.split("(");
        text_element = text_element[0] + "<span style=\"visibility:hidden\">(" + text_element[1] + "</span>";
        document.getElementsByClassName("user-link")[i].innerHTML = text_element;
    }
}

function addTv() {
    let name = window.location.href;

    if (name.substr(name.length - 10, 10) !== "/following") {
        return;
    }
    let tracks = document.getElementsByClassName("relation-actions btn-rack");

    for (tvs_loaded; tvs_loaded < tracks.length; tvs_loaded++) {
        if (tracks[tvs_loaded].childNodes.length < 1) {
            continue
        }
        let player = tracks[tvs_loaded].parentNode.parentNode.childNodes[0].textContent;

        let new_node = tracks[tvs_loaded].childNodes[0].cloneNode(true);
        new_node.dataset.icon = "";
        new_node.title = "Partien ansehen";
        new_node.href = "https://lichess.org/@/" + player + "/tv";
        tracks[tvs_loaded].insertBefore(new_node, tracks[tvs_loaded].childNodes[0]);
    }
}

function addReport() {
    let actions = document.getElementsByClassName("upt__actions btn-rack");

    if (actions.length === 0) {
        return;
    }
    actions = actions[0];

    for (let i = 0; i < actions.childNodes.length; i++) {
        if (actions.childNodes[i].title === "Benutzer melden") {
            return;
        }
    }
    let new_action = actions.childNodes[0].cloneNode(true);
    new_action.dataset.icon = "";
    new_action.title = "Benutzer melden";

    let link = actions.childNodes[0].href;
    link = link.split("/");
    let username = link[link.length - 2];
    new_action.href = "https://lichess.org/report?username=" + username;

    actions.appendChild(new_action);
}

function pushButton() {
    const text = document.getElementsByClassName("racer__pre__message__pov");
    const parent = document.getElementsByClassName("puz-side");
    const referenceNode = document.getElementsByClassName("puz-side__table");

    if (text.length === 0) {
        if (last_text !== null && parent.length > 0) {
            parent[0].appendChild(last_text);
            parent[0].insertBefore(last_text, referenceNode[0]);
            last_text = null;
        }
    } else {
        last_text = text[0];
    }
    let clock = document.getElementsByClassName("puz-clock__time");
    const button = document.getElementsByClassName("racer__skip button button-red");

    if (clock.length === 0 || button.length === 0) {
        return;
    }
    let time = clock[0].textContent.split(":");

    if (parseInt(time[0]) * 60 + parseInt(time[1]) <= 10) {
        button[0].click();
    }
}

function addFollowing() {
    let buttons = document.getElementsByClassName("site-buttons");

    if (buttons.length === 0) {
        return;
    }
    let name = document.getElementById("user_tag").textContent;

    let new_node = buttons[0].childNodes[0].childNodes[0].cloneNode();
    new_node.dataset.icon = "⛹";
    new_node.title = "Personen, denen du folgst";
    new_node.href = "https://lichess.org/@/" + name + "/following";

    buttons[0].insertBefore(new_node, document.getElementById("user_tag").parentNode);

    removeFromCallers(addFollowing);
}

function call() {
    setTimeout(call, 10);
    for (let i = 0; i < callers.length; i++) {
        callers[i]();
    }
}

setTimeout(call, 10);

function error(error) {
    console.log("Error:", error);
}

function gotRatings(item) {
    if (item.ratings !== undefined) {
        ratings = item.ratings;
    }
}

function gotReport(item) {
    if (item.report !== undefined && !item.report) {
        removeFromCallers(addReport);
    }
}

function gotDuell(item) {
    if (item.duell !== undefined && !item.duell) {
        removeFromCallers(pushButton);
    }
}

function gotAnalyse(item) {
    if (item.analyse !== undefined) {
        if (item.analyse) {
            callers.push(activateAnalysis);
        } else {
            removeFromCallers(activateAnalysis);
        }
    }
}

browser.storage.local.get("ratings").then(gotRatings, error);
browser.storage.local.get("report").then(gotReport, error);
browser.storage.local.get("duell").then(gotDuell, error);
browser.storage.local.get("analyse").then(gotAnalyse, error);
browser.runtime.onMessage.addListener(onMessage);
document.addEventListener("keyup", onKey);


// will be installed in the future
function guessTheElo() {
    setTimeout(guessTheElo, 1000);

    let button = document.getElementsByClassName("button button-metal config_ai");

    if (button.length === 0 || document.getElementsByClassName("button button-metal config_gte").length > 0) {
        return;
    }
    let button_new = button[0].cloneNode(true);
    button_new.textContent = "Guess the elo";
    button_new.className = "button button-metal config_gte";
    button_new.removeAttribute("href");
    button[0].parentNode.appendChild(button_new);
}