# ──────────────────────────────────────────────────────────
#  Frontend Dockerfile — expects a pre-built React build folder
#
#  USAGE:
#    1. Build React first:  npm install && npm run build
#    2. Then build image:   docker build -t realestate-frontend:1.0 .
#
#  The build/ folder must already exist before running docker build.
#  Docker does NOT run npm here.
# ──────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx reverse-proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the pre-built React static files from your local build/ folder
COPY build/ /usr/share/nginx/html

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
