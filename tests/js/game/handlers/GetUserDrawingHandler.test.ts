import { Stack } from "../../../../app/js/game/DepictIt.types";
import { NullMessageChannel } from "../../../../app/js/game/GameStateMachine";
import { GetUserDrawingHandler } from "../../../../app/js/game/handlers/GetUserDrawingHandler";
import { Identity } from "../../../../app/js/Identity";

describe("GetUserDrawingHandler", () => {

    let step, state, identity;
    beforeEach(() => {
        identity = new Identity("Some player");
        state = {
            players: [identity],
            activePlayers: [identity],
            stacks: [new Stack(identity.clientId, "hint1")],
            hints: ["hint1", "hint2"]
        };
        step = new GetUserDrawingHandler(5_000);
    });

    it("execute, sends instruction for each user to draw an image from the hint at the top of their stack", async () => {
        const channel = new NullMessageChannel();
        const context = { channel: channel };

        step.execute(state, context);

        expect(channel.sentMessages.length).toBe(1);
        expect(channel.sentMessages[0].message.kind).toBe("instruction");
        expect(channel.sentMessages[0].message.type).toBe("drawing-request");
        expect(channel.sentMessages[0].message.value).toBe("hint1");
    });

    it("execute, transitions to PassStacksAroundHandler after all users have provided input", async () => {
        const context = { channel: new NullMessageChannel() };
        const step = new GetUserDrawingHandler(200);

        setTimeout(async () => {
            step.handleInput(state, context, { kind: "drawing-response", imageUrl: "http://my/drawing.jpg", metadata: { clientId: identity.clientId } });
        }, 50);

        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("PassStacksAroundHandler");
        expect(result.error).toBe(false);
    });

    it("execute, transitions to PassStacksAroundHandler with error flag if users timeout.", async () => {
        const channel = new NullMessageChannel();
        const context = { channel: channel };
        const step = new GetUserDrawingHandler(50);

        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("PassStacksAroundHandler");
        expect(result.error).toBeDefined();
    });

    it("execute, if user times out, all stacks still have correct number of items in them so things don't crash later.", async () => {
        const channel = new NullMessageChannel();
        const context = { channel: channel };
        const initialStackLength = state.stacks[0].items.length;

        step = new GetUserDrawingHandler(100);
        const result = await step.execute(state, context);

        expect(state.stacks[0].items.length).toBe(initialStackLength + 1);
    });

    it("execute, timeout returned to user has three seconds of leeway in it.", async () => {
        const channel = new NullMessageChannel();
        const context = { channel: channel };

        step = new GetUserDrawingHandler(10_000);
        step.execute(state, context);

        expect(channel.sentMessages[0].message.timeout).toBe(7_000);
    });

    it("execute when three seconds of leeway would be too much, timeout is the same as the handler timeout", async () => {
        const channel = new NullMessageChannel();
        const context = { channel: channel };

        step = new GetUserDrawingHandler(2_000);
        step.execute(state, context);

        expect(channel.sentMessages[0].message.timeout).toBe(2_000);
    });
});