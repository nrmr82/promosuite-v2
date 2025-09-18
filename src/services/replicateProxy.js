/**
 * Replicate Proxy Service
 * Handles API calls through a backend proxy to avoid CORS issues
 */

class ReplicateProxy {
  constructor() {
    this.apiToken = process.env.REACT_APP_REPLICATE_API_TOKEN;
  }

  /**
   * Make a proxied request to Replicate API
   * For production, this should go through your backend
   */
  async proxyRequest(endpoint, method = 'POST', body = null) {
    try {
      // For development, we'll create a simple proxy endpoint
      // In production, this should go through your backend API
      const response = await fetch(`/api/replicate-proxy/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify({ ...body, apiToken: this.apiToken }) : null
      });

      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Proxy request failed:', error);
      throw error;
    }
  }

  /**
   * Run a prediction through the proxy
   */
  async run(model, input) {
    return await this.proxyRequest('predictions', 'POST', {
      version: model,
      input: input.input
    });
  }

  /**
   * Get prediction status
   */
  async getPrediction(id) {
    return await this.proxyRequest(`predictions/${id}`, 'GET');
  }
}

export default ReplicateProxy;
