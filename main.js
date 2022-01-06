﻿let ratings = 0;
let tvs_loaded = 0;
let last_text = null;
let lastPgn = "";
let stopAnalysis = false;
let currentNumberOfNodes = -1;
let status = null;
let stopSendingPgn = false;
let callers = [pushButton, hideRatings];

let interval_caller = null;
let interval_minutes = null;
let pressed_button = false;
let preferences = {"toggles": [true, true, true, true, true], "ratings": 0, "signature": true};


const config = {attributes: true, childList: true, subtree: true};
const modes = ["", "", "", "", ""];

function claimWin() {
    let suggestion = document.querySelector(".suggestion");

    if (suggestion === null) {
        return;
    }
    let button = suggestion.querySelector("button");

    if (button !== null) {
        button.click();
    }
}

function setupMutationObserver() {
    let controls = document.querySelector(".rcontrols");

    if (controls === null) {
        return;
    }

    const observer = new MutationObserver(claimWin);
    observer.observe(controls, config);
}

function activateAnalysis() {
    if (document.visibilityState === "visible") {
        let slider = document.querySelector("#analyse-toggle-ceval");

        if (slider !== null) {
            if (!slider.checked) {
                slider.click();
                clearInterval(interval_caller);
            }
        }
    }
}

function hover_mutation(_, __) {
    if (document.querySelector("#reportButton") !== null) {
        return;
    }
    let new_node = $('<a data-icon="" class="btn-rack__btn" id="reportButton" title="Benutzer melden"></a>');
    let link_elements = document.querySelector(".upt__actions.btn-rack").childNodes[0].href.split("/");
    new_node.attr("href", "https://lichess.org/report?username=" + link_elements.at(-2));
    $(".upt__actions.btn-rack").append(new_node);
    $("#reportButton").css("padding-left", 0);

    if (!preferences.toggles[4]) {
        return;
    }

    let info = document.querySelector(".upt__info__ratings");

    for (let i = 0; i < modes.length; i++) {
        for (let j = 0; j < info.childNodes.length; j++) {
            if (info.childNodes[j].dataset.icon === modes[i]) {
                $(info.childNodes[j]).insertBefore($(info.childNodes[0]));
            }
        }
    }
}

function addTv(node, _) {
    if (node.className !== "paginated") {
        return;
    }
    let link = node.childNodes[0].childNodes[0].href;
    let name = link.split("/").at(-1);

    let childs = node.childNodes;
    let bar = childs[childs.length - 1].childNodes[0];

    let new_node = $('<a title="Partien ansehen"  class="btn-rack__btn" data-icon=""></a>');
    new_node.attr("href", "https://lichess.org/@/" + name + "/tv");

    new_node.insertBefore(bar.childNodes[0]);
}

function followingLoaderMutation(mutation_list, _) {
    for (let i = 0; i < mutation_list.length; i++) {
        mutation_list[i].addedNodes.forEach(addTv);
    }
}

function addFollowing() {
    let user_tag = document.querySelector("#user_tag");

    if (user_tag === null) {
        return;
    }
    let new_node = $('<a class="link"><span data-icon=""></span></a>');
    let new_node2 = $('<a class="link"><span data-icon=""></span></a>');
    new_node.attr("href", "https://lichess.org/@/" + user_tag.textContent + "/following");
    new_node2.attr("href", "https://lichess.org/@/" + user_tag.textContent);

    new_node.insertBefore($(".dasher"));
    new_node2.insertBefore($(".dasher"));
}

function addSeconds(n) {
    let moretime = document.querySelector(".moretime");

    console.log(n);

    if (moretime !== null && n > 0) {
        moretime.click();

        let randomNumber = Math.floor(Math.random() * 10) + 300;

        if (n - 15 <= 0) {
            pressed_button = false;
            $(".moretime").show();
            return;
        }
        setTimeout(function () {
            addSeconds(n - 15);
        }, randomNumber);
    } else {
        pressed_button = false;
        $(".moretime").show();
    }
}

function clickedAddTime() {
    if (pressed_button) {
        return;
    }

    let moretime = $(".moretime");
    let minutes = $("#minutes");

    if (moretime.length && minutes.length) {
        let value = document.querySelector("#minutes").value;
        document.querySelector("#minutes").value = "";

        if (value === "" || isNaN(value)) {
            console.log("Returned");
            return;
        }
        setTimeout(function () {
            addSeconds(parseInt(value) * 60 - 15);
        }, 300);
        pressed_button = true;
        $(".moretime").hide();
    }
}

function addMinutes() {
    let moretime = $(".moretime");
    let minutes = $("#minutes");

    if (moretime.length && !minutes.length) {
        let new_node = $('<input spellcheck="false" autocomplete="off" aria-label="Minutes" placeholder="Minuten" id="minutes"' +
            ' style="width: 30%;height: 50%;position: absolute;right: 50px;top: 25%;bottom: 25%;margin: auto;">');

        new_node.insertBefore(moretime);
        moretime.on("click", clickedAddTime);
    } else if (!moretime.length && minutes.length) {
        minutes.remove();
        clearInterval(interval_minutes);
    }
}

function hideRatings() {
    let user = document.querySelector(".ruser-bottom");

    if (user === null) {
        $("rating").show();
        $(".game__meta__players").$(".user-link").$("span").css("visibility", "visible");
        return;
    }
    user = user.querySelector(".text");

    let status = document.getElementsByClassName("status");

    for (let i = 0; i < status.length; i++) {
        if (status[i].parentElement.className === "game__meta") {
            $("rating").show();
            $(".game__meta__players").$(".user-link").$("span").css("visibility", "visible");
            return;
        }
    }

    if (document.querySelector("#user_tag").textContent === user.textContent) {
        $("rating").hide();

        let game_meta = document.querySelector(".game__meta__players").childNodes;

        for (let i = 0; i < game_meta.length; i++) {
            let element = game_meta[i].childNodes[0];

            if (element.querySelector("span") !== null) {
                continue;
            }

            let HTML = element.innerHTML;
            let index = HTML.indexOf("(");

            element.innerHTML = HTML.substring(0, index) + '<span style="visibility:hidden">' + HTML.substring(index, HTML.length) + '</span>';
        }
    } else {
        $("rating").show();

        $(".game__meta__players").$(".user-link").$("span").css("visibility", "visible");
    }
}

function gotMessage(request, sender, sendResponse) {
    if (request.code === 0) {
        preferences = request.content;
    }
}

function gotPreferences(item) {
    if (item.preferences !== undefined) {
        preferences = item.preferences;
    }
}


function setup() {
    // The powerTip-object is an object, which is always in the DOM. Its childs only appear when you hover over
    // a users name. At the beginning it doesn't exist, so this function creates one so that it can be used
    // for the MutationObserver, which will then add the Report-Buttons.
    if (document.querySelector("#powerTip") === null) {
        $("body").append("<div id=\"powerTip\"></div>");
    }

    const observer = new MutationObserver(hover_mutation);
    const observer2 = new MutationObserver(followingLoaderMutation);
    observer.observe(document.querySelector("#powerTip"), config);

    let infiniteScroll = document.querySelector(".infinite-scroll");

    if (infiniteScroll !== null) {
        observer2.observe(infiniteScroll, config);
    }

    addFollowing();

    let paginated_elements = document.getElementsByClassName("paginated");

    for (let i = 0; i < paginated_elements.length; i++) {
        addTv(paginated_elements[i], null);
    }

    interval_caller = setInterval(activateAnalysis, 50);

    setTimeout(setupMutationObserver, 5000);

    interval_minutes = setInterval(addMinutes, 100);


    browser.storage.local.get("preferences").then(gotPreferences, function () {
        console.log("error");
    });
    setInterval(hideRatings, 250);

    browser.runtime.onMessage.addListener(gotMessage);
}

setup();

function getPgn() {
    let moveNodes = document.getElementsByTagName("u8t");
    let pgn = "";

    for (let i = 0; i < moveNodes.length / 2; i++) {
        let first = moveNodes[i * 2].innerHTML;
        // to remove draw offers from the move text
        first = first.split("<")[0];

        pgn += (i + 1).toString() + "." + first;

        if (i * 2 + 1 < moveNodes.length) {
            let second = moveNodes[i * 2 + 1].innerHTML;
            second = second.split("<")[0];
            pgn += " " + second + " ";
        }
    }
    return pgn;
}

function addClocks(data) {
    const topStrip = document.getElementsByClassName("analyse__player_strip top");
    const bottomStrip = document.getElementsByClassName("analyse__player_strip bottom");

    if (document.getElementsByClassName("analyse__clock top active").length +
        document.getElementsByClassName("analyse__clock top").length === 0) {
        if (topStrip.length > 0) {
            let node = document.createElement("div");
            node.innerHTML = '<div class=\"analyse__clock top\">01:00<div></div></div>';
            topStrip[0].appendChild(node);
        }
    } else {
        let clock = document.getElementsByClassName("analyse__clock top active");
        if (clock.length === 0) {
            clock = document.getElementsByClassName("analyse__clock top");
        }
        clock[0].textContent = data.time.timeTop;

        if (data.time.topActive) {
            clock[0].className = "analyse__clock top active";
        } else {
            clock[0].className = "analyse__clock top";
        }
    }

    if (document.getElementsByClassName("analyse__clock bottom active").length +
        document.getElementsByClassName("analyse__clock bottom").length === 0) {
        if (bottomStrip.length > 0) {
            let node = document.createElement("div");
            node.innerHTML = '<div class=\"analyse__clock bottom\">01:00<div></div></div>';
            bottomStrip[0].appendChild(node);
        }
    } else {
        let clock = document.getElementsByClassName("analyse__clock bottom active");
        if (clock.length === 0) {
            clock = document.getElementsByClassName("analyse__clock bottom");
        }
        clock[0].textContent = data.time.timeBottom;

        if (data.time.bottomActive) {
            clock[0].className = "analyse__clock bottom active";
        } else {
            clock[0].className = "analyse__clock bottom";
        }
    }
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

function getTimeSituation() {
    let topClockRunning = document.getElementsByClassName("rclock rclock-top running");
    let topClock = document.getElementsByClassName("rclock rclock-top");
    let bottomClockRunning = document.getElementsByClassName("rclock rclock-bottom running");
    let bottomClock = document.getElementsByClassName("rclock rclock-bottom");
    let response = {};

    if (topClockRunning.length > 0) {
        response.topActive = true;
        response.timeTop = topClockRunning[0].childNodes[1].textContent;
    } else {
        response.topActive = false;
        response.timeTop = topClock[0].childNodes[1].textContent;
    }
    if (bottomClockRunning.length > 0) {
        response.bottomActive = true;
        response.timeBottom = bottomClockRunning[0].childNodes[1].textContent;
    } else {
        response.bottomActive = false;
        response.timeBottom = bottomClock[0].childNodes[1].textContent;
    }
    return response;
}

function togglePause() {
    stopAnalysis = !stopAnalysis;

    if (stopAnalysis) {
        status.style = "color:white; background-color:orange; width:100%; border-radius: 5px";
        status.textContent = "Paused";
        status.dataset.icon = "";
    } else {
        status.style = "color:white; background-color:green; width:100%; border-radius: 5px";
        status.textContent = "Running";
        status.dataset.icon = "";
    }
}

function onKey(event) {
    if (event.key === "p" && event.altKey) {
        togglePause();
    }
}

function sendPgn() {
    if (stopSendingPgn) {
        stopSendingPgn = true;
        return;
    }

    setTimeout(sendPgn, 200);

    const numberNodes = document.getElementsByTagName("u8t").length;

    if (numberNodes === currentNumberOfNodes) {
        return;
    }
    currentNumberOfNodes = numberNodes;
    const pgn = getPgn();

    if (pgn !== lastPgn) {
        lastPgn = pgn;
        browser.runtime.sendMessage({code: 1, pgn: pgn});
    }
}

function onMessage(request, sender, sendResponse) {
    if (request.code === 1) {
        sendResponse({permission: getAnalyzable()});
    } else if (request.code === 2) {
        lastPgn = "";
        currentNumberOfNodes = -1;
        sendPgn();
    } else if (request.code === 3) {
        let data = request.data;
        document.title = "Live Analyse";

        let textField = document.getElementsByClassName("copyable autoselect");
        let button = document.getElementsByClassName("button button-thin action text");

        if (textField.length > 1 && button.length > 0) {
            textField[1].value = data.pgn;
            button[0].click();
        }
    } else if (request.code === 4) {
        stopSendingPgn = true;
    }
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

