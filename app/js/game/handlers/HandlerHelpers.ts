export function playerIsInActivePlayers(state, playerIdentity) {
    return state.activePlayers.filter(ap => ap.clientId == playerIdentity?.clientId).length > 0;
}

export function createId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}