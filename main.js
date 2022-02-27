let interval_caller = null;
let interval_minutes = null;
let pressed_button = false;

let preferences = {"toggles": [false, false, false, false], "ratings": 1, "signature": true};
// Default config for MutationObserver
const mutationConfig = {attributes: true, childList: true, subtree: true};

// Function to add the buttons on the upper right
function addMenuButtons() {
    if (document.querySelector(".site-buttons") === null) {
        return;
    }
    // Getting the parent element of the buttons
    const siteButtons = document.querySelector(".site-buttons");
    const dasher = siteButtons.lastChild;
    const userName = dasher.firstChild.textContent;

    // Creating the two nodes which will be added to the panel
    let nodeFollowing = $('<a class="link"><span data-icon=""></span></a>');
    let nodeProfile = $('<a class="link"><span data-icon=""></span></a>');
    nodeFollowing.attr("href", "https://lichess.org/@/" + userName + "/following");
    nodeProfile.attr("href", "https://lichess.org/@/" + userName);

    // Adding the nodes to the panel
    nodeFollowing.insertBefore(dasher);
    nodeProfile.insertBefore(dasher);
}

// Function which gets called when hovering over a profile name so that the report-buttton gets added
function hoverOverProfile(_, __) {
    // Checking if the button has already been added
    if (document.querySelector("#reportButton") !== null) {
        return;
    }
    let reportButton = $('<a data-icon="" class="btn-rack__btn" id="reportButton" title="Benutzer melden" style="padding-left: 0"></a>');
    // Fetching username from the card
    let username = document.querySelector(".upt__info__top").firstChild.firstChild.textContent;
    reportButton.attr("href", "https://lichess.org/report?username=" + username);
    $(".upt__actions.btn-rack").append(reportButton);
}

// This function gets called to add a TV-button to the passed node
function addTv(node, _) {
    if (node.className !== "paginated") {
        return;
    }
    // Getting username from the left part of the node
    let username = node.firstChild.firstChild.href.split("/").at(-1);

    let new_node = $('<a title="Partien ansehen"  class="btn-rack__btn" data-icon=""></a>');
    new_node.attr("href", "https://lichess.org/@/" + username + "/tv");

    new_node.insertBefore(node.lastChild.firstChild.firstChild);
}

// Gets called when the list of people on the following-list gets longer
function followingLoaderMutation(mutation_list, _) {
    for (let i = 0; i < mutation_list.length; i++) {
        mutation_list[i].addedNodes.forEach(addTv);
    }
}

// Function to set the preferences to a passed parameter
function setPreferences(pref) {
    if (pref.signature) {
        preferences = pref;
    }
    // TODO: Apply preferences
}

// Function which gets called when the preferences were read from local storage
function gotPreferences(item) {
    if (item.preferences !== undefined) {
        setPreferences(item.preferences);
    }
}

// Function which gets called from the popup and from the background-script
function gotMessage(request, sender, sendResponse) {
    // The different types of messages are indicated by the codes
    if (request.code === 0) {
        setPreferences(request.content);
    }
}

function gotError(_) {
    console.log("Es ist beim Laden der Einstellungen ein Fehler aufgetreten.");
}

function setupNew() {
    // The powerTip-object is an object, which is always in the DOM. Its childs only appear when you hover over
    // a users name. At the beginning it doesn't exist, so this function creates one so that it can be used
    // for the MutationObserver, which will then add the Report-Buttons.
    if (document.querySelector("#powerTip") === null) {
        $("body").append("<div id=\"powerTip\"></div>");
    }
    // Adding an MutationObserver for the object which will be created when hovering over the name
    // of another player. In that case a report-button is added in the hoverOverProfile-function
    const profileCardObserver = new MutationObserver(hoverOverProfile);
    profileCardObserver.observe(document.querySelector("#powerTip"), mutationConfig);

    // Initialising the Observer for the list of people the user follows to add TVs
    const followingListObserver = new MutationObserver(followingLoaderMutation);

    if (document.querySelector(".infinite-scroll") !== null) {
        followingListObserver.observe(document.querySelector(".infinite-scroll"), mutationConfig);
    }
    // Adding TVs for all already existing entries in the following-list
    $(".paginated").each(function (index) {
        addTv($(this).get(0), index);
    });

    // Fetching the preferences from the local storage
    browser.storage.local.get("preferences").then(gotPreferences, gotError);
    // Sending all messages from background/popup-script to gotMessage()
    browser.runtime.onMessage.addListener(gotMessage);

    addMenuButtons();
}

setupNew();

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
    observer.observe(controls, mutationConfig);
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


function setup() {
    // The powerTip-object is an object, which is always in the DOM. Its childs only appear when you hover over
    // a users name. At the beginning it doesn't exist, so this function creates one so that it can be used
    // for the MutationObserver, which will then add the Report-Buttons.
    // if (document.querySelector("#powerTip") === null) {
    //     $("body").append("<div id=\"powerTip\"></div>");
    // }
    // const observer = new MutationObserver(hover_mutation);
    // const observer2 = new MutationObserver(followingLoaderMutation);
    // observer.observe(document.querySelector("#powerTip"), mutationConfig);

    // let infiniteScroll = document.querySelector(".infinite-scroll");

    // if (infiniteScroll !== null) {
    //     observer2.observe(infiniteScroll, mutationConfig);
    // }
    // addFollowing();

    // let paginated_elements = document.getElementsByClassName("paginated");

    // for (let i = 0; i < paginated_elements.length; i++) {
    //     addTv(paginated_elements[i], null);
    // }
    interval_caller = setInterval(activateAnalysis, 50);

    setTimeout(setupMutationObserver, 5000);

    interval_minutes = setInterval(addMinutes, 100);

    // browser.storage.local.get("preferences").then(gotPreferences, function () {
    //     console.log("error");
    // });
    setInterval(hideRatings, 250);
    setInterval(pressButton, 500);
    setInterval(getPGN, 2000);

    // browser.runtime.onMessage.addListener(gotMessage);
}

// setup();