import { DepictItGameState, Stack, StackItem } from "../DepictIt.types";
import { IHandlerContext, IStepHandler, waitUntil } from "../GameStateMachine";

export class DealHandler implements IStepHandler<DepictItGameState> {

    public async execute(state: DepictItGameState, context: IHandlerContext) {
        state.activePlayers = state.players.slice();

        for (let player of state.activePlayers) {
            const hint = state.hints.pop();
            const stack = new Stack(player.clientId, hint);
            state.stacks.push(stack);
        }

        return { transitionTo: "GetUserDrawingHandler" };
    }

}