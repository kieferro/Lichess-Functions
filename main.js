let report = true;
let duell = true;
let analyse = true;
let last_status = null;
let ratings = 0;
let tvs_loaded = 0;
// TODO: adding call list to call all methods

browser.runtime.onMessage.addListener(function (request) {
    if (request.code === 0) {
        location.reload();
    } else if (request.code === 1) {
        const name = document.getElementById("user_tag").text;
        const players = document.getElementsByClassName("text ulpt");
        const text = players[players.length - 1].textContent;
        console.log(name);
        console.log(text);
        console.log(name === text);

        if (name === text) {
            browser.runtime.sendMessage({code: 2});
            return;
        }

        get_pgn();
    } else if (request.code === 2) {
        let all = document.getElementsByTagName("move");

        if (all.length > 0) {
            if (all[all.length - 1].classList[0] !== "active") {
                return;
            }
        }
        document.getElementsByClassName("copyable autoselect")[1].value = request.pgn;
        document.getElementsByClassName("button button-thin action text")[0].click();
    } else if (request.code === 3) {
        window.close();
    }
});

function show_all() {
    if (document.getElementsByClassName("status").length > 0) {
        const l = document.getElementsByTagName("rating");

        for (let i = 0; i < l.length; i++) {
            l[i].style.display = "block";
        }
    }
}

function activateAnalysis() {
    setTimeout(activateAnalysis, 500);

    if (!analyse || document.visibilityState === "hidden") {
        return;
    }
    let toggle = document.getElementById("analyse-toggle-ceval");

    if (toggle == null) {
        last_status = null;
        return;
    }
    if (last_status != null) {
        return;
    }
    if (!toggle.checked) {
        toggle.parentNode.childNodes[1].click();
    }
    last_status = toggle.checked;
}

setTimeout(activateAnalysis, 500);

function hide_ratings() {
    setTimeout(hide_ratings, 10);
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
        show_all();
        return;
    }
    if (status_now === 1 && ratings <= 1) {
        show_all();
        return;
    }
    if (status_now === 2 && ratings === 0) {
        show_all();
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

function add_tv() {
    setTimeout(add_tv, 100);
    let name = window.location.href;

    if (name.substr(name.length - 10, 10) !== "/following") {
        return;
    }
    let tracks = document.getElementsByClassName("relation-actions btn-rack");
    console.log(tracks.length);

    for (tvs_loaded; tvs_loaded < tracks.length; tvs_loaded++) {
        if (tracks[tvs_loaded].childNodes.length < 1) {
            continue
        }
        let continue_after = false;

        for (let j = 0; j < tracks[tvs_loaded].childNodes.length; j++) {
            // TODO: this should not be necessary any more
            if (tracks[tvs_loaded].childNodes[j].title === "Partien ansehen") {
                continue_after = true;
            }
        }
        if (continue_after) {
            continue;
        }
        let player = tracks[tvs_loaded].parentNode.parentNode.childNodes[0].textContent;

        let new_node = tracks[tvs_loaded].childNodes[0].cloneNode(true);
        new_node.dataset.icon = "";
        new_node.title = "Partien ansehen";
        new_node.href = "https://lichess.org/@/" + player + "/tv";
        tracks[tvs_loaded].insertBefore(new_node, tracks[tvs_loaded].childNodes[0]);
    }
}

setTimeout(add_tv, 100);

setTimeout(hide_ratings, 10);

function addReport() {
    if (!report) {
        return;
    }
    setTimeout(addReport, 100);
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

setTimeout(addReport, 100);
let last_text = null;

function push_button() {
    if (!duell) {
        return;
    }
    setTimeout(push_button, 100);
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

setTimeout(push_button, 100);

function addFollowing() {
    let buttons = document.getElementsByClassName("site-buttons");

    if (buttons.length === 0) {
        setTimeout(addFollowing, 10);
        return;
    }
    for (let i = 0; i < buttons[0].childNodes.length; i++) {
        if (buttons[0].childNodes[i].title === "Personen, denen du folgst") {
            return;
        }
    }
    let name = document.getElementById("user_tag").textContent;

    let new_node = buttons[0].childNodes[0].childNodes[0].cloneNode();
    new_node.dataset.icon = "⛹";
    new_node.title = "Personen, denen du folgst";
    new_node.href = "https://lichess.org/@/" + name + "/following";

    buttons[0].insertBefore(new_node, document.getElementById("user_tag").parentNode);
}

setTimeout(addFollowing, 10);

function get_pgn() {
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
    browser.runtime.sendMessage({code: 1, pgn: pgn});
}

function error(error) {
    console.log("Error:", error);
}

function gotRatings(item) {
    if (item.ratings !== undefined) {
        ratings = item.ratings;
    }
}

function gotReport(item) {
    if (item.report !== undefined) {
        report = item.report;
    }
}

function gotDuell(item) {
    if (item.duell !== undefined) {
        duell = item.duell;
    }
}

function gotAnalyse(item) {
    if (item.analyse !== undefined) {
        analyse = item.analyse;
    }
}

browser.storage.local.get("ratings").then(gotRatings, error);
browser.storage.local.get("report").then(gotReport, error);
browser.storage.local.get("duell").then(gotDuell, error);
browser.storage.local.get("analyse").then(gotAnalyse, error);


// will be installed in the future
function guess_the_elo() {
    setTimeout(guess_the_elo, 1000);

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