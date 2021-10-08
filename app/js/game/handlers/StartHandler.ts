import { DepictItGameState, Stack, StackItem } from "../DepictIt.types";
import { DepictItCards } from "../DepictIt.cards";
import { IHandlerContext, IStepHandler, waitUntil } from "../GameStateMachine";

export class StartHandler implements IStepHandler<DepictItGameState> {

    public async execute(state: DepictItGameState, context: IHandlerContext) {
        state.stacks = [];
        state.hints = DepictItCards.slice();

        shuffle(state.hints);
        return { transitionTo: "DealHandler" };
    }

}

function shuffle(collection: string[]) {
    for (let i = collection.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [collection[i], collection[j]] = [collection[j], collection[i]];
    }
}