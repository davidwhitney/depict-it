declare const Vue;
declare const rg4js;

import { DrawableCanvas } from "./components/base-components/DrawableCanvas";
import { CopyableTextBox } from "./components/base-components/CopyableTextBox";

import { InviteLink } from "./components/InviteLink";
import { Loader } from "./components/Loader";
import { StackItem } from "./components/StackItem";
import { TimerBar } from "./components/TimerBar";

import { ReadyOrWaitingPrompt } from "./components/ReadyOrWaitingPrompt";
import { ConnectedPlayersSummary, SinglePlayerSummary } from "./components/ConnectedPlayersSummary";
import { CreateGameForm } from "./components/CreateGameForm";

import { PlayfieldWaitForOthers } from "./components/PlayfieldWaitForOthers";
import { PlayfieldShowScores } from "./components/PlayfieldShowScores";
import { PlayfieldCaption } from "./components/PlayfieldCaption";
import { PlayfieldPickOne } from "./components/PlayfieldPickOne";
import { PlayfieldDrawing } from "./components/PlayfieldDrawing";

Vue.config.errorHandler = function (err, vm, info) {
    console.error("Error", err, vm, info);

    try {
        rg4js('send', { error: err, customData: [{ info: info }] });
    }
    catch { }
};

Vue.component('DrawableCanvas', DrawableCanvas);
Vue.component('StackItem', StackItem);
Vue.component('TimerBar', TimerBar);
Vue.component('CopyableTextBox', CopyableTextBox);
Vue.component('InviteLink', InviteLink);
Vue.component('Loader', Loader);
Vue.component('ReadyOrWaitingPrompt', ReadyOrWaitingPrompt);
Vue.component('ConnectedPlayersSummary', ConnectedPlayersSummary);
Vue.component('SinglePlayerSummary', SinglePlayerSummary);
Vue.component('CreateGameForm', CreateGameForm);

Vue.component('PlayfieldWaitForOthers', PlayfieldWaitForOthers);
Vue.component('PlayfieldShowScores', PlayfieldShowScores);
Vue.component('PlayfieldCaption', PlayfieldCaption);
Vue.component('PlayfieldPickOne', PlayfieldPickOne);
Vue.component('PlayfieldDrawing', PlayfieldDrawing);