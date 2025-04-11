const axios = require('axios')
const {CookieJar} = require('tough-cookie');
const https= require('https')
const HttpsProxyAgent = require('https-proxy-agent')
const crypto = require('crypto')

const cookieJar = new CookieJar();

// Configure axios instance with cookie support
const apiClient = axios.create({
  httpsAgent: new HttpsProxyAgent('http://proxy-server:port'), // If needed
  withCredentials: true,
  jar: cookieJar,
  timeout: 15000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Temporary for testing
    ciphers: 'TLS_AES_256_GCM_SHA384'
  })
});

// Request interceptor for headers and logging
apiClient.interceptors.request.use(config => {
  config.headers = {
    ...config.headers,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://kingbaji.live/',
    'Origin': 'https://kingbaji.live/',
    'X-Requested-With': 'XMLHttpRequest'
  };
  
  console.log(`[API] ${config.method.toUpperCase()} to ${config.url}`);
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(response => {
  console.log(`[API] Response ${response.status} from ${response.config.url}`);
  return response;
}, error => {
  console.error('[API Error]', error.message);
  return Promise.reject(error);
});

// export const fetchApi = async (endpoint, data = {}, method = 'GET') => {
//   try {
//     const response = await apiClient({
//       method,
//       url: `http://fetch.336699bet.com/${endpoint}`,
//       [method === 'GET' ? 'params' : 'data']: data
//     });

//     return response.data;
//   } catch (error) {
//     console.error('[API] Request failed:', error.message);
//     return { 
//       errCode: error.response?.status || 500,
//       errMsg: error.response?.data?.message || 'Network Error'
//     };
//   }
// };

// export const generateSignature = (...args) => {
//   const string = args.filter(arg => arg !== undefined).join('');
//   return crypto.createHash('md5').update(string).digest('hex').toUpperCase();
// };