/**
 * BroadcastChannel wrapper for cross-tab communication
 * Falls back to LocalStorage events if BroadcastChannel is not supported
 */
class BroadcastChannelWrapper {
  constructor(channelName = 'promosuite_social') {
    this.channelName = channelName;
    this.listeners = new Set();
    this.initializeChannel();
  }

  /**
   * Initialize communication channel
   */
  initializeChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event) => {
        this.notifyListeners(event);
      };
    } else {
      // Fallback to localStorage events
      this.initializeLocalStorageFallback();
    }
  }

  /**
   * Initialize localStorage-based fallback
   */
  initializeLocalStorageFallback() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.channelName) {
        try {
          const data = JSON.parse(event.newValue);
          if (data && data.timestamp > Date.now() - 1000) { // Only process recent messages
            this.notifyListeners({ data });
          }
        } catch (error) {
          console.error('Error parsing broadcast message:', error);
        }
      }
    });
  }

  /**
   * Post message to other tabs
   */
  postMessage(message) {
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback: Store message in localStorage
      const data = {
        ...message,
        timestamp: Date.now()
      };
      localStorage.setItem(this.channelName, JSON.stringify(data));
      // Clean up old message after a short delay
      setTimeout(() => {
        localStorage.removeItem(this.channelName);
      }, 1000);
    }
  }

  /**
   * Add message listener
   */
  addEventListener(type, callback) {
    if (type === 'message') {
      this.listeners.add(callback);
    }
  }

  /**
   * Remove message listener
   */
  removeEventListener(type, callback) {
    if (type === 'message') {
      this.listeners.delete(callback);
    }
  }

  /**
   * Notify all listeners of a message
   */
  notifyListeners(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in broadcast channel listener:', error);
      }
    }
  }

  /**
   * Close the channel
   */
  close() {
    if (this.channel) {
      this.channel.close();
    }
    this.listeners.clear();
  }
}

// Export singleton instance
const broadcastChannel = new BroadcastChannelWrapper();
export { broadcastChannel };