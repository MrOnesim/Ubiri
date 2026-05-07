import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import mechanicImg from '../assets/images/mechanic.png';
import electricianImg from '../assets/images/electrician.png';
import plumberImg from '../assets/images/plumber.png';
import carpenterImg from '../assets/images/carpenter.png';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getCurrentUser() {
  try {
    const saved = localStorage.getItem('ubiri_user');
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("AuthContext: Persistence error", err);
    return null;
  }
}

function getAuthToken() {
  try {
    return localStorage.getItem('ubiri_token');
  } catch (err) {
    console.error("AuthContext: Token retrieval error", err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(getCurrentUser);
  const [authToken, setAuthTokenState] = useState(getAuthToken);
  const [marketplaceProducts, setMarketplaceProducts] = useState(() => {
    return JSON.parse(localStorage.getItem('ubiri_marketplace')) || [
      { id: 1, name: 'Perceuse à Percussion Bosch', price: 45000, description: 'Puissance 600W, idéale pour béton et bois.', category: 'Outillage', imageUrl: 'https://images.unsplash.com/photo-1' },
      { id: 2, name: 'Caisse à outils complète', price: 25000, description: '150 pièces en acier chrome-vanadium.', category: 'Outillage', imageUrl: 'https://images.unsplash.com/photo-2' },
      { id: 3, name: 'Poste à souder Inverter', price: 85000, description: 'Léger et puissant, pour tous types d\'électrodes.', category: 'Soudure', imageUrl: 'https://images.unsplash.com/photo-3' },
      { id: 4, name: 'Lot de 5 Projecteurs LED 50W', price: 30000, description: 'Éclairage extérieur haute performance.', category: 'Électricité', imageUrl: 'https://images.unsplash.com/photo-4' },
    ];
  });
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('ubiri_cart')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('ubiri_wishlist')) || []);
  const [marketplaceOrders, setMarketplaceOrders] = useState(() => JSON.parse(localStorage.getItem('ubiri_m_orders')) || []);

  const setCurrentUser = useCallback((value) => {
    if (value === null) {
      localStorage.removeItem('ubiri_user');
      localStorage.removeItem('ubiri_token');
    } else {
      localStorage.setItem('ubiri_user', JSON.stringify(value));
    }
    setCurrentUserState(value);
  }, []);

  const setAuthToken = useCallback((token) => {
    if (token === null) {
      localStorage.removeItem('ubiri_token');
    } else {
      localStorage.setItem('ubiri_token', token);
    }
    setAuthTokenState(token);
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'inscription');
      }

      const { user, token } = await response.json();
      setCurrentUser(user);
      setAuthToken(token);
      return user;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  }, [setCurrentUser, setAuthToken]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la connexion');
      }

      const { user, token } = await response.json();
      setCurrentUser(user);
      setAuthToken(token);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  }, [setCurrentUser, setAuthToken]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthToken(null);
  }, [setCurrentUser, setAuthToken]);

  const isLoggedIn = () => currentUser !== null && authToken !== null;
  const getRole = () => currentUser?.role || null;
  const isAdmin = () => currentUser?.email === 'ubiri.africa@gmail.com';

  // ── Service Requests ──
  const publishServiceRequest = useCallback((requestData) => {
    if (!currentUser || currentUser.role !== 'client') {
      throw new Error('Seuls les clients peuvent publier des demandes.');
    }
    const requests = JSON.parse(localStorage.getItem('ubiri_requests')) || [];
    const newRequest = {
      id: Date.now(),
      clientId: currentUser.id,
      clientName: currentUser.name,
      ...requestData,
      status: 'pending',
      date: new Date().toISOString(),
    };
    requests.push(newRequest);
    localStorage.setItem('ubiri_requests', JSON.stringify(requests));
    return newRequest;
  }, [currentUser]);

  // ── Favorites ──
  const toggleFavorite = useCallback((productId) => {
    if (!currentUser || currentUser.role !== 'client') return;
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index !== -1) {
      users[index].favorites = users[index].favorites || [];
      const favIndex = users[index].favorites.indexOf(productId);
      if (favIndex === -1) users[index].favorites.push(productId);
      else users[index].favorites.splice(favIndex, 1);
      localStorage.setItem('ubiri_users', JSON.stringify(users));
      setCurrentUser(users[index]);
    }
  }, [currentUser, setCurrentUser]);

  const isFavorite = (productId) => {
    return currentUser?.favorites?.includes(productId) || false;
  };

  const getFavorites = () => {
    if (!currentUser?.favorites) return [];
    return getGlobalProducts().filter((p) => currentUser.favorites.includes(p.id));
  };

  // ── Products ──
  const getGlobalProducts = useCallback((category = 'all', search = '') => {
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    const allProducts = users.reduce((acc, u) => {
      if (u.role === 'worker' && u.products) {
        const enriched = u.products.map(p => ({
          ...p,
          imageUrl: p.imageUrl || (
            u.trade === 'Plombier' ? plumberImg :
            u.trade === 'Électricien' ? electricianImg :
            u.trade === 'Mécanicien' ? mechanicImg :
            u.trade === 'Menuisier' ? carpenterImg : ''
          ),
          workerId: u.id,
          workerName: u.name,
          workerTrade: u.trade,
          workerCity: u.city,
          lat: u.lat,
          lng: u.lng,
          verificationStatus: u.verificationStatus
        }));
        return [...acc, ...enriched];
      }
      return acc;
    }, []);

    const q = search.toLowerCase().trim();
    return allProducts.filter((p) => {
      const matchCategory = category === 'all' || p.workerTrade?.toLowerCase() === category.toLowerCase();
      const matchSearch = !q || 
        (p.name || '').toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q) ||
        (p.workerName || '').toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, []);

  const addProduct = useCallback((product) => {
    if (!currentUser || currentUser.role !== 'worker') {
      throw new Error("Seuls les ouvriers peuvent ajouter des produits.");
    }
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index !== -1) {
      const newProduct = {
        ...product,
        id: Date.now(),
        workerId: currentUser.id,
        workerName: currentUser.name,
        workerTrade: currentUser.trade,
        imageUrl: product.imageUrl || '',
        views: 0,
        reviews: [],
      };
      users[index].products.push(newProduct);
      localStorage.setItem('ubiri_users', JSON.stringify(users));
      setCurrentUser(users[index]);
    }
  }, [currentUser, setCurrentUser]);

  const incrementProductView = (productId) => {
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    let found = false;
    users.forEach((u) => {
      if (u.role === 'worker' && u.products) {
        const product = u.products.find((p) => p.id === productId);
        if (product) { product.views = (product.views || 0) + 1; found = true; }
      }
    });
    if (found) localStorage.setItem('ubiri_users', JSON.stringify(users));
  };

  const addProductReview = (productId, reviewData) => {
    if (!currentUser) throw new Error('Vous devez être connecté pour donner un avis.');
    
    // Vérifier si l'utilisateur a une commande terminée pour ce produit
    const allOrders = JSON.parse(localStorage.getItem('ubiri_orders')) || [];
    const hasPaid = allOrders.some(o => o.clientId === currentUser.id && o.serviceId === Number(productId) && o.status === 'completed');
    
    if (!hasPaid) {
      throw new Error('Seuls les clients ayant complété une prestation peuvent laisser un avis vérifié.');
    }

    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    let updated = false;
    users.forEach((u) => {
      if (u.role === 'worker' && u.products) {
        const product = u.products.find((p) => p.id === productId);
        if (product) {
          product.reviews = product.reviews || [];
          product.reviews.push({ 
            ...reviewData, 
            id: Date.now(), 
            date: new Date().toISOString(),
            isVerifiedPurchase: true,
            authorName: currentUser.name,
            authorId: currentUser.id
          });
          updated = true;
        }
      }
    });
    if (updated) {
      localStorage.setItem('ubiri_users', JSON.stringify(users));
      // Notifier l'artisan du nouvel avis
      const worker = users.find(u => u.products && u.products.some(p => p.id === productId));
      if (worker) {
        addNotification(worker.id, 'review', `Nouveau commentaire de ${currentUser.name}`, `/profil/${worker.id}`);
      }
    }
  };

  const addReviewReply = (productId, reviewId, replyText) => {
    if (!currentUser || currentUser.role !== 'worker') throw new Error('Action non autorisée.');
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    let updated = false;
    users.forEach((u) => {
      if (u.id === currentUser.id && u.products) {
        const product = u.products.find(p => p.id === productId);
        if (product && product.reviews) {
          const review = product.reviews.find(r => r.id === reviewId);
          if (review) {
            review.reply = {
              text: replyText,
              date: new Date().toISOString()
            };
            updated = true;
          }
        }
      }
    });
    if (updated) {
      localStorage.setItem('ubiri_users', JSON.stringify(users));
      setCurrentUser(users.find(u => u.id === currentUser.id));
    }
  };

  const canReviewProduct = (productId) => {
    if (!currentUser) return false;
    const allOrders = JSON.parse(localStorage.getItem('ubiri_orders')) || [];
    return allOrders.some(o => o.clientId === currentUser.id && o.serviceId === Number(productId) && o.status === 'completed');
  };

  const addNotification = useCallback((userId, type, message, link = '#') => {
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    let updated = false;
    users.forEach((u) => {
      if (u.id === userId) {
        u.notifications = u.notifications || [];
        u.notifications.unshift({
          id: Date.now(),
          type,
          message,
          link,
          read: false,
          date: new Date().toISOString()
        });
        if (u.notifications.length > 50) u.notifications.pop();
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('ubiri_users', JSON.stringify(users));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(users.find(u => u.id === userId));
      }
      // Événement pour les toasts en temps réel
      window.dispatchEvent(new CustomEvent('ubiri_notification', { detail: { type, message } }));
    }
  }, [currentUser, setCurrentUser]);

  const clearNotifications = useCallback(() => {
    if (!currentUser) return;
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    let updated = false;
    users.forEach((u) => {
      if (u.id === currentUser.id) {
        u.notifications = (u.notifications || []).map(n => ({ ...n, read: true }));
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('ubiri_users', JSON.stringify(users));
      setCurrentUser(users.find(u => u.id === currentUser.id));
    }
  }, [currentUser, setCurrentUser]);

  const trackInquiry = useCallback((productId) => {
    if (!currentUser || currentUser.role !== 'client') return;
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index !== -1) {
      users[index].inquiries = users[index].inquiries || [];
      if (!users[index].inquiries.includes(productId)) {
        users[index].inquiries.push(productId);
        localStorage.setItem('ubiri_users', JSON.stringify(users));
        setCurrentUser(users[index]);
      }
    }
  }, [currentUser, setCurrentUser]);

  const getWorkerStats = useCallback(() => {
    if (!currentUser || currentUser.role !== 'worker') return { orders: 0, views: 0, inquiries: 0, rating: 0 };
    
    // Récupérer les données fraîches du localStorage pour l'artisan
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    const worker = users.find(u => u.id === currentUser.id) || currentUser;
    
    const allOrders = JSON.parse(localStorage.getItem('ubiri_orders')) || [];
    const myOrders = allOrders.filter(o => o.workerId === currentUser.id);
    
    let totalViews = 0;
    (worker.products || []).forEach(p => {
      totalViews += (p.views || 0);
    });

    const inquiriesCount = (worker.inquiries || []).length;
    
    let totalRating = 0;
    let reviewsCount = 0;
    (worker.products || []).forEach(p => {
      (p.reviews || []).forEach(r => {
        totalRating += r.rating;
        reviewsCount++;
      });
    });
    const avgRating = reviewsCount > 0 ? (totalRating / reviewsCount).toFixed(1) : 0;

    return {
      orders: myOrders.length,
      views: totalViews,
      inquiries: inquiriesCount,
      rating: avgRating
    };
  }, [currentUser]);

  // ── Messaging System ──
  const sendMessage = useCallback((toUserId, text = '', image = null, voice = null) => {
    if (!currentUser) throw new Error('Vous devez être connecté pour envoyer un message.');
    const allMessages = JSON.parse(localStorage.getItem('ubiri_messages')) || [];
    const newMessage = {
      id: Date.now(),
      fromId: currentUser.id,
      toId: Number(toUserId),
      text,
      image, // Base64 string
      voice, // Base64 audio string
      date: new Date().toISOString(),
      read: false,
      reactions: [], // Array of { emoji, userId }
    };
    allMessages.push(newMessage);
    localStorage.setItem('ubiri_messages', JSON.stringify(allMessages));
    addNotification(Number(toUserId), 'message', `Nouveau message de ${currentUser.name}`, `/chat/${currentUser.id}`);
    window.dispatchEvent(new Event('ubiri_new_message'));
    return newMessage;
  }, [currentUser, addNotification]);

  const getMessages = useCallback((otherUserId) => {
    if (!currentUser) return [];
    const allMessages = JSON.parse(localStorage.getItem('ubiri_messages')) || [];
    const oid = Number(otherUserId);
    return allMessages.filter(
      (m) => (m.fromId === currentUser.id && m.toId === oid) || (m.fromId === oid && m.toId === currentUser.id)
    );
  }, [currentUser]);

  const getConversations = useCallback(() => {
    if (!currentUser) return [];
    const allMessages = JSON.parse(localStorage.getItem('ubiri_messages')) || [];
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    
    // Trouver tous les IDs avec qui l'utilisateur a discuté
    const interlocutorIds = new Set();
    allMessages.forEach(m => {
      if (m.fromId === currentUser.id) interlocutorIds.add(m.toId);
      if (m.toId === currentUser.id) interlocutorIds.add(m.fromId);
    });

    return Array.from(interlocutorIds).map(id => {
      const user = users.find(u => u.id === id);
      const thread = allMessages.filter(m => (m.fromId === currentUser.id && m.toId === id) || (m.fromId === id && m.toId === currentUser.id));
      const lastMessage = thread[thread.length - 1];
      const unreadCount = thread.filter(m => m.toId === currentUser.id && !m.read).length;
      return {
        user,
        lastMessage,
        unreadCount
      };
    })
    .filter(conv => conv.lastMessage) // FIX: Éviter undefined lastMessage
    .sort((a, b) => new Date(b.lastMessage.date) - new Date(a.lastMessage.date));
  }, [currentUser]);

  const markAsRead = useCallback((otherUserId) => {
    if (!currentUser) return;
    const allMessages = JSON.parse(localStorage.getItem('ubiri_messages')) || [];
    const oid = Number(otherUserId);
    let changed = false;
    allMessages.forEach(m => {
      if (m.fromId === oid && m.toId === currentUser.id && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('ubiri_messages', JSON.stringify(allMessages));
      window.dispatchEvent(new Event('ubiri_new_message'));
    }
  }, [currentUser]);

  const addReaction = useCallback((messageId, emoji) => {
    if (!currentUser) return;
    const allMessages = JSON.parse(localStorage.getItem('ubiri_messages')) || [];
    const message = allMessages.find(m => m.id === messageId);
    if (message) {
      message.reactions = message.reactions || [];
      const existingIdx = message.reactions.findIndex(r => r.userId === currentUser.id && r.emoji === emoji);
      if (existingIdx !== -1) {
        message.reactions.splice(existingIdx, 1);
      } else {
        message.reactions.push({ emoji, userId: currentUser.id });
      }
      localStorage.setItem('ubiri_messages', JSON.stringify(allMessages));
      window.dispatchEvent(new Event('ubiri_new_message'));
    }
  }, [currentUser]);

  const getUserById = (id) => {
    const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
    return users.find(u => u.id === Number(id));
  };

  const value = {
    currentUser,
    authToken,
    signup, login, logout,
    isLoggedIn, getRole,
    publishServiceRequest,
    toggleFavorite, isFavorite, getFavorites,
    getGlobalProducts, addProduct, incrementProductView, addProductReview, addReviewReply, canReviewProduct,
    addNotification, clearNotifications,
    trackInquiry, getWorkerStats,
    sendMessage, getMessages, getConversations, markAsRead, addReaction, getUserById,

    // ── Payment & Escrow System ──
    createOrder: (workerId, serviceId, amount, serviceName) => {
      if (!currentUser) throw new Error('Vous devez être connecté pour payer.');
      const allOrders = JSON.parse(localStorage.getItem('ubiri_orders')) || [];
      const newOrder = {
        id: `ORD-${Date.now()}`,
        clientId: currentUser.id,
        clientName: currentUser.name,
        workerId: Number(workerId),
        serviceId: Number(serviceId),
        serviceName,
        amount: Number(amount),
        commission: Number(amount) * 0.1,
        netAmount: Number(amount) * 0.9,
        status: 'escrow', // Paid but held by platform
        date: new Date().toISOString(),
      };
      allOrders.push(newOrder);
      localStorage.setItem('ubiri_orders', JSON.stringify(allOrders));
      addNotification(Number(workerId), 'order', `Nouvelle commande de ${currentUser.name} !`, '/dashboard');
      return newOrder;
    },

    getOrders: () => {
      const allOrders = JSON.parse(localStorage.getItem('ubiri_orders')) || [];
      if (!currentUser) return [];
      if (currentUser.role === 'client') {
        return allOrders.filter(o => o.clientId === currentUser.id);
      } else {
        return allOrders.filter(o => o.workerId === currentUser.id);
      }
    },

    confirmOrderCompletion: (orderId) => {
      const allOrders = JSON.parse(localStorage.getItem('ubiri_orders')) || [];
      const order = allOrders.find(o => o.id === orderId);
      if (!order) throw new Error('Commande introuvable.');
      if (order.clientId !== currentUser.id) throw new Error('Seul le client peut confirmer la fin des travaux.');
      
      order.status = 'completed';
      localStorage.setItem('ubiri_orders', JSON.stringify(allOrders));

      // Verser l'argent sur le portefeuille de l'ouvrier
      const allWallets = JSON.parse(localStorage.getItem('ubiri_wallets')) || {};
      const workerWallet = allWallets[order.workerId] || { balance: 0, transactions: [] };
      workerWallet.balance += order.netAmount;
      workerWallet.transactions.push({
        id: `TR-${Date.now()}`,
        amount: order.netAmount,
        type: 'income',
        description: `Service terminé : ${order.serviceName}`,
        date: new Date().toISOString(),
      });
      allWallets[order.workerId] = workerWallet;
      localStorage.setItem('ubiri_wallets', JSON.stringify(allWallets));
      addNotification(order.workerId, 'wallet', `Paiement reçu : ${order.netAmount} FCFA versés sur votre portefeuille !`, '/wallet');
    },

    getWallet: () => {
      if (!currentUser) return { balance: 0, transactions: [] };
      const allWallets = JSON.parse(localStorage.getItem('ubiri_wallets')) || {};
      return allWallets[currentUser.id] || { balance: 0, transactions: [] };
    },

    // ── Verification (KYC) System ──
    submitVerification: (documents) => {
      if (!currentUser || currentUser.role !== 'worker') throw new Error('Action non autorisée.');
      const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users[index].verificationStatus = 'pending';
        users[index].verificationDocs = documents; // Base64 files
        localStorage.setItem('ubiri_users', JSON.stringify(users));
        setCurrentUser(users[index]);
      }
    },

    adminVerifyWorker: (userId, status) => {
      // Simulate admin validation
      const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
      const index = users.findIndex(u => u.id === Number(userId));
      if (index !== -1) {
        users[index].verificationStatus = status; // 'verified' or 'rejected'
        localStorage.setItem('ubiri_users', JSON.stringify(users));
        if (currentUser?.id === Number(userId)) {
          setCurrentUser(users[index]);
        }
        addNotification(Number(userId), 'verification', 
          status === 'verified' ? '🛡️ Votre profil est désormais vérifié !' : '🛡️ Votre demande de vérification a pris du retard.', 
          '/dashboard'
        );
      }
    },

    // ── Portfolio & Interventions System ──
    addIntervention: (interventionData) => {
      if (!currentUser || currentUser.role !== 'worker') throw new Error('Action non autorisée.');
      const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users[index].interventions = users[index].interventions || [];
        users[index].interventions.unshift({
          id: Date.now(),
          ...interventionData,
          likes: [],
          date: new Date().toISOString()
        });
        localStorage.setItem('ubiri_users', JSON.stringify(users));
        setCurrentUser(users[index]);
        window.dispatchEvent(new Event('ubiri_post_update'));
      }
    },

    deleteIntervention: (interventionId) => {
      if (!currentUser || currentUser.role !== 'worker') throw new Error('Action non autorisée.');
      const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users[index].interventions = (users[index].interventions || []).filter(i => i.id !== interventionId);
        localStorage.setItem('ubiri_users', JSON.stringify(users));
        setCurrentUser(users[index]);
        window.dispatchEvent(new Event('ubiri_post_update'));
      }
    },

    toggleLikeIntervention: (workerId, interventionId) => {
      if (!currentUser) throw new Error('Vous devez être connecté pour aimer une photo.');
      const users = JSON.parse(localStorage.getItem('ubiri_users')) || [];
      let updated = false;
      users.forEach(u => {
        if (u.id === Number(workerId)) {
          const interv = (u.interventions || []).find(i => i.id === Number(interventionId));
          if (interv) {
            const likeIndex = interv.likes.indexOf(currentUser.id);
            if (likeIndex === -1) {
              interv.likes.push(currentUser.id);
              addNotification(u.id, 'review', `${currentUser.name} a aimé l'une de vos réalisations !`, `/profil/${u.id}`);
            } else {
              interv.likes.splice(likeIndex, 1);
            }
            updated = true;
          }
        }
      });
      if (updated) {
        localStorage.setItem('ubiri_users', JSON.stringify(users));
        window.dispatchEvent(new Event('ubiri_post_update'));
        if (currentUser.id === Number(workerId)) {
          setCurrentUser(users.find(u => u.id === currentUser.id));
        }
      }
    },
    // ── Marketplace System ──
    getMarketplaceProducts: () => marketplaceProducts,
    
    addMarketplaceProduct: (product) => {
      if (!isAdmin()) throw new Error('Action réservée à l\'administrateur.');
      const newProducts = [...marketplaceProducts, { ...product, id: Date.now() }];
      setMarketplaceProducts(newProducts);
      localStorage.setItem('ubiri_marketplace', JSON.stringify(newProducts));
    },

    deleteMarketplaceProduct: (id) => {
      if (!isAdmin()) throw new Error('Action réservée à l\'administrateur.');
      const newProducts = marketplaceProducts.filter(p => p.id !== id);
      setMarketplaceProducts(newProducts);
      localStorage.setItem('ubiri_marketplace', JSON.stringify(newProducts));
    },

    // ── Cart System ──
    getCart: () => cart,
    addToCart: (product) => {
      const newCart = [...cart, { ...product, cartId: Date.now() }];
      setCart(newCart);
      localStorage.setItem('ubiri_cart', JSON.stringify(newCart));
      addNotification(currentUser?.id, 'cart', `${product.name} ajouté au panier`, '/cart');
    },
    removeFromCart: (cartId) => {
      const newCart = cart.filter(item => item.cartId !== cartId);
      setCart(newCart);
      localStorage.setItem('ubiri_cart', JSON.stringify(newCart));
    },
    clearCart: () => {
      setCart([]);
      localStorage.setItem('ubiri_cart', JSON.stringify([]));
    },
    getCartTotal: () => cart.reduce((sum, item) => sum + Number(item.price), 0),
    
    // ── Wishlist System ──
    getWishlist: () => wishlist,
    toggleWishlist: (productId) => {
      const index = wishlist.indexOf(productId);
      const newWishlist = [...wishlist];
      if (index === -1) newWishlist.push(productId);
      else newWishlist.splice(index, 1);
      setWishlist(newWishlist);
      localStorage.setItem('ubiri_wishlist', JSON.stringify(newWishlist));
    },
    isWishlisted: (productId) => wishlist.includes(productId),

    // ── Order System ──
    getMarketplaceOrders: () => marketplaceOrders,
    placeMarketplaceOrder: (shippingInfo) => {
      if (cart.length === 0) throw new Error('Le panier est vide.');
      const newOrder = {
        id: `MB-${Date.now()}`,
        userId: currentUser?.id,
        userName: currentUser?.name || 'Invité',
        items: [...cart],
        total: cart.reduce((sum, item) => sum + Number(item.price), 0),
        status: 'payé',
        date: new Date().toISOString(),
        shippingInfo
      };
      const newOrders = [newOrder, ...marketplaceOrders];
      setMarketplaceOrders(newOrders);
      localStorage.setItem('ubiri_m_orders', JSON.stringify(newOrders));
      setCart([]);
      localStorage.setItem('ubiri_cart', JSON.stringify([]));
      return newOrder;
    },

    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
