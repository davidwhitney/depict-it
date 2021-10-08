import { DepictItGameState } from "../DepictIt.types";
import { IHandlerContext, IStepHandler } from "../GameStateMachine";

export class PassStacksAroundHandler implements IStepHandler<DepictItGameState> {

    public async execute(state: DepictItGameState, context: IHandlerContext) {
        let holders = state.stacks.map(s => s.heldBy);
        const popped = holders.pop();
        holders = [popped, ...holders];

        for (let stackIndex in state.stacks) {
            state.stacks[stackIndex].heldBy = holders[stackIndex];
        }

        const stacksHeldByOriginalOwners = state.stacks[0].heldBy == state.activePlayers[0].clientId;

        if (stacksHeldByOriginalOwners) {
            return { transitionTo: "GetUserScoresHandler" };
        }

        const nextStackRequirement = state.stacks[0].requires;
        const nextTransition = nextStackRequirement == "image" ? "GetUserDrawingHandler" : "GetUserCaptionHandler";
        return { transitionTo: nextTransition };
    }

}