import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SoundService } from '@app/services/sound/sound.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

const SOCKET_WHITELIST_PAGES = ['game', 'join', 'waiting-room', 'organisator', 'results'];

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    isConnected = false;
    private socket: Socket;
    private url: string = environment.gateawayUrl;
    private messageQueue: unknown[] = [];
    private isSendingMessage = false;

    constructor(
        private router: Router,
        private soundService: SoundService,
    ) {
        this.socket = io(this.url);
        this.router.events.subscribe((event) => {
            if (!(event instanceof NavigationEnd)) return;
            const url = event.url.split('/');
            if (!this.isConnected) return;
            if (!SOCKET_WHITELIST_PAGES.includes(url[1])) {
                this.disconnect();
            }

            // Nécessaire pour éviter de pouvoir back sur la page de jeu
            // et être encore considéré comme connecté.
            if (url[1] === 'join') {
                this.disconnect();
                this.connect();
            }
        });
        this.debugHeartbeat();
    }

    /*
     * Permet d'envoyer un événement au serveur
     * @param eventName Nom de l'événement
     * @param args Arguments à envoyer
     * @returns void */
    send(eventName: string, ...args: unknown[]) {
        this.messageQueue.push({ eventName, args });
        if (!this.isSendingMessage) {
            this.processQueue();
        }
    }

    /*
     * Permet d'écouter un événement du serveur
     * @param eventName Nom de l'événement
     * @param callback Callback à appeler
     * @returns void */
    listen<T>(eventName: string, callback: (data: T) => void): void {
        this.socket.on(eventName, (data: unknown) => callback(data as T));
    }

    /*
     * Permet de ne plus écouter un événement du serveur
     * @param eventName Nom de l'événement
     * @returns void */
    cancelListen(eventName: string): void {
        this.socket.off(eventName);
    }

    connect(): void {
        this.isConnected = true;
        this.socket.connect();
    }

    private disconnect(): void {
        this.isConnected = false;
        this.socket.disconnect();
        this.soundService.stopPlayingSound();
    }

    private processQueue() {
        if (this.messageQueue.length > 0) {
            this.isSendingMessage = true;
            const { eventName, args } = this.messageQueue.shift() as { eventName: string; args: unknown[] };
            this.socket.emit(eventName, ...args, () => {
                this.isSendingMessage = false;
                this.processQueue();
            });
        }
    }

    private debugHeartbeat() {
        if (environment.production) return;
        // Évènement de test pour vérifier qu'on est connecté au serveur
        this.listen('test', (data) => {
            // eslint-disable-next-line no-console -- Nécessaire pour le débug message dans la console.
            console.log(data);
        });
    }
}
