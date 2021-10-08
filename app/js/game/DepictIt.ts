import { GameStateMachine, IHandlerContext } from "./GameStateMachine";
import * as Handlers from "./DepictIt.handlers";
import { DepictItGameState } from "./DepictIt.types";

export const DepictIt = (handlerContext: IHandlerContext) => new GameStateMachine<DepictItGameState>({
  steps: {
    "StartHandler": new Handlers.StartHandler(),
    "DealHandler": new Handlers.DealHandler(),
    "GetUserDrawingHandler": new Handlers.GetUserDrawingHandler(183_000),
    "GetUserCaptionHandler": new Handlers.GetUserCaptionHandler(63_000),
    "PassStacksAroundHandler": new Handlers.PassStacksAroundHandler(),
    "GetUserScoresHandler": new Handlers.GetUserScoresHandler(),
    "EndHandler": new Handlers.EndHandler()
  },
  context: handlerContext
});

export class DepictItClient {
  private gameId: any;
  private channel: any;

  constructor(gameId: string, channel: any) {
    this.gameId = gameId;
    this.channel = channel;
  }

  public async sendImage(base64EncodedImage) {
    const result = await fetch("/api/storeImage", {
      method: "POST",
      body: JSON.stringify({ gameId: this.gameId, imageData: base64EncodedImage })
    });

    const savedUrl = await result.json();
    this.channel.sendMessage({ kind: "drawing-response", imageUrl: savedUrl.url });
  }

  public async sendCaption(caption) {
    this.channel.sendMessage({ kind: "caption-response", caption: caption });
  }

  public async logVote(id) {
    this.channel.sendMessage({ kind: "pick-one-response", id: id });
  }

  public async hostProgressedVote() {
    this.channel.sendMessage({ kind: "skip-scoring-forwards" })
  }
}