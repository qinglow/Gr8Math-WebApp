# --- STAGE 1: Builder ---
FROM node:22-alpine AS builder

WORKDIR /src

# 1. Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# 2. Copy the rest of your source code
COPY . .

# This grabs the variables from Render and injects them into the Next.js build
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY


# 3. BUILD the Next.js app for production (CRITICAL STEP)
RUN npm run build


# --- STAGE 2: Production ---
FROM node:22-alpine AS production

WORKDIR /src

# 4. Copy ONLY the necessary built files from the 'builder' stage
COPY --from=builder /src/.next ./.next
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/package.json ./package.json
COPY --from=builder /src/next.config.ts ./next.config.ts
# COPY --from=builder /src/public ./public

# 5. Start the production server
CMD ["npm", "start"]