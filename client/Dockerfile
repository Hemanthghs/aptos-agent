# Use Node.js 22 as the base image
FROM node:22-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the application files
COPY . .

# Build the Next.js app
RUN yarn run build

# Use a smaller base image for the final production container
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=base /app/package.json /app/yarn.lock ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "run", "start"]
