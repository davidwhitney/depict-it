import { Stack, StackItem } from "../../../../app/js/game/DepictIt.types";
import { NullMessageChannel } from "../../../../app/js/game/GameStateMachine";
import { GetUserScoresHandler } from "../../../../app/js/game/handlers/GetUserScoresHandler";
import { Identity } from "../../../../app/js/Identity";

describe("GetUserScoresHandler", () => {
    let step, state, p1, p2, channel, context;
    beforeEach(() => {
        p1 = new Identity("Some player");
        channel = new NullMessageChannel();
        state = {
            players: [p1],
            activePlayers: [p1],
            stacks: [
                new Stack(p1.clientId, "hint1"),
            ],
            hints: ["hint1", "hint2"]
        };

        context = {
            channel: channel
        }

        step = new GetUserScoresHandler();
        const item = new StackItem("image", "http://tempuri.org/img.png");
        item.author = p1.clientId;
        item.id = "1234";
        state.stacks[0].items.push(item);
    });

    it("execute, requests players to vote for one card per stack", async () => {
        setTimeout(async () => {
            step.handleInput(state, context, { kind: "pick-one-response", id: "1234", metadata: { clientId: p1.clientId } });

            expect(channel.sentMessages[1].message.kind).toBe("instruction");
            expect(channel.sentMessages[1].message.type).toBe("wait");
        }, 100);

        const result = await step.execute(state, context);

        expect(channel.sentMessages[0].message.kind).toBe("instruction");
        expect(channel.sentMessages[0].message.type).toBe("pick-one-request");

        expect(result.transitionTo).toBe("EndHandler");
        expect(result.error).not.toBeDefined();
    });

    it("execute, can be skipped by host", async () => {
        setTimeout(async () => {
            step.handleInput(state, context, { kind: "skip-scoring-forwards", metadata: { clientId: p1.clientId } });
        }, 100);

        const result = await step.execute(state, context);

        expect(result.transitionTo).toBe("EndHandler");
    });
});
