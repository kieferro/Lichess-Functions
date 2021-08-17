let report = true;
let duell = true;
let analyse = true;
let ratings = 0;

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

    if (!analyse){
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


function start() {
    setTimeout(start, 10);
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

setTimeout(start, 10);

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

function error(error) {
    console.log("Es ist ein Fehler aufgetreten.");
    console.log(error);
}

function gotRatings(item) {
    if (item.ratings === undefined) {
        return;
    }
    ratings = item.ratings;
    console.log("Ratings: ", ratings);
}

function gotReport(item) {
    if (item.report === undefined) {
        return;
    }
    report = item.report;
    console.log("Report: ", report);
}

function gotDuell(item) {
    if (item.duell === undefined) {
        return;
    }
    duell = item.duell;
    console.log("Duell: ", duell);
}

function gotAnalyse(item) {
    if (item.analyse === undefined) {
        return;
    }
    analyse = item.analyse;
    console.log("Analyse: ", analyse);
}


browser.storage.local.get("ratings").then(gotRatings, error);
browser.storage.local.get("report").then(gotReport, error);
browser.storage.local.get("duell").then(gotDuell, error);
browser.storage.local.get("analyse").then(gotAnalyse, error);

// TODO: Analyse anschalten