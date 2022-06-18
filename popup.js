const button_text = ["Deaktiviert", "Beim Spielen", "Immer"];
const button_color = [["#c25367", "#c4374f"], ["#b9872d", "#b07a17"], ["#439845", "#357c37"]];
let preferences = {"toggles": [true, true, true, true, true, true, true], "ratings": 1, "signature": true};

// This function gets called when the user clicks the button to open the analysis
function open_analysis() {
    // TODO: Request PGN from content script
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

// This function gets called when the loading of the preferences reports an error
function gotError(_) {
    $("body").html("<text style='color: red'>Fehler:</text><text>Aufgetreten beim Laden der Einstellungen</text>");
}

// This function gets called when the preferences were loaded and sends them as item
function gotPreferences(item) {
    // If nothing was found in the local storage, this expression will be true
    if (item.preferences !== undefined) {
        item = item.preferences;

        // The signature shows that this entry in the local storage was
        // really made by this extension and not by other code
        if (item.signature) {
            preferences = item;
        }
    } else {
        // The first time the popup gets oppened, the preferences will still be saved as they are shown
        savePreferences();
    }
    applyPreferences();
}

function savePreferences() {
    // Reading information from every slider
    let toggles = [];
    $(".checkbox").each(function (index, checkbox) {
        toggles.push(checkbox.checked);
    });

    preferences.toggles = toggles;
    // Saving the preferences
    browser.storage.local.set({preferences});

    // Sending the new preferences to the content script
    browser.tabs.query({currentWindow: true, active: true},
        function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {code: 0, content: preferences});
        });
}

// Setting all buttons and sliders to the respective preferences
function applyPreferences() {
    $(".checkbox").each(function (index, checkbox) {
        checkbox.checked = preferences["toggles"][index];
    });

    // Setting the color and the text of the ratings-button
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

// Setting the ratins-button to the next option and applying the color
function rating_button_clicked() {
    preferences.ratings = (preferences.ratings + 1) % 3;
    applyPreferences();
}

// Called when the popup opens
function setup() {
    // Fetching preferences
    browser.storage.local.get("preferences").then(gotPreferences, gotError);

    $(".slider").on("click", function () {
        setTimeout(savePreferences, 100);
    });
    $("#ratings").on("click", function () {
        rating_button_clicked();
        savePreferences();
    });
    $("#open-analysis").on("click", open_analysis);

    $("#error-text").hide();
    $("#warning-sign").hide();
}

// Adding EventListener for opening of the popup
document.addEventListener("DOMContentLoaded", setup, false);
