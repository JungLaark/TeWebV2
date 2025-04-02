#!/bin/bash

# filepath: c:\Users\user\Downloads\project-bolt-sb1-cadjqwrx\project\setup_server.sh

# CRLF -> LF 변환
sed -i 's/\r$//' /esl/TeWeb/dist/setup_server.sh

# Node.js 환경변수 설정 확인
if ! grep -q "/esl/TeWeb/node-v18.20.8/bin/" ~/.bashrc; then
  echo "Setting up Node.js environment variables..."
  echo 'export PATH=/esl/TeWeb/node-v18.20.8/bin/:$PATH' >> ~/.bashrc
  source ~/.bashrc
  echo "Node.js environment variables set."
else
  echo "Node.js environment variables already set."
fi

# Node.js 실행 파일 권한 확인 및 설정
if [ ! -x "/esl/TeWeb/node-v18.20.8/bin/node" ]; then
  echo "Updating permissions for Node.js binaries..."
  chmod +x /esl/TeWeb/node-v18.20.8/bin/node
  chmod +x /esl/TeWeb/node-v18.20.8/bin/npm
  echo "Permissions updated."
else
  echo "Node.js binaries already have execute permissions."
fi

# 라이브러리 파일 복사 및 링크 확인
if [ ! -L "/usr/lib/libatomic.so.1" ]; then
  echo "Copying libatomic.so.1.2.0 to /usr/lib/..."
  cp /esl/TeWeb/libatomic.so.1.2.0 /usr/lib/libatomic.so.1.2.0
  echo "Creating symbolic link for libatomic.so.1..."
  ln -sf /usr/lib/libatomic.so.1.2.0 /usr/lib/libatomic.so.1
  echo "Refreshing library cache..."
  ldconfig
  echo "Library setup complete."
else
  echo "Library file and symbolic link already exist."
fi

# Node.js 서버 실행 확인 및 재시작
echo "Checking for existing Node.js server process..."
NODE_PID=$(pgrep -f "node server.js")
if [ -n "$NODE_PID" ]; then
  echo "Node.js server is running with PID $NODE_PID. Killing process..."
  kill -9 "$NODE_PID"
  echo "Node.js server process killed."
fi

echo "Starting Node.js server..."
cd /esl/TeWeb
nohup node server.js > server.log 2>&1 &
echo "Node.js server started successfully!"