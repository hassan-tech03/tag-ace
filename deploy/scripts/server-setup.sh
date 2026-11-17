#!/usr/bin/env bash
# One-time bootstrap for a fresh Contabo VPS (Ubuntu 22.04 / 24.04).
#
# Run as root:
#   curl -fsSL https://raw.githubusercontent.com/<you>/<repo>/main/deploy/scripts/server-setup.sh -o setup.sh
#   sudo bash setup.sh
#
# What it does:
#   - system updates + automatic security updates
#   - swap file (Next.js builds need memory headroom)
#   - Docker Engine + Compose plugin (official Docker apt repo)
#   - a non-root "deploy" user in the docker group, with root's SSH keys
#   - firewall (UFW): only SSH, HTTP, HTTPS open
#   - fail2ban for SSH brute-force protection
#
# Options (environment variables):
#   DEPLOY_USER=deploy        name of the deploy user
#   SWAP_SIZE=4G              swap file size (skipped if swap already exists)
#   TIMEZONE=Asia/Karachi
#   HARDEN_SSH=0              1 = disable root login + password auth.
#                             Only do this after confirming key login works
#                             for $DEPLOY_USER, or you will lock yourself out.
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
SWAP_SIZE="${SWAP_SIZE:-4G}"
TIMEZONE="${TIMEZONE:-Asia/Karachi}"
HARDEN_SSH="${HARDEN_SSH:-0}"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root (sudo bash $0)" >&2
  exit 1
fi

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }

log "Updating system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg git ufw fail2ban unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

log "Timezone: $TIMEZONE"
timedatectl set-timezone "$TIMEZONE" || true

if ! swapon --show | grep -q .; then
  log "Creating ${SWAP_SIZE} swap file"
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
else
  log "Swap already configured, skipping"
fi

if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  log "Docker already installed: $(docker --version)"
fi
systemctl enable --now docker

log "Docker log rotation"
mkdir -p /etc/docker
if [[ ! -f /etc/docker/daemon.json ]]; then
  cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "5" }
}
JSON
  systemctl restart docker
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  log "Creating user $DEPLOY_USER"
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG docker "$DEPLOY_USER"
if [[ -f /root/.ssh/authorized_keys ]]; then
  install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

log "App directory /opt/mushk"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" /opt/mushk

log "Firewall (SSH, HTTP, HTTPS)"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

log "fail2ban"
systemctl enable --now fail2ban

if [[ "$HARDEN_SSH" == "1" ]]; then
  log "Hardening SSH (no root login, keys only)"
  cat > /etc/ssh/sshd_config.d/99-mushk.conf <<'CONF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
CONF
  systemctl reload ssh || systemctl reload sshd
fi

log "Done"
cat <<EOF

Next steps (as $DEPLOY_USER):
  ssh $DEPLOY_USER@<server-ip>
  git clone https://github.com/<you>/<repo>.git /opt/mushk
  cd /opt/mushk && cp .env.example .env && nano .env
  ./deploy/scripts/deploy.sh

Note: Docker publishes ports 80/443 itself; UFW rules don't filter
container ports, which is why Postgres is bound to 127.0.0.1 only.
EOF
