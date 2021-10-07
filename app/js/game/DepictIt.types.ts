import { Metadata } from "../p2p/PubSubClient";
import { BaseGameState } from "./GameStateMachine";

export type StackItemType = "string" | "image";

export interface DepictItGameState extends BaseGameState {
    stacks: Stack[];
    hints: string[];
    players: Metadata[];
    activePlayers: any[];
}

export class Stack {
    public id: string;
    public ownedBy: string;
    public heldBy: string;
    public items: StackItem[];
    public requires: StackItemType;

    constructor(ownerId: string, openingHint: string) {
        this.id = uuidv4();
        this.ownedBy = ownerId;
        this.heldBy = ownerId;
        this.items = [new StackItem("string", openingHint)];
        this.items[0].systemGenerated = true;
        this.items[0].author = "SYSTEM";
        this.requires = "image";
    }

    public add(item: StackItem) {
        this.items.push(item);
        this.requires = item.type == "image" ? "string" : "image";
    }
}

export class StackItem {
    public id?: string;
    public type: StackItemType;
    public value: string;
    public systemGenerated: boolean;
    public author: string | "SYSTEM";
    public authorName: string;

    constructor(type: StackItemType, value: string) {
        this.type = type;   // "string" | "image"
        this.value = value; // "full text | url
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}