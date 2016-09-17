/* tslint:disable */

export class Plugin {
    name: string;
    description: string;

    dependenciesTemplate: any;
    settingsTemplate: any = {};

    order: number;
    active: boolean = false;
    value: any;
    valid: boolean = false;

    constructor(instance?: Plugin, order?: number, value?: any) {
        Object.assign(this, instance);
        this.order = order;
        this.value = value;
    }
}
