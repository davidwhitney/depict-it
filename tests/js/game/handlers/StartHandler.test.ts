import { StartHandler } from "../../../../app/js/game/handlers/StartHandler";

describe("StartHandler", () => {
    let step, state;
    beforeEach(() => {
        state = {};
        step = new StartHandler();
    });

    it("execute, clears down stacks", async () => {
        step.execute(state);
        expect(state.stacks.length).toBe(0);
    });

    it("execute, populates hints in state", async () => {
        const result = await step.execute(state);
        expect(state.hints.length).not.toBe(0);
    });

    it("execute, triggers 'deal' step", async () => {
        const result = await step.execute(state);
        expect(result.transitionTo).toBe("DealHandler");
    });
});
