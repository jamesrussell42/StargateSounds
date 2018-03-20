'use strict';

var Alexa = require('alexa-sdk');
//var audioData = require('./audioAssets');
var constants = require('./constants');

var stateHandlers = {
    'LaunchRequest': function () {
        var audioData = require('./audioAssets');
        var speechOutput = this.t('WELCOME_MSG');
        var repromptSpeech = this.t('WELCOME_MSG');
        var cardTitle   = audioData.subtitle;
        var cardContent = audioData.cardContent;
        var cardImage   = audioData.image;
        this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, cardImage);
    },
    'DialTheGate': function () {
            controller.play.call(this, this.t('./dialTheGate'));
    },
    'IncomingWormhole': function () {
            controller.play.call(this, this.t('./incomingWormhole'));
    },
    'CloseTheIris': function () {
            controller.play.call(this, this.t('./closeIris'));
    },
    'OpenTheIris': function () {
            controller.play.call(this, this.t('./openIris'));
    },
    'AutoDestruct': function () {
            controller.play.call(this, this.t('./AutoDestruct'));
    },
    'BaseAlarm': function () {
            controller.play.call(this, this.t('./BaseAlarm'));
    },
    'MakeItSpin': function () {
            controller.play.call(this, this.t('./MakeItSpin'));
    },
    'CloseGate': function () {
            controller.fullStop.call(this, this.t('STOP_MSG'));
    },
    'AMAZON.HelpIntent': function () {
        var audioData = require('./audioAssets');
        var speechOutput = this.t('HELP_MSG');
        var repromptSpeech = this.t('HELP_MSG');
        var cardTitle   = audioData.subtitle;
        var cardContent = audioData.cardContent;
        var cardImage   = audioData.image;
        this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, cardImage);
    },
    'SessionEndedRequest': function () {
        // No session ended logic
    },
    'ExceptionEncountered': function () {
        console.log("\n******************* EXCEPTION **********************");
        console.log("\n" + JSON.stringify(this.event.request, null, 2));
        this.callback(null, null)
    },
    'Unhandled': function () {
        this.response.speak(this.t('UNHANDLED_MSG'));
        this.emit(':responseReady');
    },
    'AMAZON.NextIntent': function () {
        this.response.speak(this.t('CAN_NOT_SKIP_MSG'));
        this.emit(':responseReady');
    },
    'AMAZON.PreviousIntent': function () { 
        this.response.speak(this.t('CAN_NOT_SKIP_MSG'));
        this.emit(':responseReady');
    },

    'AMAZON.PauseIntent':   function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.CancelIntent':  function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.StopIntent':    function () { controller.stop.call(this, this.t('STOP_MSG')); },

    'AMAZON.ResumeIntent':  function () { controller.resume.call(this, this.t('STOP_MSG')); },

    'AMAZON.LoopOnIntent':     function () { this.emit('AMAZON.StartOverIntent'); },
    'AMAZON.LoopOffIntent':    function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOnIntent':  function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOffIntent': function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.StartOverIntent':  function () { 
        this.response.speak(this.t('NOT_POSSIBLE_MSG'));
        this.emit(':responseReady');
    },

    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued':  function () { controller.resume.call(this, this.t('STOP_MSG')); },
    'PauseCommandIssued': function () { controller.stop.call(this, this.t('STOP_MSG')); }
}

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            var audioData = require(text);
            var randy = audioData[Math.floor(Math.random() * audioData.length)];
            
            if (canThrowCard.call(this)) {
                var cardTitle   = randy.subtitle;
                var cardContent = randy.cardContent;
                var cardImage   = randy.image;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }
            //SESSION SAVE
            this.attributes['cardTitle'] = cardTitle;
            this.attributes['cardContent'] = cardContent;
            this.attributes['cardImage'] = cardImage;
            this.attributes['url'] = randy.url;
            
            //END SESSION
            this.response.speak('').audioPlayerPlay('REPLACE_ALL', randy.url, randy.url, null, 0);
            this.emit(':responseReady');
        },
        resume: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            
            var resumeURL = this.attributes['url'];
            
            if (canThrowCard.call(this)) {
                var cardTitle   = this.attributes['cardTitle'];
                var cardContent = this.attributes['cardContent'];
                var cardImage   = this.attributes['cardImage'];
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }
            
            
            //END SESSION
            this.response.speak('').audioPlayerPlay('REPLACE_ALL', resumeURL, resumeURL, null, 0);
            this.emit(':responseReady');
        },
        fullStop: function (text) {
            controller.play.call(this, this.t('./CloseGate'))
        },
        stop: function (text) {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.speak('').audioPlayerStop();
            this.emit(':responseReady');
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest') {
        return true;
    } else {
        return false;
    }
}