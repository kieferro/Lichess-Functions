let interval_caller = null;
let interval_minutes = null;
let pressed_button = false;
// the default value for the automatic activation of the analysis must be false, because then
// the process waits until the preferences are loaded and doesn't turn on the analysis before
let preferences = {"toggles": [true, false, true, true, true], "ratings": 0, "signature": true};


const config = {attributes: true, childList: true, subtree: true};
const modes = ["", "", "", "", ""];

function claimWin() {
    if (!preferences.toggles[3]) {
        return;
    }
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
    if (!preferences.toggles[1]) {
        return;
    }
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
    console.log(preferences.ratings);

    if (preferences.ratings === 0) {
        return;
    }

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
    if (document.querySelector("#user_tag").textContent === user.textContent || preferences.ratings === 2) {
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

let lastMessage = "";

function pressButton() {
    let message = document.querySelector(".racer__pre__message__pov");

    if (message !== null) {
        lastMessage = message.textContent;
    }
    if ($(".puz-clock__time").length && !$(".racer__pre__message__pov").length) {
        let new_node = $('<p class="racer__pre__message__pov" style="margin: 3em 0 0 0;">' + lastMessage + '</p>');
        new_node.insertAfter($(".puz-clock"));
    }
    if (!preferences.toggles[2]) {
        return;
    }
    let timer = $(".puz-clock__time");
    let time_left = timer.text().split(":");
    time_left = parseInt(time_left[0]) * 60 + parseInt(time_left[1]);

    if (timer.length && time_left <= 10) {
        document.querySelector(".racer__skip").click();
    }
}

function getPGN() {
    let PGN = "";
    $("l4x").children().each(function (_, item) {
        if (item.tagName !== "DIV") {
            PGN += item.textContent + " ";
        }
    });
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
    setInterval(pressButton, 500);
    setInterval(getPGN, 2000);

    browser.runtime.onMessage.addListener(gotMessage);
}

setup();
