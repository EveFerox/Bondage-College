
var AfkTimerTimeoutTimeMs = 1000 * 60 * 5; //5 minutes
var AfkTimerIsEnabled = null;

var AfkTimerEventsList = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
var AfkTimerTimeoutID;

function AfkTimerReset() {
    clearTimeout(AfkTimerTimeoutID);
    AfkTimerTimeoutID = setTimeout(AfkTimerSetIsAfk, AfkTimerTimeoutTimeMs);
}

function AfkTimerStart() {
    AfkTimerEventsList.forEach(e => document.addEventListener(e, AfkTimerReset, true));
}

function AfkTimerStop() {
    AfkTimerEventsList.forEach(e => document.removeEventListener(e, AfkTimerReset, true));
}

function AfkTimerSetEnabled(Enabled) {
    if (typeof Enabled !== 'boolean') return;
    if (AfkTimerIsEnabled == Enabled) return;
    AfkTimerIsEnabled = Enabled;

    if (AfkTimerIsEnabled)
        AfkTimerStart();
    else
        AfkTimerStop();
}

function AfkTimerSetIsAfk() {
    if (CurrentScreen != "ChatRoom") return;
    CharacterSetFacialExpression(Player, "Emoticon", "Afk");
}