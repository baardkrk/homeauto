# Raspberry PI config


Installed ubuntu-server, set static IP and changed `/etc/resolv.conf` to the router address to resolve names.
Updated system by `sudo apt-get update && sudo apt-get upgrade`. 
Installed python3.9 (`sudo apt-add-repository ppa:deadsnakes/ppa && sudo apt-get update && sudo apt-get install python3.9 python3.9-venv`)

## Fixing GPIO pins
add the `/dev/gpiomem` file to the `dialout` group, and adding `rw` permissions:
```bash
sudo chgrp dialout /dev/gpiomem
sudo chmod g+rw /dev/gpiomem
```
creating the `i2c` group:
```bash
sudo groupadd i2c
sudo usermod -aG i2c ubuntu
sudo chgrp i2c /dev/i2c-1
sudo chmod g+rw /dev/i2c-1
```
Installing libs/tools
```bash
sudo apt-get install i2c-tools libi2c-dev python3-smbus
sudo reboot
i2cdetect -y 1
```

## Checking stuff

```bash
cat /etc/group  # Check the group file to see who is in a group
ls -l /dev | grep <device>  # Check permissions for a device (and user/group that has access to it)
find / -group <mygroup> 2>/dev/null  # Check which files a group has access to
# pro tip: 2>/dev/null redirects error output (such as "permission denied") to /dev/null so it isn't printed
```

## HomeAssistant
https://www.home-assistant.io/installation/raspberrypi

Installing python
```bash
sudo apt-get install python3.9-dev python3.9-venv python3-pip python3.9
```
Installing other dependencies
```bash
sudo apt-get install libffi-dev libssl-dev libjpeg-dev zlib1g-dev autoconf build-essential libopenjp2-7 libtiff5 libturbojpeg tzdata
```
Create homeassistant system user
```bash
sudo useradd -rm homeassistant -G dialout,i2c  # (+gpio group?)
sudo mkdir /srv/homeassistant
sudo chown homeassistant:homeassistant /srv/homeassistant
sudo -u homeassistant -H -s
```

As `homeassistant` user
```bash
cd /srv/homeassistant
python3.9 -m venv .
source bin/activate
python3 --version
python3 -m pip install wheel
python3 -m pip install --upgrade pip
python3 -m pip install homeassistant
```

Starting Homeassistant
```bash
sudo -u homeassistant -H -s
cd /srv/homeassistant
source bin/activate
hass
```

## Setting up RaspBee II
https://phoscon.de/en/raspbee2/install
https://www.home-assistant.io/integrations/deconz#light
https://hackernoon.com/how-to-transform-a-raspberrypi-into-a-universal-zigbee-and-z-wave-bridge-xy1ay3ymz
https://mindcomponents.com/home-assistant-zigbee2mqtt-setup-with-raspbee-ii-on-raspberrypi/
https://flemmingss.com/how-to-set-up-zigbee2mqtt-on-a-raspberry-pi-and-integrate-it-with-home-assistant/


## Homeassistant as a Service (HaaaS)
place the [`homeassistant.service`](homeassistant.service) file into `/etc/systemd/system`.
Running the service is as simple as:
```bash
sudo systemctl enable homeassistant.service  # Enable service on every reboot
sudo systemctl daemon-reload  # Reload to include new service
sudo systemctl start homeassistant.service
sudo systemctl stop homeassistant.service
sudo systemctl status homeassistant.service
```
