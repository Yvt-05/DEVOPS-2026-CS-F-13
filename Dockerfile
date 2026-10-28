FROM nginx:alpine
LABEL maintainer="Yashvardhan Tiwari <shreekrishantiwari@gmail.com>"
LABEL project="Shivakriti Constructions Website"

# Copy production build artifacts
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
