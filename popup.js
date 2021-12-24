const messages = ["Deaktiviert", "Beim Spielen", "Immer"];
let ratings = 0;

function open_analysis() {
    console.log("Opening analysis");
    window.close();

    // browser.runtime.sendMessage({code: 0});
}

let preferences = {"toggles": [true, true, true, true], "ratings": 0};

function readPreferences() {
    let toggles = [];
    let slider = document.getElementsByClassName("checkbox");

    for (let i = 0; i < slider.length; i++) {
        toggles.push(slider[i].checked);
    }
    console.log("Set", toggles);
}

function gotPreferences(item) {
    if (item.signature) {
        preferences = item;
    }
}

function gotError(_) {
    jQuery("body").css({"background-color": "red"});
}

function setup() {
    browser.storage.local.get("pref").then(gotPreferences, gotError);
    jQuery(".slider").on("click", function () {
        setTimeout(readPreferences, 100)
    });
}

document.addEventListener("DOMContentLoaded", setup, false);


//let pref = {"a": 1, "b": 3};
//browser.storage.local.set({pref});
