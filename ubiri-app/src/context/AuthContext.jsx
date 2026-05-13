import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import mechanicImg from '../assets/images/mechanic.png';
import electricianImg from '../assets/images/electrician.png';
import plumberImg from '../assets/images/plumber.png';
import carpenterImg from '../assets/images/carpenter.png';
import api from '../services/api';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

// Professional SHA-256 hashing for client-side preparation
async function secureHash(password) {
  const msgUint8 = new TextEncoder().encode(password + 'ubiri_secure_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCurrentUser() {
  try {
    const saved = localStorage.getItem('ubiri_user');
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("AuthContext: Persistence error", err);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUserState] = useState(getCurrentUser);
  const [socket, setSocket] = useState(null);
  const [marketplaceProducts, setMarketplaceProducts] = useState(() => {
    return JSON.parse(localStorage.getItem('ubiri_marketplace')) || [
      { id: 1, name: 'Perceuse à Percussion Bosch', price: 45000, description: 'Puissance 600W, idéale pour béton et bois.', category: 'Outillage', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400' },
      { id: 2, name: 'Caisse à outils complète', price: 25000, description: '150 pièces en acier chrome-vanadium.', category: 'Outillage', imageUrl: 'https://images.unsplash.com/photo-1586864387917-f579ae5259ea?auto=format&fit=crop&q=80&w=400' },
      { id: 3, name: 'Poste à souder Inverter', price: 85000, description: 'Léger et puissant, pour tous types d\'électrodes.', category: 'Soudure', imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400' },
      { id: 4, name: 'Lot de 5 Projecteurs LED 50W', price: 30000, description: 'Éclairage extérieur haute performance.', category: 'Électricité', imageUrl: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=400' },
    ];
  });
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('ubiri_cart')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('ubiri_wishlist')) || []);
  const [marketplaceOrders, setMarketplaceOrders] = useState(() => JSON.parse(localStorage.getItem('ubiri_m_orders')) || []);

  const setCurrentUser = useCallback((value) => {
    if (value === null) {
      localStorage.removeItem('ubiri_user');
      if (socket) socket.disconnect();
      setSocket(null);
    } else {
      localStorage.setItem('ubiri_user', JSON.stringify(value));
    }
    setCurrentUserState(value);
  }, [socket]);

  useEffect(() => {
    if (currentUser && !socket) {
      const newSocket = io('http://localhost:5000');
      newSocket.emit('join', currentUser.id);
      
      newSocket.on('new_message', (msg) => {
        window.dispatchEvent(new Event('ubiri_new_message'));
      });

      newSocket.on('new_order', (order) => {
        addNotification(currentUser.id, 'order', `Nouvelle commande !`, '/dashboard');
      });

      setSocket(newSocket);
    }
  }, [currentUser, socket]);

  const signup = useCallback(async (userData) => {
    try {
      const { user, token } = await api.signup(userData);
      const userWithToken = { ...user, token };
      setCurrentUser(userWithToken);
      return userWithToken;
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    }
  }, [setCurrentUser]);

  const login = useCallback(async (email, password) => {
    try {
      const { user, token } = await api.login(email, password);
      const userWithToken = { ...user, token };
      setCurrentUser(userWithToken);
      return userWithToken;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  }, [setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const isLoggedIn = () => currentUser !== null;
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
  const getGlobalProducts = useCallback(async (category = 'all', search = '') => {
    try {
      const allProducts = await api.getProducts();
      const q = search.toLowerCase().trim();
      return allProducts.filter((p) => {
        const matchCategory = category === 'all' || p.category?.toLowerCase() === category.toLowerCase() || p.workerTrade?.toLowerCase() === category.toLowerCase();
        const matchSearch = !q || 
          (p.name || '').toLowerCase().includes(q) || 
          (p.description || '').toLowerCase().includes(q) ||
          (p.workerName || '').toLowerCase().includes(q);
        return matchCategory && matchSearch;
      });
    } catch (err) {
      console.error("Failed to fetch products:", err);
      return [];
    }
  }, []);

  const addProduct = useCallback(async (product) => {
    if (!currentUser || currentUser.role !== 'worker') {
      throw new Error("Seuls les ouvriers peuvent ajouter des produits.");
    }
    const success = await api.addProduct(product, currentUser.token);
    if (success) {
      // Optionnel : re-fetch l'utilisateur pour mettre à jour son état local si nécessaire
    }
    return success;
  }, [currentUser]);

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
  const sendMessage = useCallback(async (toUserId, text = '', image = null, voice = null) => {
    if (!currentUser) throw new Error('Vous devez être connecté pour envoyer un message.');
    const success = await api.sendMessage({
      toId: Number(toUserId),
      text,
      image,
      voice
    }, currentUser.token);
    
    if (success) {
      window.dispatchEvent(new Event('ubiri_new_message'));
    }
    return success;
  }, [currentUser]);

  const getMessages = useCallback(async (otherUserId) => {
    if (!currentUser) return [];
    return await api.getMessages(otherUserId, currentUser.token);
  }, [currentUser]);

  const getConversations = useCallback(async () => {
    if (!currentUser) return [];
    return await api.getConversations(currentUser.token);
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
    signup, login, logout,
    isLoggedIn, getRole,
    publishServiceRequest,
    toggleFavorite, isFavorite, getFavorites,
    getGlobalProducts, addProduct, incrementProductView, addProductReview, addReviewReply, canReviewProduct,
    addNotification, clearNotifications,
    trackInquiry, getWorkerStats,
    sendMessage, getMessages, getConversations, markAsRead, addReaction, getUserById,
    uploadFile: (file) => api.uploadFile(file, currentUser?.token),
    socket,

    // ── Payment & Escrow System ──
    createOrder: async (workerId, serviceId, amount, serviceName) => {
      if (!currentUser) throw new Error('Vous devez être connecté pour payer.');
      const order = await api.createOrder({
        workerId: Number(workerId),
        serviceId: Number(serviceId),
        amount: Number(amount),
        serviceName
      }, currentUser.token);
      
      addNotification(Number(workerId), 'order', `Nouvelle commande de ${currentUser.name} !`, '/dashboard');
      return order;
    },

    getOrders: async () => {
      if (!currentUser) return [];
      return await api.getOrders(currentUser.token);
    },

    confirmOrderCompletion: async (orderId) => {
      if (!currentUser) return;
      const success = await api.confirmOrderCompletion(orderId, currentUser.token);
      if (success) {
        // Optionnel : Notification déjà gérée par le serveur ou à ajouter ici
      }
    },

    getWallet: async () => {
      if (!currentUser) return { balance: 0, transactions: [] };
      return await api.getWallet(currentUser.token);
    },

    // ── Verification (KYC) System ──
    submitKYC: async (kycData) => {
      if (!currentUser) return;
      const result = await api.submitKYC(kycData, currentUser.token);
      setCurrentUserState({ ...currentUser, verificationStatus: 'pending' });
      return result;
    },

    getKYCStatus: async () => {
      if (!currentUser) return { status: 'none' };
      return await api.getKYCStatus(currentUser.token);
    },

    adminVerifyWorker: async (userId, status) => {
      const res = await fetch(`http://localhost:5000/api/admin/verify/${userId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok && currentUser?.id === Number(userId)) {
        setCurrentUserState({ ...currentUser, verificationStatus: status });
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
