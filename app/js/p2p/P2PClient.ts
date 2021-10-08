import { DepictItClient } from "../game/DepictIt";

export class P2PClient {

  private identity: any;
  private uniqueId: string;
  private ably: any;
  private state: any;

  public serverState: any; // Bound to Vue components in UI
  public depictIt: DepictItClient; // Bound to Vue components in UI

  constructor(identity, uniqueId, ably) {
    this.identity = identity;
    this.uniqueId = uniqueId;
    this.ably = ably;

    this.depictIt = null;
    this.serverState = null;

    this.state = {
      status: "disconnected",
      instructionHistory: [],
      lastInstruction: null
    };
  }

  async connect() {
    await this.ably.connect(this.identity, this.uniqueId);
    this.ably.sendMessage({ kind: "connected" });
    this.state.status = "awaiting-acknowledgement";
    this.depictIt = new DepictItClient(this.uniqueId, this.ably);
  }

  onReceiveMessage(message) {
    if (message.serverState) {
      this.serverState = message.serverState;
    }

    switch (message.kind) {
      case "connection-acknowledged":
        this.state.status = "acknowledged";
        break;
      case "instruction":
        this.state.instructionHistory.push(message);
        this.state.lastInstruction = message;
        break;
      default: { };
    }
  }
}