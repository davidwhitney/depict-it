import { DepictItAppPageObject } from "./DepictItAppPageObject";
import { test, expect } from '@playwright/test';

let host: DepictItAppPageObject;
let cleanup: any[];

test.beforeEach(async () => {
    host = await DepictItAppPageObject.create();
    cleanup = [host];
});

test.afterEach(async () => {
    cleanup.forEach(item => item.close());
});

test.describe("Behaviour of the app as a game host", () => {

    test("Can start a lobby for a game", async () => {
        const joinUrl = await host.hostASession();

        expect(joinUrl).not.toBeNull();
    });

});