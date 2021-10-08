import { Metadata } from "../p2p/PubSubClient";
import { BaseGameState } from "./GameStateMachine";

export type StackItemType = "string" | "image";

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
        this.items = [
            StackItem.createSystemGeneratedItem("string", openingHint)
        ];
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

    public static createSystemGeneratedItem(type: StackItemType, value: string) {
        let item = new StackItem(type, value);
        item.systemGenerated = true;
        item.author = "SYSTEM";
        return item;
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}