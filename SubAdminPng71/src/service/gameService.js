// services/gameService.js
import { apiService } from './api';

export const gameService = {
  // Get all games
  getAllGames: async (params = {}) => {
    return await apiService.get('/games', params);
  },

  // Get game by ID
  getGameById: async (id) => {
    return await apiService.get(`/games/${id}`);
  },

  // Get game categories
  getGameCategories: async () => {
    return await apiService.get('/games/categories');
  },

  // Get games by category
  getGamesByCategory: async (category, params = {}) => {
    return await apiService.get(`/games/category/${category}`, params);
  },

  // Get popular games
  getPopularGames: async (params = {}) => {
    return await apiService.get('/games/popular', params);
  },

  // Get game providers
  getProviders: async () => {
    return await apiService.get('/games/providers');
  },

  // Get games by provider
  getGamesByProvider: async (provider, params = {}) => {
    return await apiService.get(`/games/provider/${provider}`, params);
  },

  // Launch game
  launchGame: async (gameId, userId) => {
    return await apiService.post(`/games/${gameId}/launch`, { userId });
  },

  // Get game statistics
  getGameStats: async (gameId) => {
    return await apiService.get(`/games/${gameId}/stats`);
  }
};

export default gameService;
