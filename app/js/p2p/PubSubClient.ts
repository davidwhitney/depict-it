import * as Ably from "ably";
import { Identity } from "../Identity";

export type GameServerMessage = { kind: string, serverState: any; };
export type GameStateMessage = { kind: string, type: string };
export type ValidGameMessage = GameServerMessage | GameStateMessage;
export type Metadata = { friendlyName: string, clientId: string, uniqueId: string };
export type OnMessageReceivedCallback = (message: any, metadata: Metadata) => void;

export class PubSubClient {

  private connected: boolean;
  private metadata: Metadata;
  private onMessageReceivedCallback: OnMessageReceivedCallback;

  private channel: Ably.Types.RealtimeChannelPromise;

  constructor(onMessageReceivedCallback: OnMessageReceivedCallback) {
    this.connected = false;
    this.onMessageReceivedCallback = onMessageReceivedCallback;
  }

  async connect(identity: Identity, uniqueId: string) {
    if (this.connected) return;

    this.metadata = { uniqueId: uniqueId, ...identity };

    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
    this.channel = await ably.channels.get(`p2p-sample-${uniqueId}`, { params: { rewind: '1m' } });

    await this.channel.subscribe((message) => {
      this.onMessageReceivedCallback(message.data, this.metadata);
    });

    this.connected = true;
  }

  sendMessage<TMessageType extends ValidGameMessage>(message: TMessageType, targetClientId: string | string[] = null) {
    if (!this.connected) {
      throw "Client is not connected";
    }

    const ablyMessage = {
      ...message,
      metadata: this.metadata,
      forClientId: targetClientId ? targetClientId : null
    }

    this.channel.publish({ name: "myMessageName", data: ablyMessage });
  }
}