import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/client/environment';

import { RoomInfoResponse } from '../models/RoomInfo';

import { GlobalService } from './global.service';
import { NotificationsService } from './notifications.service';
import { LeftMenuService } from './left-menu.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StatsServerService {

  mySocket: Socket = null;

  public visitor = 0;
  public latency = 0;

  intervalPingPong = null;

  public badgeNews = [];
  public badgeBerkas = [];
  public badgeFansub = [];

  public portalVer = '0000000';
  public commitDate = null;
  public commitUser = null;
  public commitMessage = null;

  private currentRoomSubject: BehaviorSubject<RoomInfoResponse> = new BehaviorSubject<RoomInfoResponse>(null);
  public currentRoom: Observable<RoomInfoResponse> = this.currentRoomSubject.asObservable();
  public currentChatRoom = [];

  private globalRoomSubject: BehaviorSubject<RoomInfoResponse> = new BehaviorSubject<RoomInfoResponse>(null);
  public globalRoom: Observable<RoomInfoResponse> = this.globalRoomSubject.asObservable();
  public globalChatRoom = [];

  constructor(
    private as: AuthService,
    private gs: GlobalService,
    private notif: NotificationsService,
    private lms: LeftMenuService
  ) {
    if (this.gs.isBrowser) {
      this.mySocket = io(environment.baseUrl);
      this.socketListen();
    }
  }

  public get currentRoomValue(): any {
    return this.currentRoomSubject ? this.currentRoomSubject.value : null;
  }

  public get globalRoomValue(): any {
    return this.globalRoomSubject ? this.globalRoomSubject.value : null;
  }

  socketListen(): void {
    this.mySocket.on('disconnect', reason => {
      this.gs.log(`[SOCKET_DISCONNECTED] ${reason.replace(/\b[a-zA-Z]/g, str => str.toUpperCase())}`);
      if (reason === 'io server disconnect') {
        this.mySocket.connect();
      }
    });
    this.mySocket.on('reconnect', attemptNumber => {
      this.gs.log(`[SOCKET_RECONNECTED] Reconnected After ${attemptNumber} Attempts`);
    });
    this.mySocket.on('reconnect_attempt', attemptNumber => {
      this.gs.log(`[SOCKET_RECONNECTING] Reconnecting.. ${attemptNumber} Attempts`);
    });
    this.mySocket.on('reconnect_failed', attemptNumber => {
      this.gs.log(`[SOCKET_RECONNEC-FAILED] Reconnect Failed ${attemptNumber} Attempts`);
    });
    this.mySocket.on('error', error => {
      this.gs.log(`[SOCKET_ERROR]`, error);
    });
    this.mySocket.on('visitors', visitors => {
      this.gs.log(`[SOCKET_VISITOR] Total Visitors :: ${this.visitor}`);
      this.visitor = visitors;
    });
    this.mySocket.on('new-notification', (notifObj: any) => {
      this.gs.log(`[SOCKET_NOTIFICATION]`, notifObj);
      this.notif.addNotif(
        notifObj.notifCreator,
        notifObj.notifData.id,
        notifObj.notifData.type,
        notifObj.notifData.title,
        notifObj.notifData.content,
        notifObj.notifData.dismissible
      );
    });
    this.mySocket.on('new-berkas', (berkasObj: any) => {
      this.gs.log(`[SOCKET_BERKAS]`, berkasObj);
      this.badgeBerkas.push(berkasObj);
      const berkas = this.lms.mainMenus.find(m => m.link === '/berkas');
      if (this.badgeBerkas.length > 0) {
        berkas.badge = this.badgeBerkas.length;
      } else {
        berkas.badge = null;
      }
    });
    this.mySocket.on('new-fansub', (fansubObj: any) => {
      this.gs.log(`[SOCKET_FANSUB]`, fansubObj);
      this.badgeFansub.push(fansubObj);
      const fansub = this.lms.mainMenus.find(m => m.link === '/fansub');
      if (this.badgeFansub.length > 0) {
        fansub.badge = this.badgeFansub.length;
      } else {
        fansub.badge = null;
      }
    });
    this.mySocket.on('new-news', (newsObj: any) => {
      this.gs.log(`[SOCKET_NEWS]`, newsObj);
      this.badgeNews.push(newsObj);
      const news = this.lms.mainMenus.find(m => m.link === '/news');
      if (this.badgeNews.length > 0) {
        news.badge = this.badgeNews.length;
      } else {
        news.badge = null;
      }
    });
    this.mySocket.on('receive-chat', msg => {
      this.gs.log(`[SOCKET_RECEIVE-CHAT]`, msg);
      if (msg.room_id == 'GLOBAL_PUBLIK') {
        this.globalChatRoom.push(msg);
      } else {
        this.currentChatRoom.push(msg);
      }
    });
    this.mySocket.on('room-info', roomInfo => {
      this.gs.log(`[SOCKET_ROOM-INFO]`, roomInfo);
      this.gs.cleanObject(roomInfo.member_list)
      if (roomInfo.room_id == 'GLOBAL_PUBLIK') {
        this.globalRoomSubject.next(roomInfo);
      } else {
        this.currentRoomSubject.next(roomInfo);
      }
    });
    this.intervalPingPong = setInterval(() => {
      const start = Date.now();
      this.socketEmitVolatile('ping-pong', null, (response: any) => {
        this.latency = Date.now() - start;
        this.gs.log(`[SOCKET_PING-PONG] Latency :: ${this.latency} ms`);
        if ('github' in response && response.github) {
          this.portalVer = response.github.sha;
          this.commitUser = response.github.commit.author.name;
          this.commitDate = new Date(response.github.commit.author.date);
          this.commitMessage = response.github.commit.message;
        }
      });
    }, 10000);
  }

  socketEmit(eventName: string, eventData: any, callback = null): void {
    if (eventData) {
      eventData.jwtToken = this.as.jwtToken;
    }
    if (callback) {
      this.mySocket.emit(eventName, eventData, callback);
    } else {
      this.mySocket.emit(eventName, eventData);
    }
  }

  socketEmitVolatile(eventName: string, eventData: any, callback = null): void {
    if (eventData) {
      eventData.jwtToken = this.as.jwtToken;
    }
    if (callback) {
      this.mySocket.volatile.emit(eventName, eventData, callback);
    } else {
      this.mySocket.volatile.emit(eventName, eventData);
    }
  }

  socketLeaveAndJoinNewRoom(previousUrl: string, currentNewUrl: string): void {
    this.gs.log(`[SOCKET_LEAVE-JOIN-ROOM] ${previousUrl} => ${currentNewUrl}`);
    this.socketEmit('leave-join-room', {
      oldRoom: previousUrl, newRoom: currentNewUrl
    });
  }

}
