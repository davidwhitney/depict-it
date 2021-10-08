import { DepictItGameState } from "../DepictIt.types";
import { IHandlerContext, IStepHandler } from "../GameStateMachine";

export class EndHandler implements IStepHandler<DepictItGameState> {

    public async execute(state: DepictItGameState, context: IHandlerContext) {
        context.channel.sendMessage({ kind: "instruction", type: "show-scores", playerScores: state.activePlayers });
        return { complete: true };
    }

}