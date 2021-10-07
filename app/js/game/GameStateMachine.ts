export type GameCompleteState = { complete: boolean; }
export type StateTransitionResult = { transitionTo: string; error?: boolean; }
export type ValidStateTransitions = StateTransitionResult | GameCompleteState;
export type IHandlerContext = { channel: { sendMessage(message: any, targetClientId?: string | string[]): void; } };
export type IGameDefinition = { steps: any; context: IHandlerContext; };
export type BaseGameState = { msInCurrentStep: number; }

export interface IStepHandler<TStateType extends BaseGameState> {
    execute(state: TStateType, context: IHandlerContext): Promise<ValidStateTransitions>;
    handleInput?(state: TStateType, context: IHandlerContext, message: any): Promise<void>;
};

export class GameStateMachine<TStateType extends BaseGameState> {

    public steps: any;
    public context: any;
    public state: TStateType;

    public currentStepKey: string;
    public msTracker: any;

    constructor(gameDefinition: IGameDefinition) {
        this.steps = gameDefinition.steps;
        this.context = gameDefinition.context || {};

        if (!this.context.channel) {
            this.context.channel = new NullMessageChannel();
        }

        this.state = { msInCurrentStep: 0 } as any;

        this.resetCurrentStepKeepingState();
    }

    resetCurrentStepKeepingState() {
        this.currentStepKey = "StartHandler";
        this.msTracker = null;
    }

    currentStep() { return this.steps[this.currentStepKey]; }

    async run() {
        console.log("Invoking run()", this.currentStepKey);

        this.trackMilliseconds();

        const currentStep = this.currentStep();
        const response = await currentStep.execute(this.state, this.context);

        if (this.currentStepKey == "EndHandler" && (response == null || response.complete)) {
            return; // State machine exit signal
        }

        if (response == null) {
            throw "You must return a response from your execute functions so we know where to redirect to.";
        }

        this.currentStepKey = response.transitionTo;
        this.run();
    }

    async handleInput(input) {
        const currentStep = this.currentStep();
        if (currentStep.handleInput) {
            currentStep.handleInput(this.state, this.context, input);
        } else {
            console.log("Input received while no handler was available.");
        }
    }

    trackMilliseconds() {
        clearTimeout(this.msTracker);
        this.state.msInCurrentStep = 0;

        const interval = 5;
        this.msTracker = setInterval(() => {
            this.state.msInCurrentStep += interval;
        }, interval);
    }
}

export class NullMessageChannel {

    private sentMessages: any[];

    constructor() {
        this.sentMessages = []
    }

    sendMessage(message, targetClientId) {
        this.sentMessages.push({ message, targetClientId });
    }
}

const threeMins = 3 * 60 * 1000;

export function waitUntil(condition, timeout = threeMins) {
    return new Promise<void>((res, rej) => {

        if (condition()) {
            res();
            return;
        }

        let elapsed = 0;
        const pollFrequency = 10;
        let poll = setInterval(() => {

            if (condition()) {
                clearInterval(poll);
                res();
                return;
            }

            elapsed += pollFrequency;

            if (!timeout) {
                return;
            }

            if (elapsed >= timeout) {
                clearInterval(poll);
                rej("Timed out");
            }
        }, pollFrequency);

    });
}