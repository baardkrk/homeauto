# Raspberry PI config

Installing Ubuntu 21.10 because GPIO support was pushed to this release. Not touching dhcp options. 

~Installed ubuntu-server, set static IP and changed `/etc/resolv.conf` to the router address to resolve names.~

Updated system by `sudo apt-get update && sudo apt-get upgrade`. 
Installed python3.9 (`sudo apt-add-repository ppa:deadsnakes/ppa && sudo apt-get update && sudo apt-get install python3.9 python3.9-venv`)

## ~Fixing GPIO pins~
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

## Zigbee hat
Downloaded [raspbee2 repository](https://phoscon.de/en/raspbee2/install), and installed it, following instructions.


Adding raspberry pi linux headers, and other dependencies
```
curl http://archive.raspberrypi.org/debian/raspberrypi.gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install raspberrypi-kernel-headers fake-hwclock raspi-config
```
After installing the RTC module from the repository, I install the [deCONZ](https://phoscon.de/en/raspbee2/install) software




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

# Rapsberry OS

Installed raspberry OS, via rpi-imager. Remember to `touch ssh` in `/boot/`.
Configured static IP in `/etc/dhcpcd.conf`. 
GPIO support through `/boot/config.txt` with 
```bash
enable_uart=1
dtoverlay=pi3-miniuart-bt
```
Check that the following is true (chown or add groups if not):
```bash
$ ls -l /dev | grep ttyAMA
lrwxrwxrwx 1 root root           7 Aug  7 05:58 serial0 -> ttyAMA0
crw-rw---- 1 root dialout 204,  64 Jan 31 16:50 ttyAMA0
```

## Install RTC/deconz
Followed the [guide](https://phoscon.de/en/raspbee2). 
```bash
sudo apt update
sudo apt install i2c-tools build-essential raspberrypi-kernel-headers git
# Get the software and install
git clone https://github.com/dresden-elektronik/raspbee2-rtc.git
cd raspbee2-rtc
make
sudo make install
# Check everything is working
sudo reboot
sudo hwclock --systoch
sudo hwclock --verbose
```

## Install Zigbee stuff
First, the mosquitto broker is necessary
```bash
sudo apt-get install mosquitto mosquitto-clients tmux
sudo systemctl enable mosquitto
# Check that they are working
tmux
# C-b % to split into two panes
mosquitto_sub -h localhost -t "myuptopic"  # In pane 1 (C-b <rightarrow> to switch pane)
mosquitto_pub -h localhost -m "Hello World" -t "myuptopic" # In pane 2
# C-c to quit
```

Install [zigbee2mqtt](https://github.com/Koenkk/zigbee2mqtt) as described in getting started.
When the system-service is up, it can be accessed through the web-gui
config file:
```yaml
homeassistant: true
permit_join: false
mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://localhost
  keepalive: 60
  reject_unauthorized: true
  version: 4
serial:
  port: /dev/serial0
  adapter: deconz
frontend:
  port: 8088
  host: 192.168.1.42
advanced:
  log_level: debug
  network_key: GENERATE
availability: true
devices:
  '0x001788010b725aba':
    friendly_name: philips_dimmer
  '0x001788010b98a57b':
    friendly_name: blob_light
external_converters:
  - hue_wha.js
```

Also configured `hue_wha.js` in `/opt/zigbee2mqtt/data/`
```js
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;

const definition = {
    zigbeeModel: ['929003054101'],
    model: '9290024898',
    vendor: 'Philips',
    description: 'Philips Hue White Ambiance',
    // fromZigbee: [], // We will add this later
    // toZigbee: [], // Should be empty, unless device can be controlled (e.g. lights, switches).
    // exposes: [e.battery(), e.temperature(), e.humidity()], // Defines what this device exposes, used for e.g. Home Assistant discovery and in the frontend
    extend: extend.light_onoff_brightness_colortemp(),
};

module.exports = definition;
```
Should at this stage be able to find zigbee devices in the hosted GUI.

After this, install the [homeassistant](https://www.home-assistant.io/installation/raspberrypi) and add the MQTT integration, which should be configured with localhost at the default port.

(Also had to install Philips HUE BT app to factory reset lightbulb....)
