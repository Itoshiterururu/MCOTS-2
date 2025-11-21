import config from '../config';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscribers = {
      units: new Set(),
      unitDelete: new Set(),
      unitsClear: new Set(),
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnecting = false;
    this.isConnected = false;
  }

  connect() {
    if (this.isConnecting || this.isConnected) {
      return;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.isConnecting = true;
    const socket = new SockJS(config.wsUrl);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Subscribe to unit updates
      this.stompClient.subscribe('/topic/units', (message) => {
        try {
          const unit = JSON.parse(message.body);
          this.subscribers.units.forEach(callback => callback(unit));
        } catch (error) {
          console.error('Failed to parse unit update:', error);
        }
      });

      // Subscribe to unit deletions
      this.stompClient.subscribe('/topic/units/delete', (message) => {
        const unitId = message.body;
        this.subscribers.unitDelete.forEach(callback => callback(unitId));
      });

      // Subscribe to clear all units
      this.stompClient.subscribe('/topic/units/clear', () => {
        this.subscribers.unitsClear.forEach(callback => callback());
      });
    }, (error) => {
      this.isConnected = false;
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      console.error(`WebSocket connection failed (attempt ${this.reconnectAttempts}):`, error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => this.connect(), delay);
      }
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  onUnitUpdate(callback) {
    this.subscribers.units.add(callback);
    return () => this.subscribers.units.delete(callback);
  }

  onUnitDelete(callback) {
    this.subscribers.unitDelete.add(callback);
    return () => this.subscribers.unitDelete.delete(callback);
  }

  onUnitsClear(callback) {
    this.subscribers.unitsClear.add(callback);
    return () => this.subscribers.unitsClear.delete(callback);
  }
}

export default new WebSocketService();