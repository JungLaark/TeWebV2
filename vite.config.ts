import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps for easier debugging
  },
  server: {
    port: 5173, // Default port for Vite
    proxy: {
      '/esl/': {
        target: 'http://192.168.1.10:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 대상 서버 정보가 헤더에 있으면 활용
            const targetServer = req.headers['x-target-server'];
            if (targetServer) {
              // 타겟 서버 URL 포맷팅
              let serverUrl = `${targetServer}`;
              if (!serverUrl.includes('http://') && !serverUrl.includes('https://')) {
                serverUrl = `http://${serverUrl}`;
              }
              
              // 포트 번호 추가
              const serverType = req.headers['x-server-type'] || 'CORE';
              const urlWithoutProtocol = serverUrl.replace(/^https?:\/\//, '');
              if (!urlWithoutProtocol.includes(':')) {
                serverUrl = `${serverUrl}:${serverType === 'CORE' ? '8080' : '8081'}`;
              }
              
              // 타겟 변경
              proxy.options.target = serverUrl;
              console.log(`Changing proxy target to: ${serverUrl}`);
              
              // 대상 서버 헤더 제거 (필요시)
              proxyReq.removeHeader('x-target-server');
              proxyReq.removeHeader('x-server-type');
              proxyReq.removeHeader('x-protocol-version');
            }

            // Authorization 헤더 처리 - 중요: 수정된 부분
            const auth = req.headers.authorization;
            if (auth) {
              console.log('Forwarding Authorization header:', auth);
              proxyReq.setHeader('Authorization', auth);
              
              // Authorization 헤더 디코딩하여 로그 (디버깅용)
              if (auth.startsWith('Basic ')) {
                const base64Credentials = auth.split(' ')[1];
                try {
                  const decodedCredentials = atob(base64Credentials);
                  console.log('Decoded credentials format:', decodedCredentials.includes(':') ? 'username:password' : 'invalid format');
                } catch (e) {
                  console.error('Failed to decode authorization header:', e);
                }
              }
            } else {
              console.warn('No Authorization header found in request');
            }

            // 브라우저 기본 인증 팝업 방지
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');

            // 디버깅 로그
            console.log(`Proxying ${req.method} request to: ${proxy.options.target}${req.url}`);
            console.log('Request headers:', req.headers);
          });

          // 응답 처리
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // CORS 헤더 추가
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-target-server, x-server-type, x-protocol-version, X-Requested-With';
            proxyRes.headers['Access-Control-Max-Age'] = '86400';
            
            // www-authenticate 헤더 제거 (브라우저 기본 인증 팝업 방지)
            if (proxyRes.headers['www-authenticate']) {
              console.log('Removing www-authenticate header from response');
              delete proxyRes.headers['www-authenticate'];
            }
            
            console.log(`Received response from ${proxy.options.target}${req.url}, status: ${proxyRes.statusCode}`);
            console.log('Response headers:', proxyRes.headers);
            
            // 401 오류 처리 - 디버깅용 로그 추가
            if (proxyRes.statusCode === 401) {
              console.error('Authentication failed (401 Unauthorized)');
              // 응답 바디를 로깅하기 위한 코드
              let responseBody = '';
              proxyRes.on('data', (chunk) => {
                responseBody += chunk;
              });
              proxyRes.on('end', () => {
                try {
                  const parsedBody = JSON.parse(responseBody);
                  console.error('Response body:', parsedBody);
                } catch (e) {
                  console.error('Raw response body:', responseBody);
                }
              });
            }
          });

          // OPTIONS 요청(preflight) 처리
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.method === 'OPTIONS') {
              console.log('Handling OPTIONS request');
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-target-server, x-server-type, x-protocol-version, X-Requested-With',
                'Access-Control-Max-Age': '86400',
              });
              res.end();
              return;
            }
          });
          
          // 에러 처리
          proxy.on('error', (err, req, res) => {
            console.error(`Proxy error: ${err.message}`);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        }
      },
      
      // ESN API 프록시
      '/user/': {
        target: 'http://192.168.1.10:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const targetServer = req.headers['x-target-server'];
            if (targetServer) {
              let serverUrl = `${targetServer}`;
              if (!serverUrl.includes('http://') && !serverUrl.includes('https://')) {
                serverUrl = `http://${serverUrl}`;
              }
              
              const serverType = req.headers['x-server-type'] || 'ESN';
              const urlWithoutProtocol = serverUrl.replace(/^https?:\/\//, '');
              if (!urlWithoutProtocol.includes(':')) {
                serverUrl = `${serverUrl}:${serverType === 'CORE' ? '8080' : '8081'}`;
              }
              
              proxy.options.target = serverUrl;
              console.log(`Changing proxy target to: ${serverUrl}`);
              
              // 헤더 제거
              proxyReq.removeHeader('x-target-server');
              proxyReq.removeHeader('x-server-type');
              proxyReq.removeHeader('x-protocol-version');
            }

            // Authorization 헤더 처리 - 개선된 로직
            const auth = req.headers.authorization;
            if (auth) {
              console.log('Forwarding Authorization header:', auth);
              proxyReq.setHeader('Authorization', auth);
              
              // Authorization 헤더 디코딩하여 로그 (디버깅용)
              if (auth.startsWith('Basic ')) {
                const base64Credentials = auth.split(' ')[1];
                try {
                  const decodedCredentials = atob(base64Credentials);
                  console.log('Decoded credentials format:', decodedCredentials.includes(':') ? 'username:password' : 'invalid format');
                } catch (e) {
                  console.error('Failed to decode authorization header:', e);
                }
              }
            }
            
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
            
            console.log(`Proxying ${req.method} request to: ${proxy.options.target}${req.url}`);
            console.log('Request headers:', req.headers);
          });

          // 응답 및 에러 처리는 위와 동일
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-target-server, x-server-type, x-protocol-version, X-Requested-With';
            proxyRes.headers['Access-Control-Max-Age'] = '86400';
            
            if (proxyRes.headers['www-authenticate']) {
              console.log('Removing www-authenticate header from response');
              delete proxyRes.headers['www-authenticate'];
            }
            
            console.log(`Received response from ${proxy.options.target}${req.url}, status: ${proxyRes.statusCode}`);
            
            // 401 오류 로깅
            if (proxyRes.statusCode === 401) {
              console.error('Authentication failed (401 Unauthorized)');
              let responseBody = '';
              proxyRes.on('data', (chunk) => {
                responseBody += chunk;
              });
              proxyRes.on('end', () => {
                try {
                  const parsedBody = JSON.parse(responseBody);
                  console.error('Response body:', parsedBody);
                } catch (e) {
                  console.error('Raw response body:', responseBody);
                }
              });
            }
          });
          
          // 에러 처리
          proxy.on('error', (err, req, res) => {
            console.error(`Proxy error: ${err.message}`);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        }
      }
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
