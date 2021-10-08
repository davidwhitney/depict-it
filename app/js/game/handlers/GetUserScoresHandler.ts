import { DepictItGameState, Stack } from "../DepictIt.types";
import { IHandlerContext, IStepHandler, waitUntil } from "../GameStateMachine";
import { playerIsInActivePlayers } from "./HandlerHelpers";

export class GetUserScoresHandler implements IStepHandler<DepictItGameState> {

    private skip: boolean;
    private submitted: number;

    public async execute(state: DepictItGameState, context: IHandlerContext) {

        for (let stack of state.stacks) {
            this.skip = false;
            this.submitted = 0;

            // this.generateGif(stack);

            context.channel.sendMessage({ kind: "instruction", type: "pick-one-request", stack: stack }, state.activePlayers.map(p => p.clientId));

            try {
                await waitUntil(() => { return this.skip || (this.submitted == state.activePlayers.length); });
            } catch {
                console.log("Not all votes cast, shrug")
            }
        }

        return { transitionTo: "EndHandler" };
    }

    public async handleInput(state: DepictItGameState, context: IHandlerContext, message) {
        if (!playerIsInActivePlayers(state, message.metadata)) {
            return;
        }

        if (message.kind === "skip-scoring-forwards") {
            this.skip = true;
            return;
        }

        if (message.kind != "pick-one-response") {
            return;
        }

        for (let stack of state.stacks) {
            for (let item of stack.items) {
                if (item.id == message.id) {

                    const author = state.activePlayers.filter(p => p.clientId == item.author)[0];

                    if (!author) {
                        continue; // They voted on the original phrase, what?!
                    }

                    if (!author.score) {
                        author.score = 0;
                    }
                    author.score++;
                }
            }
        }

        context.channel.sendMessage({ kind: "instruction", type: "wait" }, message.metadata.clientId);
        this.submitted++;
    }

    public generateGif(stack: Stack) {
        try {
            fetch("/api/createGif", { method: "POST", body: JSON.stringify({ stack }) });
        } catch {
        }
    }
}
