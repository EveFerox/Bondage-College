"use strict";

class ChatRoomStatusManager {
    IsDebug = true;

    StatusTypes = {
        None: 'None',
        Afk: 'Afk',
        Typing: 'Typing',
        Action: 'Action',
        Whisper: 'Whisper',
    };

    constructor() {
        this.IsStart = false;
        this.IsTyping = false;
        this.InputTimeoutMs = 3 * 1000;
        this.InputTimeoutMs = 1 * 1000;//Test
        this.AfkTimeoutMs = 10 * 1000;

        this.CurrentInterval = null;

        this.Log = function (msg) {
            if (this.IsDebug == false) return;
            console.log(msg);
        }

        this.SendStatusEvent = function (type, data) {
            ServerSend("ChatRoomStatusEvent", { Type: type, Data: data });
        }

        this.setScopedInterval = function (func, millis, scope, oneTime = false) {
            var intr = setInterval(function () {
                if (oneTime) clearInterval(intr);
                func.apply(scope);
            }, millis);
    
            return intr;
        }

        this.InputTimeoutFunc = function () {
            if (this.IsTyping == false) {
                // Already not typing, ignore the timeout
                return;
            }
            this.Log("InputTimeoutFunc");
    
            this.IsTyping = false;
    
            this.SendStatusEvent(this.StatusTypes.None);
        }
    }

    Start() {
        if (this.IsStart) return;
        this.Log("Start");
        this.IsStart = true;
    }

    Stop() {
        if (this.IsStart == false) return;
        this.Log("Stop");
        this.IsStart = false;
    }

    InputChanged() {
        if (this.IsStart == false) return;
        this.Log("ChatRoomOnChatInput");

        if (this.IsTyping == false) {
            this.IsTyping = true;

            this.SendStatusEvent(this.StatusTypes.Typing);
        }

        // Start or restart the timer
        if (this.CurrentInterval != null) {
            clearInterval(this.CurrentInterval);
        }

        this.CurrentInterval = this.setScopedInterval(this.InputTimeoutFunc, this.InputTimeoutMs, this, true);
    }

    InputFocusChanged(isInFocus) {
        if (this.IsStart == false) return;
        this.Log("InputFocusChanged " + isInFocus);

        //TODO impement AFK status
    }
}