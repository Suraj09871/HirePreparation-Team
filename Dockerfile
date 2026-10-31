# HirePrep Production Container with Multi-Language Judge Support
FROM node:18-bullseye

# Install OpenJDK 17 (javac, java), G++ (g++), Python 3, and build utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jdk \
    g++ \
    python3 \
    python-is-python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Verify compilers in build logs
RUN javac -version && java -version && g++ --version && python --version && node --version

# Set application directory
WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install --production

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy application files
COPY . .

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
