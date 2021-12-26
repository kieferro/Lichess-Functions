const button_text = ["Deaktiviert", "Beim Spielen", "Immer"];
const button_color = [["#c25367", "#c4374f"], ["#b9872d", "#c98b1b"], ["#53c257", "#41a345"]];
let preferences = {"toggles": [true, true, true, true], "ratings": 0, "signature": true};

function open_analysis() {
    // PGN found:
    if (false) {
        $("#error-text").hide();
        $("#warning-sign").hide();

        browser.runtime.sendMessage({code: 0});
    } else {
        $("#error-text").show();
        $("#warning-sign").show();
    }
}

function gotError(_) {
    $("body").html("<text style='color: red'>Fehler:</text><text>Aufgetreten beim Laden der Einstellungen</text>");
}

function gotPreferences(item) {
    if (item.preferences !== undefined) {
        item = item.preferences;

        if (item.signature) {
            preferences = item;
        }
    }
    applyPreferences();
}

function savePreferences() {
    let toggles = [];
    $(".checkbox").each(function (index, checkbox) {
        toggles.push(checkbox.checked);
    });

    preferences.toggles = toggles;
    browser.storage.local.set({preferences});
}

function applyPreferences() {
    $(".checkbox").each(function (index, checkbox) {
        checkbox.checked = preferences["toggles"][index];
    });

    $("#ratings")
        .html(button_text[preferences.ratings])
        .css("background-color", button_color[preferences.ratings][0])
        .hover(
            function () {
                $("#ratings").css("background-color", button_color[preferences.ratings][1]);
            },
            function () {
                $("#ratings").css("background-color", button_color[preferences.ratings][0]);
            });
}

function rating_button_clicked() {
    preferences.ratings = (preferences.ratings + 1) % 3;
    savePreferences();
    applyPreferences();
}

function setup() {
    browser.storage.local.get("preferences").then(gotPreferences, gotError);

    $(".slider").on("click", function () {
        setTimeout(savePreferences, 100)
    });

    $("#open-analysis").on("click", open_analysis);
    $("#ratings").on("click", rating_button_clicked);
    $("#error-text").hide();
    $("#warning-sign").hide();
}

document.addEventListener("DOMContentLoaded", setup, false);
