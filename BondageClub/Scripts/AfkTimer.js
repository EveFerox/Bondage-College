
var AfkTimerTimeoutTimeMs = 1000 * 60 * 5; //5 minutes

var AfkTimerIsActive = false;

var AfkTimerTimeoutID;

function AfkTimerInit() {

    function resetTimer() {
        clearTimeout(AfkTimerTimeoutID);
        AfkTimerTimeoutID = setTimeout(AfkTimerSetIsAfk, AfkTimerTimeoutTimeMs);
    }

    var events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(function (name) {
        document.addEventListener(name, resetTimer, true);
    });
}

function AfkTimerSetIsAfk() {
    var emoticon = InventoryGet(Player, "Emoticon");
    if (emoticon == null || emoticon.Property.Expression == null) {
        // Set AFK emoticon only if no other emoticon used
        CharacterSetFacialExpression(Player, "Emoticon", "Afk");
    }
}