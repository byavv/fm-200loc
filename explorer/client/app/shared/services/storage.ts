import { Inject, OpaqueToken } from '@angular/core';

export const localStorageBackend = new OpaqueToken('localStorageBackend');

export interface IStorageBackend {
    getItem(key: string): any;
    setItem(key: string, value: any): void;
    removeItem(key: string): void;
}


export class Storage {
    storageBackend: IStorageBackend;

    constructor( @Inject(localStorageBackend) storageBackend: IStorageBackend) {
        this.storageBackend = storageBackend;
    }

    getItem(key) {
        return this.storageBackend.getItem(key);
    }

    setItem(key, value) {
        return this.storageBackend.setItem(key, value);
    }

    removeItem(key) {
        return this.storageBackend.removeItem(key);
    }
    initStorage(backend) {
        this.storageBackend = backend;
    }
}

export const STORAGE_PROVIDERS = [
    {
        provide: Storage,
        useFactory: () => window.localStorage || {
            getItem: (key) => { return null },
            setItem: (key, value) => { return null },
            removeItem: (key) => { return null }
        }
    }
];
