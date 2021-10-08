import { DepictItGameState } from "../DepictIt";
import { StackItem } from "../DepictIt.types";
import { IHandlerContext, IStepHandler, waitUntil } from "../GameStateMachine";
import { createId, playerIsInActivePlayers } from "./HandlerHelpers";

export class GetUserDrawingHandler implements IStepHandler<DepictItGameState> {

    private waitForUsersFor: number;
    private userTimeoutPromptAt: number;
    private submitted: number;
    private initialStackLength: number;

    constructor(waitForUsersFor: number) {
        this.waitForUsersFor = waitForUsersFor;
        this.userTimeoutPromptAt = waitForUsersFor - 3_000;
        this.userTimeoutPromptAt = this.userTimeoutPromptAt < 0 ? this.waitForUsersFor : this.userTimeoutPromptAt;
    }

    public async execute(state: DepictItGameState, context: IHandlerContext) {
        this.submitted = 0;
        this.initialStackLength = state.stacks[0].items.length;

        for (let player of state.activePlayers) {
            const stack = state.stacks.filter(s => s.heldBy == player.clientId)[0];
            const lastItem = stack.items[stack.items.length - 1];

            context.channel.sendMessage({ kind: "instruction", type: "drawing-request", value: lastItem.value, timeout: this.userTimeoutPromptAt }, player.clientId);
        }

        const result = { transitionTo: "PassStacksAroundHandler", error: false };

        try {
            await waitUntil(() => this.submitted == state.activePlayers.length, this.waitForUsersFor);
        }
        catch (exception) {
            result.error = true;

            const stacksThatHaventBeenAddedTo = state.stacks.filter(s => s.items.length === this.initialStackLength);

            for (let stack of stacksThatHaventBeenAddedTo) {
                const stackItem = new StackItem("image", "/assets/no-submit.png");
                stack.add({ ...stackItem, author: "SYSTEM", id: createId(), systemGenerated: true });
            }
        }

        return result;
    }

    public async handleInput(state: DepictItGameState, context: IHandlerContext, message) {
        if (!playerIsInActivePlayers(state, message.metadata)) {
            return;
        }

        if (message.kind == "drawing-response") {
            const stackItem = new StackItem("image", message.imageUrl);
            const stack = state.stacks.filter(s => s.heldBy == message.metadata.clientId)[0];

            stack.add({
                id: createId(),
                ...stackItem,
                author: message.metadata.clientId,
                authorName: message.metadata.friendlyName
            });
            context.channel.sendMessage({ kind: "instruction", type: "wait" }, message.metadata.clientId);

            this.submitted++;
        }
    }
}
