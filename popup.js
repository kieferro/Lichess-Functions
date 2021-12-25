const messages = ["Deaktiviert", "Beim Spielen", "Immer"];
let preferences = {"toggles": [true, true, true, true], "ratings": 0, "signature": true};

function readPreferences() {
    let toggles = [];
    let slider = document.getElementsByClassName("checkbox");

    for (let i = 0; i < slider.length; i++) {
        toggles.push(slider[i].checked);
    }
    preferences.toggles = toggles;
    browser.storage.local.set({preferences});
}

function applyPreferences() {
    let slider = document.getElementsByClassName("checkbox");

    for (let i = 0; i < slider.length; i++) {
        slider[i].checked = preferences["toggles"][i];
    }
}

function gotPreferences(item) {
    item = item.preferences;

    if (item.signature) {
        preferences = item;
    }
    applyPreferences();
}

function gotError(_) {
    jQuery("body").css({"background-color": "red"});
}

function open_analysis() {
    console.log("Opening analysis");
    // browser.runtime.sendMessage({code: 0});
}

function setup() {
    browser.storage.local.get("preferences").then(gotPreferences, gotError);

    jQuery(".slider").on("click", function () {
        setTimeout(readPreferences, 100)
    });

    jQuery("#open-analysis").on("click", open_analysis);
}

document.addEventListener("DOMContentLoaded", setup, false);
