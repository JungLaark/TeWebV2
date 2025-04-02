#!/bin/bash
echo "Setting up Node.js environment variables..."
echo 'export PATH=/esl/TeWeb/node-v18.20.8/bin/:$PATH' >> ~/.bashrc
source ~/.bashrc
echo "Node.js environment variables set."
echo "Updating permissions for Node.js binaries..."
chmod +x /esl/TeWeb/node-v18.20.8/bin/node
chmod +x /esl/TeWeb/node-v18.20.8/bin/npm
echo "Permissions updated."
echo "Copying libatomic.so.1.2.0 to /usr/lib/..."
cp /esl/TeWeb/libatomic.so.1.2.0 /usr/lib/libatomic.so.1.2.0
echo "Creating symbolic link for libatomic.so.1..."
ln -sf /usr/lib/libatomic.so.1.2.0 /usr/lib/libatomic.so.1
echo "Refreshing library cache..."
ldconfig
echo "Library setup complete."
echo "Server setup completed successfully!"