import { DealHandler } from "../../../../app/js/game/handlers/DealHandler";
import { Identity } from "../../../../app/js/Identity";

describe("DealHandler", () => {
    let step, state;
    beforeEach(() => {
        state = {
            players: [new Identity("Some player")],
            stacks: [],
            hints: ["hint1", "hint2"]
        };
        step = new DealHandler();
    });

    it("execute, generates a stack for each player", async () => {
        await step.execute(state);
        expect(state.stacks.length).toBe(1);
    });

    it("execute, triggers 'getUserDrawing' step to start game", async () => {
        const result = await step.execute(state);
        expect(result.transitionTo).toBe("GetUserDrawingHandler");
    });
});
