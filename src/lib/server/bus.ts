import { EventEmitter } from 'node:events';

const g = globalThis as any;
if (!g.__yactBus) g.__yactBus = new EventEmitter();

export const bus: EventEmitter = g.__yactBus;
