let intervalActivateAnalysis = null;
let intervalPressButton = null;

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

// Function which gets called every 100ms which tries to turn on the analysis
function activateAnalysis() {
    if (!preferences.toggles[1]) {
        clearInterval(intervalActivateAnalysis);
        return;
    }
    // This waits until the analysis is opened in the current tab
    if (document.visibilityState === "visible") {
        let slider = document.querySelector("#analyse-toggle-ceval");

        // Trying to click the lisder if it is not activated
        if (slider !== null) {
            if (!slider.checked) {
                slider.click();
            }
            clearInterval(intervalActivateAnalysis);
        }
    }
}

// Function to extract the PGN from a displayed game
function getPGN() {
    let PGN = "";
    $("l4x").children().each(function (_, item) {
        if (item.tagName !== "DIV") {
            PGN += item.textContent + " ";
        }
    });
}

// Function which gets called when a button to claim the win is displayed
function claimWin() {
    if (!preferences.toggles[3]) {
        return;
    }
    let informationText = document.querySelector(".suggestion");

    if (informationText === null) {
        return;
    }
    // The left button is the one to claim a win and it gets selected by the querySelector
    let button = informationText.querySelector("button");

    if (button !== null) {
        button.click();
    }
}

// Function which gets called 5s after the tab got loaded. This is the setup
// for the MutationObserver which checks whether it's possible to claim a win.
function setupClaimWinObserver() {
    if (document.querySelector(".rcontrols") === null) {
        return;
    }
    const observer = new MutationObserver(claimWin);
    observer.observe(document.querySelector(".rcontrols"), mutationConfig);
}

// This function gets called every second to press the skip-button on puzzle racer
function pressButton() {
    if (!preferences.toggles[2]) {
        return;
    }
    const timer = $(".puz-clock__time").get(0);
    // Reading the text from the time display
    let time_left = timer.textContent.split(":");
    time_left = parseInt(time_left[0]) * 60 + parseInt(time_left[1]);

    if (time_left <= 10) {
        $(".racer__skip").click();
        clearInterval(intervalPressButton);
    }
}

// Function to set the preferences to a passed parameter
function setPreferences(pref) {
    if (pref.signature) {
        preferences = pref;
    }
    // Deleting the potential old Interval and then creating a new
    // interval to activate the analysis
    clearInterval(intervalActivateAnalysis);
    intervalActivateAnalysis = setInterval(activateAnalysis, 100);
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

    intervalActivateAnalysis = setInterval(activateAnalysis, 1000);
    setTimeout(setupClaimWinObserver, 5000);
    intervalPressButton = setInterval(pressButton, 1000);
}

setupNew();

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
        // clearInterval();
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