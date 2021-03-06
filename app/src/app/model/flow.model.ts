import { FlowStep } from "./flow-step.model";

export class Flow {

    // TODO: Create data object, that holds the keys of stepIds and the data object as values. Inside these objects all the states will be saved an accessed from other steps

    public currentStep?: FlowStep;
    public list: FlowStep[] = [];
    public hasStarted: boolean = false;

    constructor(list: FlowStep[]) {
        this.list = list;
        this.currentStep = list[0];
        this.hasStarted = false;
    }

    public start(): void {
        this.hasStarted = true;
        this.currentStep.isActive = true;
    }

    public abort(): void {
        this.hasStarted = false;
        this.currentStep.isActive = false;
        this.currentStep = this.list[0];
    }

    public next(): void {
        if(!this.currentStep) this.currentStep = this.list[0];

        this.currentStep.isActive = false;
        this.currentStep = this.list[this.currentStep.id || 0];
        this.currentStep.isActive = true;
    }

}