import { Stack } from "../../../../app/js/game/DepictIt.types";
import { NullMessageChannel } from "../../../../app/js/game/GameStateMachine";
import { EndHandler } from "../../../../app/js/game/handlers/EndHandler";
import { Identity } from "../../../../app/js/Identity";

describe("EndHandler", () => {
    let step, state, p1, p2, channel, context;
    beforeEach(() => {
        p1 = new Identity("Some player");
        channel = new NullMessageChannel();
        state = {
            players: [p1],
            activePlayers: [p1],
            stacks: [new Stack(p1.clientId, "hint1")],
            hints: ["hint1"],
        };

        context = {
            channel: channel
        }

        step = new EndHandler();
    });

    it("execute, completes the state machine", async () => {
        const result = await step.execute(state, context);

        expect(result.complete).toBe(true);
    });

    it("execute, sends a message to the clients to show the scoreboard", async () => {
        const result = await step.execute(state, context);

        expect(channel.sentMessages.length).toBe(1);
        expect(channel.sentMessages[0].message.kind).toBe("instruction");
        expect(channel.sentMessages[0].message.type).toBe("show-scores");
        expect(channel.sentMessages[0].message.playerScores).toBeDefined();
    });
});