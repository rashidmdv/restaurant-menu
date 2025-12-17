sudo nano /etc/nginx/sites-available/restaurant-menu

  Replace with:

  server {
      listen 80;
      server_name 35.244.24.80;

      client_max_body_size 50M;

      # Security headers
      add_header X-Frame-Options DENY;
      add_header X-Content-Type-Options nosniff;
      add_header X-XSS-Protection "1; mode=block";
      add_header Referrer-Policy "strict-origin-when-cross-origin";

      # Frontend
      location / {
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }

      # API
      location /api/ {
          proxy_pass http://localhost:8000/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }

      # Admin
      location /admin/ {
          proxy_pass http://localhost:4000/;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }

  Then:

  # Remove default site (showing nginx welcome page)
  sudo rm /etc/nginx/sites-enabled/default

  # Test config
  sudo nginx -t

  # Start nginx
  sudo systemctl start nginx
  sudo systemctl enable nginx

  # Start docker containers
  docker-compose -f docker-compose.prod.yml up -d --build