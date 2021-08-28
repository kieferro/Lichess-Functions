let report = true;
let duell = true;
let analyse = true;
let ratings = 0;

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

        if (name === text){
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
    } else if (request.code === 3){
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

let last_status = null;

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

setTimeout(hide_ratings, 10);

let last_link = "none";

function addReport() {
    if (!report) {
        return;
    }
    setTimeout(addReport, 100);
    const actions = document.getElementsByClassName("upt__actions btn-rack");

    if (actions.length > 0) {
        const action = actions[0];
        let found = false;

        for (let i = 0; i < action.childNodes.length; i++) {
            if (action.childNodes[i].href === last_link) {
                found = true;
                break;
            }
        }
        if (!found) {
            let new_action = action.childNodes[0].cloneNode(true);
            new_action.dataset.icon = "";
            new_action.title = "Benutzer melden";
            let link = action.childNodes[0].href;
            link = link.substr(0, link.length - 3);
            link = link.split("/");
            link = link[link.length - 1];
            new_action.href = "https://lichess.org/report?username=" + link;
            last_link = "https://lichess.org/report?username=" + link
            action.appendChild(new_action);
        }
    }
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
        }
    } else {
        last_text = text[0];
    }

    const time = document.getElementsByClassName("puz-clock__time");
    const button = document.getElementsByClassName("racer__skip button button-red");

    if (time.length === 0 || button.length === 0) {
        return;
    }
    let splitted = time[0].textContent.split(":");

    if (parseInt(splitted[0]) === 0 && parseInt(splitted[1]) <= 10) {
        button[0].click();
    }
}

setTimeout(push_button, 100);

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

// setTimeout(guess_the_elo, 1000);

function addFollowing() {
    let buttons = document.getElementsByClassName("site-buttons");

    if (buttons.length === 0) {
        setTimeout(addFollowing, 10);
        return;
    }
    if (buttons[0].childNodes.length > 5) {
        return;
    }
    let name = document.getElementsByClassName("dasher")[0].childNodes[0].textContent;
    console.log(name);

    let button = buttons[0].childNodes[0].childNodes[0];
    let new_node = button.cloneNode();
    new_node.dataset.icon = "⛹";
    new_node.href = "https://lichess.org/@/" + name + "/following";
    buttons[0].insertBefore(new_node, document.getElementsByClassName("dasher")[0]);

}

setTimeout(addFollowing, 10);

function get_pgn() {
    let l = document.getElementsByTagName("u8t");
    let output = "";

    for (let i = 0; i < l.length / 2; i++) {
        let first = l[i * 2].innerHTML;
        first = first.split("<");
        first = first[0];

        output += (i + 1).toString() + "." + first;

        if (i * 2 + 1 < l.length) {
            let second = l[i * 2 + 1].innerHTML;
            second = second.split("<");
            second = second[0];
            output += " " + second + " ";
        }
    }
    console.log("PGN:", output);
    browser.runtime.sendMessage({code: 1, pgn: output});
}

function error(error) {
    console.log("Es ist ein Fehler aufgetreten.");
    console.log(error);
}

function gotRatings(item) {
    if (item.ratings === undefined) {
        return;
    }
    ratings = item.ratings;
}

function gotReport(item) {
    if (item.report === undefined) {
        return;
    }
    report = item.report;
}

function gotDuell(item) {
    if (item.duell === undefined) {
        return;
    }
    duell = item.duell;
}

function gotAnalyse(item) {
    if (item.analyse === undefined) {
        return;
    }
    analyse = item.analyse;
}

browser.storage.local.get("ratings").then(gotRatings, error);
browser.storage.local.get("report").then(gotReport, error);
browser.storage.local.get("duell").then(gotDuell, error);
browser.storage.local.get("analyse").then(gotAnalyse, error);
