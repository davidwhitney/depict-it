import { GameStateMachine } from "../../../app/js/game/GameStateMachine";
import { DepictIt, DepictItGameState } from "../../../app/js/game/DepictIt";
import { Identity } from "../../../app/js/Identity";

describe("DepictIt", () => {
    let sut: GameStateMachine<DepictItGameState>;
    beforeEach(() => {
        sut = DepictIt({
            channel: {} as any
        });

        sut.state.players = [];
        sut.state.players.push({ ...new Identity("Player1"), uniqueId: "1" });
        sut.state.players.push({ ...new Identity("Player2"), uniqueId: "2" });
    });

    it("run, sets up the game and prompts users for their first drawing", async () => {
        await sut.run();

        expect(sut.currentStepKey).toBe("GetUserDrawingHandler");
    });
});

