import "phoenix_html"
import React from 'react';
import ReactDOM from 'react-dom';
import socket from "./socket"
import Game from "./game";
"use strict";

function ready(state, channel) {
  ReactDOM.render(<Game state={state} channel={channel} />, $('#root')[0]);
};

// From Nat Tuck's Hangman
(function() {
  let chan = socket.channel("player:", {});
  chan.join()
    .receive("ok", state0 => {
      console.log("Joined successfully", state0);
      ready(state0, chan);
    })
    .receive("error", resp => { console.log("Unable to join", resp); });
})();










