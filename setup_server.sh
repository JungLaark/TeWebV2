#!/bin/bash

# 1. Node.js 환경 변수 설정
echo "Setting up Node.js environment variables..."
echo 'export PATH=/esl/TeWeb/node-v18.20.8/bin/:$PATH' >> ~/.bashrc
source ~/.bashrc
echo "Node.js environment variables set."

# 실행 권한 변경
echo "Updating permissions for Node.js binaries..."
chmod +x /esl/TeWeb/node-v18.20.8/bin/node
chmod +x /esl/TeWeb/node-v18.20.8/bin/npm
echo "Permissions updated."

# 2. libatomic.so.1 에러 해결
echo "Copying libatomic.so.1.2.0 to /usr/lib/..."
cp /esl/TeWeb/libatomic.so.1.2.0 /usr/lib/libatomic.so.1.2.0

echo "Creating symbolic link for libatomic.so.1..."
ln -sf /usr/lib/libatomic.so.1.2.0 /usr/lib/libatomic.so.1

echo "Refreshing library cache..."
ldconfig
echo "Library setup complete."

echo "Server setup completed successfully!"