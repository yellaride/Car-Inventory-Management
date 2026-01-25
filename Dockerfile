FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "start:dev"]
