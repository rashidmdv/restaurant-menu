#!/bin/bash

# Startup script for GCP VM instance
# This script runs when the VM first boots up

set -e

# Log all output
exec > >(tee -a /var/log/startup-script.log)
exec 2>&1

echo "Starting restaurant-menu VM setup at $(date)"

# Update system packages
apt-get update
apt-get upgrade -y

# Install essential packages
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add default user to docker group
usermod -aG docker $(logname 2>/dev/null || echo $SUDO_USER)

# Install nginx (for reverse proxy option)
apt-get install -y nginx

# Install certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# Install fail2ban for security
apt-get install -y fail2ban

# Configure firewall
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 4000/tcp
ufw allow 8000/tcp

# Create application directory
mkdir -p /opt/restaurant-menu
chown $(logname 2>/dev/null || echo $SUDO_USER):$(logname 2>/dev/null || echo $SUDO_USER) /opt/restaurant-menu

# Enable and start services
systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl start nginx
systemctl enable fail2ban
systemctl start fail2ban

# Configure log rotation for Docker
cat > /etc/logrotate.d/docker << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

echo "VM setup completed at $(date)"
echo "Next steps:"
echo "1. SSH into the VM: gcloud compute ssh restaurant-menu-vm --zone=us-central1-a"
echo "2. Clone your repository or upload your code"
echo "3. Follow the deployment guide in DEPLOYMENT.md"