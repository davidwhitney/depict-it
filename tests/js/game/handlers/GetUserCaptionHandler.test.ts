import { Stack, StackItem } from "../../../../app/js/game/DepictIt.types";
import { NullMessageChannel } from "../../../../app/js/game/GameStateMachine";
import { GetUserCaptionHandler } from "../../../../app/js/game/handlers/GetUserCaptionHandler";
import { Identity } from "../../../../app/js/Identity";

describe("GetUserCaptionHandler", () => {
    let step: GetUserCaptionHandler;
    let state, identity, channel, context;
    beforeEach(() => {
        identity = new Identity("Some player");
        channel = new NullMessageChannel();
        state = {
            players: [identity],
            activePlayers: [identity],
            stacks: [new Stack(identity.clientId, "hint1")],
            hints: ["hint1", "hint2"]
        };
        context = {
            channel: channel
        };
        step = new GetUserCaptionHandler(5_000);

        state.stacks[0].add(new StackItem("image", "http://tempuri.org/img.png"));
    });

    it("execute, sends instruction for each user to enter caption for the image at the top of their stack", async () => {
        step.execute(state, context);

        expect(channel.sentMessages.length).toBe(1);
        expect(channel.sentMessages[0].message.kind).toBe("instruction");
        expect(channel.sentMessages[0].message.type).toBe("caption-request");
        expect(channel.sentMessages[0].message.value).toBe("http://tempuri.org/img.png");
    });

    it("execute, transitions to PassStacksAroundHandler after all users have provided input", async () => {
        setTimeout(async () => {
            step.handleInput(state, context, { kind: "caption-response", caption: "blah blah blah", metadata: { clientId: identity.clientId } });
        }, 100);

        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("PassStacksAroundHandler");
        expect(result.error).toBe(false);
    });

    it("execute, transitions to passStacksAround with error flag if users timeout.", async () => {
        step = new GetUserCaptionHandler(100);
        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("PassStacksAroundHandler");
        expect(result.error).toBeDefined();
    });

    it("execute, if user times out, all stacks still have correct number of items in them so things don't crash later.", async () => {
        const initialStackLength = state.stacks[0].items.length;
        step = new GetUserCaptionHandler(100);

        await step.execute(state, context);

        const firstStack = state.stacks[0];
        expect(firstStack.items.length).toBe(initialStackLength + 1);
        expect(firstStack.items[firstStack.items.length - 1].value).toBe("hint1");
        expect(firstStack.items[firstStack.items.length - 1].systemGenerated).toBe(true);
    });

    it("execute, timeout returned to user has three seconds of leeway in it.", async () => {
        step = new GetUserCaptionHandler(10_000);
        step.execute(state, context);

        expect(channel.sentMessages[0].message.timeout).toBe(7_000);
    });

    it("execute when three seconds of leeway would be too much, timeout is the same as the handler timeout", async () => {
        step = new GetUserCaptionHandler(2_000);
        step.execute(state, context);

        expect(channel.sentMessages[0].message.timeout).toBe(2_000);
    });
});
