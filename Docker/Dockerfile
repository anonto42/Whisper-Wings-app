
# 1. Base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies (including dev dependencies for build)
RUN npm install --include=dev

# 5. Remove the conflicting 'tsc' package and reinstall TypeScript properly
RUN npm uninstall tsc && npm install typescript@latest --save-dev

# 6. Copy source code
COPY . .

# 7. Build the TypeScript code using npx to ensure correct compiler
RUN npx tsc

# 8. Expose desired port
EXPOSE ${PORT}

# 9. Run the server
CMD ["npm", "start"]