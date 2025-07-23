# 🚀 GCP VM Deployment Guide

This guide covers deploying the Restaurant Menu application to Google Cloud Platform using a Virtual Machine approach.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Cost Estimation](#cost-estimation)
- [VM Setup](#vm-setup)
- [Application Deployment](#application-deployment)
- [Security Configuration](#security-configuration)
- [Domain & SSL Setup](#domain--ssl-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and configured
- Docker and Docker Compose knowledge
- A domain name (optional, but recommended for production)
- GCP Project with billing enabled

### GCP Services Required
- Compute Engine API
- Cloud Storage (for image uploads)
- Cloud DNS (if using custom domain)

### Local Setup
```bash
# Verify gcloud is installed and authenticated
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable compute.googleapis.com
```

## 💰 Cost Estimation

### Monthly Costs (USD)
| Resource | Specifications | Estimated Cost |
|----------|---------------|----------------|
| VM Instance | e2-medium (2 vCPU, 4GB RAM) | $24-35 |
| Persistent Disk | 20GB SSD | $3-4 |
| External IP | Static IP address | $3 |
| Network Egress | ~100GB | $12 |
| **Total** | | **~$42-54/month** |

> **Note**: Costs vary by region. Use [GCP Pricing Calculator](https://cloud.google.com/products/calculator) for accurate estimates.

## 🖥️ VM Setup

### Step 1: Create VM Instance

```bash
# Create the VM instance
gcloud compute instances create restaurant-menu-vm \
  --zone=asia-south1-c \
  --machine-type=e2-medium \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-ssd \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server,https-server,restaurant-app \
  --metadata-from-file startup-script=startup-script.sh
```

### Step 2: Configure Firewall Rules

```bash
# Allow HTTP, HTTPS, and application ports
gcloud compute firewall-rules create restaurant-app-ports \
  --allow tcp:80,tcp:443,tcp:3000,tcp:8000,tcp:4000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags restaurant-app \
  --description "Allow access to restaurant app ports"

# Optional: Restrict SSH access to your IP
gcloud compute firewall-rules create restaurant-ssh-restricted \
  --allow tcp:22 \
  --source-ranges YOUR_IP_ADDRESS/32 \
  --target-tags restaurant-app \
  --description "Restricted SSH access"
```

### Step 3: Reserve Static IP (Optional)

```bash
# Reserve a static external IP
gcloud compute addresses create restaurant-menu-ip \
  --region=us-central1

# Get the reserved IP
gcloud compute addresses describe restaurant-menu-ip \
  --region=us-central1 --format="value(address)"

# Assign to VM
gcloud compute instances add-access-config restaurant-menu-vm \
  --zone=asia-south1-c \
  --access-config-name="external-nat" \
  --address=RESERVED_IP_ADDRESS
```

## 🐳 Application Deployment

### Step 1: Connect to VM

```bash
# SSH into the VM
gcloud compute ssh restaurant-menu-vm --zone=asia-south1-c
```

### Step 2: Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install additional tools
sudo apt install -y git nginx certbot python3-certbot-nginx

# Logout and reconnect for group changes
exit
gcloud compute ssh restaurant-menu-vm --zone=asia-south1-c
```

### Step 3: Clone and Setup Project

```bash
# Clone the repository (replace with your repo URL)
git clone https://github.com/yourusername/restaurant-menu.git
cd restaurant-menu

# Or upload from local machine:
# From your local machine, run:
# gcloud compute scp --recurse /path/to/restaurant-menu restaurant-menu-vm:~/ --zone=asia-south1-c
```

### Step 4: Configure Environment

```bash
# Create secrets directory
mkdir -p secrets

# Generate strong passwords
openssl rand -base64 32 > secrets/db_password.txt
openssl rand -base64 32 > secrets/redis_password.txt

# Create GCP Service Account and download key
# (Do this in GCP Console, then upload the JSON file)
# Upload service account key:
# gcloud compute scp gcp-service-account.json restaurant-menu-vm:~/restaurant-menu/secrets/ --zone=asia-south1-c
```

### Step 5: Configure Production Environment

```bash
# Update backend production environment
cp backend/.env.prod backend/.env

# Get VM's external IP
VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
echo "VM External IP: $VM_IP"

# Update docker-compose.prod.yml with your domain or IP
sed -i "s/yourdomain.com/$VM_IP/g" docker-compose.prod.yml
sed -i "s/https:/http:/g" docker-compose.prod.yml  # Use HTTP initially, HTTPS after SSL setup
```

### Step 6: Deploy Application

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check if all services are running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 7: Verify Deployment

```bash
# Test each service
curl http://localhost:8000/health  # Backend health check
curl http://localhost:3000         # Frontend
curl http://localhost:4000         # Admin panel

# Test external access (from your local machine)
curl http://$VM_IP:8000/health
curl http://$VM_IP:3000
curl http://$VM_IP:4000
```

## 🔒 Security Configuration

### Step 1: Setup Docker Secrets

```bash
# Verify secrets are created and secure
ls -la secrets/
chmod 600 secrets/*
sudo chown root:root secrets/*
```

### Step 2: Configure nginx Security (Optional)

```bash
# If not using the nginx container, configure system nginx
sudo nano /etc/nginx/sites-available/restaurant-menu

# Add the following configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/restaurant-menu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Setup Fail2Ban (Optional)

```bash
# Install fail2ban for SSH protection
sudo apt install -y fail2ban

# Configure fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🌐 Domain & SSL Setup

### Step 1: Configure DNS

1. In your domain registrar, create an A record:
   - **Name**: `@` (or your subdomain)
   - **Type**: `A`
   - **Value**: `YOUR_VM_EXTERNAL_IP`
   - **TTL**: `300`

2. For www subdomain:
   - **Name**: `www`
   - **Type**: `A`
   - **Value**: `YOUR_VM_EXTERNAL_IP`

### Step 2: Setup SSL with Let's Encrypt

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Start nginx
sudo systemctl start nginx

# Setup auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 3: Update Application for HTTPS

```bash
# Update docker-compose with HTTPS URLs
sed -i "s/http:/https:/g" docker-compose.prod.yml
sed -i "s/your-domain.com/ACTUAL_DOMAIN.com/g" docker-compose.prod.yml

# Restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Create a health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "=== Health Check $(date) ==="

# Check Docker services
echo "Docker Services:"
docker-compose -f docker-compose.prod.yml ps

# Check service health
echo -e "\nService Health:"
curl -s http://localhost:8000/health && echo " ✓ Backend OK" || echo " ✗ Backend FAIL"
curl -s http://localhost:3000 > /dev/null && echo " ✓ Frontend OK" || echo " ✗ Frontend FAIL"
curl -s http://localhost:4000 > /dev/null && echo " ✓ Admin OK" || echo " ✗ Admin FAIL"

# Check disk space
echo -e "\nDisk Usage:"
df -h /

# Check memory
echo -e "\nMemory Usage:"
free -h

echo "=========================="
EOF

chmod +x health-check.sh
```

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres restaurant > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploaded files
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /home/$USER/restaurant-menu/backup.sh
```

### Log Monitoring

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# View system logs
sudo journalctl -u docker -f

# Check nginx logs (if using system nginx)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Updates and Maintenance

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker
docker system prune -a
```

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d restaurant -c "SELECT 1;"
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check nginx configuration
sudo nginx -t
```

#### High Memory Usage
```bash
# Check container resource usage
docker stats

# Restart services if needed
docker-compose -f docker-compose.prod.yml restart
```

### Performance Optimization

```bash
# Enable swap (if not already enabled)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize Docker
echo '{"log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"}}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

## 📞 Support

### Useful Commands

```bash
# Full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# View all logs
docker-compose -f docker-compose.prod.yml logs

# Access container shell
docker-compose -f docker-compose.prod.yml exec backend sh
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres restaurant
```

### Contact Information
- **Project Repository**: [GitHub Repository URL]
- **Documentation**: [Documentation URL]
- **Issues**: [GitHub Issues URL]

---

**🎉 Congratulations!** Your Restaurant Menu application should now be running successfully on GCP VM.

Access your application at:
- **Frontend**: `https://yourdomain.com` or `http://VM_IP:3000`
- **Admin Panel**: `https://yourdomain.com/admin` or `http://VM_IP:4000`
- **API**: `https://yourdomain.com/api` or `http://VM_IP:8000`
- **API Documentation**: `https://yourdomain.com/api/swagger/index.html`