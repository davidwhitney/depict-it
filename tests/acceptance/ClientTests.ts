import { DepictItAppPageObject } from "./DepictItAppPageObject";
import { test, expect } from '@playwright/test';

let host: DepictItAppPageObject;
let cleanup: DepictItAppPageObject[];
let joinUrl: any;

test.beforeEach(async () => {
    host = await DepictItAppPageObject.create();
    joinUrl = await host.hostASession();
    cleanup = [host];
});

test.afterEach(async () => {
    cleanup.forEach(item => item.close());
});

test.describe("Behaviour of the app as a game client", () => {

    test("Players can join a game", async () => {
        const player2 = await newPageObject();
        await player2.joinASession(joinUrl);

        const player3 = await newPageObject();
        await player3.joinASession(joinUrl);

        const player4 = await newPageObject();
        await player4.joinASession(joinUrl);

        await sleep(2000);

        const connectedPlayers = await host.connectedPlayers();

        await expect(connectedPlayers).toContain(host.playerName);
        await expect(connectedPlayers).toContain(player2.playerName);
        await expect(connectedPlayers).toContain(player3.playerName);
        await expect(connectedPlayers).toContain(player4.playerName);
    });

    test("Players follow a join link, there is no host button available to them.", async () => {
        const player2 = await newPageObject();
        await player2.followJoinLink(joinUrl);

        const pageBodyAsSeenByPlayerTwo = await player2.pageBody();
        await expect(pageBodyAsSeenByPlayerTwo).not.toContain("Create Game");
    });

    test("Players follow a join link, they are told they are waiting on the host.", async () => {
        const player2 = await newPageObject();
        await player2.joinASession(joinUrl);

        const waitMessage = await player2.youAreWaitingMessage();

        await expect(waitMessage).toContain("Waiting for ");
        await expect(waitMessage).toContain(" to start the game.");
    });

    test("Game is started - drawable canvas visible.", async () => {
        const player2 = await newPageObject();
        await player2.joinASession(joinUrl);

        await host.clickStartGame();
        await host.drawableCanvasIsVisible();
    });

    test("Player can draw on a canvas, and will be prompted to wait for other players", async () => {
        const player2 = await newPageObject();
        await player2.joinASession(joinUrl);

        await host.clickStartGame();
        await host.drawableCanvasIsVisible();

        await player2.drawOnCanvas();
        await sleep(2000);

        const pageBodyAsSeenByPlayerTwo = await player2.pageBody();
        await expect(pageBodyAsSeenByPlayerTwo).toContain("Waiting for other players to finish.")
    });

    test("Players can play multiple rounds of a game on the same gameId", async () => {
        const player2 = await newPageObject();
        await player2.joinASession(joinUrl);
        await sleep(2000);

        await host.clickStartGame();

        // Drawing
        await host.drawOnCanvas();
        await player2.drawOnCanvas();

        // Caption
        await host.captionImageReceivedFromServer("Some caption!");
        await player2.captionImageReceivedFromServer("Some other caption!");

        // Scores for each player
        await host.voteForFirstStackItem();
        await player2.voteForFirstStackItem();

        await host.voteForFirstStackItem();
        await player2.voteForFirstStackItem();

        // Scoreboard displayed
        await host.waitForScores();

        // Host can start next round
        await host.clickNextRound();

        // Is back in the drawing phase  
        await host.waitForDrawingCanvasToAppear();
        await player2.waitForDrawingCanvasToAppear();

        // Total victory! A full game cycle!
    });

    async function newPageObject() {
        const instance = await DepictItAppPageObject.create();
        cleanup.push(instance);
        return instance;
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}