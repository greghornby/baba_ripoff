import { App } from "./App.js";
import { AppEventEnum } from "./AppEventEnum.js";
import { AppEventInterface } from "./AppEventInterface.js";

export class AppEventSystem {

    public events: Map<EventName, EventCallback<any, any>[]> = new Map();

    public _domEvents: {[K in keyof WindowEventMap]?: (event: WindowEventMap[K]) => void};

    public _touches: Touch[] = [];
    public _doubleTap: boolean = false;

    constructor() {

        this._domEvents = {
            "keydown": event => this.emitKeyboardEvent(event, "down"),
            "keyup": event => this.emitKeyboardEvent(event, "up"),
            "keypress": event => this.emitKeyboardEvent(event, "press"),
            "touchstart": event => {
                for (let i = 0; i < event.changedTouches.length; i++) {
                    this._touches.push(event.changedTouches[i]);
                }
            },
            "touchend": event => {
                if (this._endTouchIsSwipe(event)) {
                    this.emitSwipeEvent(event);
                } else {
                    if (!this._doubleTap) {
                        this._doubleTap = true;
                        setTimeout(() => {
                            this._doubleTap = false;
                        }, 300);
                    } else {
                        this.emitDoubleTap(event);
                    }
                }
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const currentTouch = event.changedTouches[i];
                    const index = this._touches.findIndex(t => t.identifier === currentTouch.identifier);
                    if (index > -1) {
                        this._touches.splice(index, 1);
                    }
                }
            }
        };

        for (const eventName of Object.keys(this._domEvents)) {
            globalThis.addEventListener(eventName, (this._domEvents as any)[eventName]);
        }
    }


    public getEventListeners(eventName: EventName) {
        const listeners = this.events.get(eventName) ?? [];
        this.events.set(eventName, listeners);
        return listeners;
    }

    addListener<T extends EventCallback<AppEventInterface.DoubleTap, TouchEvent>>(eventName: EventEnum["doubleTap"], cb: T): T;
    addListener<T extends EventCallback<AppEventInterface.Swipe, TouchEvent>>(eventName: EventEnum["swipe"], cb: T): T;
    addListener<T extends EventCallback<AppEventInterface.Keyboard, KeyboardEvent>>(eventName: EventEnum["keyboard"], cb: T): T;
    addListener(eventName: EventName, cb: EventCallback<any, any>): EventCallback<any, any> {
        const wrapped: EventCallback<any, Event> = function(event, originalEvent) {
            const app = App.get();
            if (document.activeElement !== app.pixiApp.view) {
                return;
            }
            const preventDefault = cb(event, originalEvent);
            if (preventDefault) {
                originalEvent.preventDefault();
            }
        }
        this.getEventListeners(eventName).push(wrapped);
        return cb;
    }

    removeListener(eventName: EventName, cb: EventCallback<any, any>): void {
        const listeners = this.getEventListeners(eventName);
        const index = listeners.indexOf(cb);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emitEvent(eventName: EventName, event: any, originalEvent: any): void {
        const listeners = this.getEventListeners(eventName);
        for (const listener of listeners) {
            listener(event, originalEvent);
        }
    }

    emitKeyboardEvent(originalEvent: KeyboardEvent, type: AppEventInterface.Keyboard["type"]) {
        const simpleEvent: AppEventInterface.Keyboard = {
            key: originalEvent.key,
            type
        };
        this.emitEvent(AppEventEnum.keyboard, simpleEvent, originalEvent);
    }

    emitSwipeEvent(originalEvent: TouchEvent) {
        const endTouch = originalEvent.changedTouches[0];
        const simpleEvent = this._generateSwipeData(endTouch);
        this.emitEvent(AppEventEnum.swipe, simpleEvent, originalEvent);
    }

    emitDoubleTap(originalEvent: TouchEvent) {
        const endTouch = originalEvent.changedTouches[0];
        const simpleEvent: AppEventInterface.DoubleTap = {
            x: endTouch.pageX,
            y: endTouch.pageY
        };
        this.emitEvent(AppEventEnum.doubleTap, simpleEvent, originalEvent);
    }



    _endTouchIsSwipe(event: TouchEvent): boolean {
        const endTouch = event.changedTouches[0];
        const startTouch = this._getStartTouch(endTouch);

        const marginOfError = 5;
        const diffX = endTouch.pageX - startTouch.pageX;
        const diffY = endTouch.pageY - startTouch.pageY;

        return !(Math.abs(diffX) < marginOfError && Math.abs(diffY) < marginOfError);
    }

    _getStartTouch(touch: Touch): Touch {
        return this._touches.find(t => t.identifier === touch.identifier)!;
    }

    _generateSwipeData(endTouch: Touch): AppEventInterface.Swipe {
        const startTouch = this._getStartTouch(endTouch);

        const diffX = endTouch.pageX - startTouch.pageX;
        const diffY = endTouch.pageY - startTouch.pageY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                return {
                    direction: "right",
                    adjacentDistance: Math.abs(diffX)
                };
            } else {
                return {
                    direction: "left",
                    adjacentDistance: Math.abs(diffX)
                };
            }
        } else {
            if (diffY > 0) {
                return {
                    direction: "down",
                    adjacentDistance: Math.abs(diffY)
                };
            } else {
                return {
                    direction: "up",
                    adjacentDistance: Math.abs(diffY)
                };
            }
        }
    }
}

type EventEnum = (typeof AppEventEnum);
type EventName = (EventEnum)[keyof EventEnum];
type EventCallback<T = any, E extends Event = Event> = (event: T, originalEvent: E) => boolean | undefined | void;