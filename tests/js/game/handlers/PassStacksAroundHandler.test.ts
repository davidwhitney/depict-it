import { Stack, StackItem } from "../../../../app/js/game/DepictIt.types";
import { NullMessageChannel } from "../../../../app/js/game/GameStateMachine";
import { PassStacksAroundHandler } from "../../../../app/js/game/handlers/PassStacksAroundHandler";
import { Identity } from "../../../../app/js/Identity";

describe("PassStacksAroundHandler", () => {
    let step, state, p1, p2, channel, context;
    beforeEach(() => {
        p1 = new Identity("Some player");
        p2 = new Identity("Some player");
        channel = new NullMessageChannel();
        state = {
            players: [p1, p2],
            activePlayers: [p1, p2],
            stacks: [
                new Stack(p1.clientId, "hint1"),
                new Stack(p2.clientId, "hint2"),
            ],
            hints: ["hint1", "hint2"]
        };

        context = {
            channel: channel
        };

        step = new PassStacksAroundHandler();
        state.stacks[0].add(new StackItem("image", "http://tempuri.org/img.png"));
        state.stacks[1].add(new StackItem("image", "http://tempuri.org/img.png"));
    });

    it("execute, assigns players each others stacks", async () => {
        step.execute(state, context);

        expect(state.stacks[0].heldBy).toBe(p2.clientId);
        expect(state.stacks[1].heldBy).toBe(p1.clientId);
    });

    it("execute, when original owners have their stacks again, redirects to getUserScores", async () => {
        await step.execute(state, context);
        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("GetUserScoresHandler");
    });

    it("execute, routes to getUserCaption when last card was an image", async () => {
        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("GetUserCaptionHandler");
    });

    it("execute, routes to getUserDrawing when last card was a caption", async () => {
        state.stacks[0].add(new StackItem("string", "blah blah"));
        state.stacks[1].add(new StackItem("string", "bleh bleh"));

        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("GetUserDrawingHandler");
    });
});
