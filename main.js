let intervalActivateAnalysis = null;
let intervalPressButton = null;
let intervalAddMinutes = null;

let pressedButton = false;

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

// This is a function which gets called twice every second and which hides the ratings
// if the user is playing
function hideRatings() {
    let status;

    // Setting up the hiding of the left ratings by moving the ratings into an own container
    // If this container already exists, this routine is not necessary
    if ($(".extension-rating-span").length === 0) {
        let playerInformation = $(".game__meta__players").children();
        let player1 = playerInformation.get(0).firstChild.childNodes;
        player1 = player1[player1.length - 1];
        let player2 = playerInformation.get(1).firstChild.childNodes;
        player2 = player2[player2.length - 1];

        // Collecting the textContents
        let splitted1 = player1.textContent.split("(");
        let splitted2 = player2.textContent.split("(");

        // Deleting the ratings from the text of the player
        player1.textContent = splitted1[0];
        player2.textContent = splitted2[0];

        // Generating new container-nodes for the ratings
        let newNode = $("<span class='extension-rating-span'>" + "(" + splitted1[1] + "</span>");
        newNode.insertAfter(player1);
        let newNode2 = $("<span class='extension-rating-span'>" + "(" + splitted2[1] + "</span>");
        newNode2.insertAfter(player2);
    }
    if ($(".game__meta > .status").length > 0) {
        // A game was played
        status = 1;
    } else if ($(".game__meta").length > 0) {
        // A game is being played
        if ($(".ruser-bottom > .text").get(0).textContent === $("#user_tag").get(0).textContent) {
            // It is played by the user
            status = 0;
        } else {
            // It is played by someone else
            status = 1;
        }
    } else {
        status = 2;
    }
    // Checking if the ratings need to be hidden
    if ((preferences.ratings >= 1 && status === 0) || (preferences.ratings === 2 && status === 1)) {
        $(".round__app").children().find("rating").hide();
        $(".extension-rating-span").hide();
    } else {
        $(".round__app").children().find("rating").show();
        $(".extension-rating-span").show();
    }
}

// Function which gets called several times to add more than 15 seconds to the time of the opponent
function addSeconds(n) {
    let moretime = document.querySelector(".moretime");

    if (moretime !== null && n > 0) {
        moretime.click();

        const randomNumber = Math.floor(Math.random() * 10) + 300;

        if (n - 15 <= 0) {
            pressedButton = false;
            $(".moretime").show();
            return;
        }
        setTimeout(function () {
            addSeconds(n - 15);
        }, randomNumber);
    } else {
        pressedButton = false;
        $(".moretime").show();
    }
}

// Function which gets called when the plus-button is pressed
function clickedAddTime() {
    // If the button was pressed by the extension: return
    if (pressedButton) {
        return;
    }
    let moretime = $(".moretime");
    let minutes = $("#minutes");

    if (moretime.length && minutes.length) {
        // It reads the value and then calls the function which adds more and more time
        let value = document.querySelector("#minutes").value;
        document.querySelector("#minutes").value = "";

        if (value === "" || isNaN(value)) {
            return;
        }
        setTimeout(function () {
            addSeconds(parseInt(value) * 60 - 15);
        }, 300);
        pressedButton = true;
        $(".moretime").hide();
    }
}

// Function which adds and remove the input fiels for extra time
function addMinutes() {
    // Plus-button
    let moretime = $(".moretime");
    // Added input field
    let minutes = $("#minutes");

    if (moretime.length && !minutes.length) {
        let new_node = $('<input spellcheck="false" autocomplete="off" aria-label="Minutes" placeholder="Minuten" id="minutes"' +
            ' style="width: 30%;height: 50%;position: absolute;right: 50px;top: 25%;bottom: 25%;margin: auto;">');

        new_node.insertBefore(moretime);
        moretime.on("click", clickedAddTime);
    } else if (!moretime.length && minutes.length) {
        // Removing after the game is over
        minutes.remove();
        clearInterval(intervalAddMinutes);
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

    // Calling the function which manages the visibility of the ratings
    hideRatings();
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

function setup() {
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
    intervalPressButton = setInterval(pressButton, 1000);
    intervalAddMinutes = setInterval(addMinutes, 250);
    setTimeout(setupClaimWinObserver, 5000);
    setInterval(hideRatings, 500);
}

setup();
