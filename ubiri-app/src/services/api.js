const API_URL = 'http://localhost:5000/api';

const api = {
  async signup(userData) {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erreur lors de l\'inscription');
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Identifiants incorrects');
    }
    return res.json();
  },

  async getMessages(otherId, token) {
    const res = await fetch(`${API_URL}/messages/${otherId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async getConversations(token) {
    const res = await fetch(`${API_URL}/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async sendMessage(messageData, token) {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });
    return res.ok;
  },

  async getProducts() {
    const res = await fetch(`${API_URL}/products`);
    return res.json();
  },

  async addProduct(productData, token) {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    return res.ok;
  },

  async getOrders(token) {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async createOrder(orderData, token) {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  async confirmOrderCompletion(orderId, token) {
    const res = await fetch(`${API_URL}/orders/${orderId}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.ok;
  },

  async getWallet(token) {
    const res = await fetch(`${API_URL}/wallet`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async uploadFile(file, token) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Échec du téléchargement du fichier');
    return res.json();
  },

  async submitKYC(kycData, token) {
    const res = await fetch(`${API_URL}/kyc`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(kycData),
    });
    return res.json();
  },

  async getKYCStatus(token) {
    const res = await fetch(`${API_URL}/kyc/status`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
};

export default api;
