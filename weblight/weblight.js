var webusb = {};

(function() {
  'use strict';

  webusb.getPorts = function() {
    return navigator.usb.getDevices().then(devices => {
      return devices.map(device => new webusb.Device(device));
    });
  };

  webusb.Device = function(device) {
    this.device_ = device;
  };

  webusb.Device.prototype.controlTransferOut = function(setup, data) {
    return this.device_.controlTransferOut({
      'requestType': 'vendor',
      'recipient': 'device',
      'request': 0x01,
      'value': 0x00,
      'index': 0x00}, data);
  };

  webusb.Device.prototype.connect = function() {
    let readLoop = () => {
      this.device_.transferIn(2, 64).then(result => {
        this.onReceive(result.data);
        readLoop();
      }, error => {
        this.onReceiveError(error);
      });
    };

    return this.device_.open()
        .then(() => this.device_.getConfiguration()
            .then(config => {
              if (config.configurationValue == 1) {
                return Promise.resolve();
              } else {
                return Promise.reject("Need to setConfiguration(1).");
              }
            })
            .catch(error => this.device_.setConfiguration(1)))
        .then(() => this.device_.claimInterface(0))
        .then(() => this.device_.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x01,
            'index': 0x00}))
        .then(() => {
          readLoop();
        });
  };

  webusb.Device.prototype.disconnect = function() {
    return this.device_.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x00,
            'index': 0x00})
        .then(() => this.device_.close());
  };

  webusb.Device.prototype.send = function(data) {
    return this.device_.transferOut(1, data);
  };
})();

function start() {
  console.log("I am here");
  webusb.getDevices().then(devices => {
    if (devices.length == 0) {
      statusDisplay.textContent = "No device found.";
    } else {
      device = devices[0];

      let rgb = new Uint8Array(3);
      rgb[0] = 0x80;
      rgb[1] = 0x00;
      rgb[2] = 0x00;
      device.controlTransferOut({}, rgb);
  });
}

document.addEventListener('DOMContentLoaded', start, false);
