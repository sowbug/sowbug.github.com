var webusb = {};

(function() {
  'use strict';

  webusb.getDevices = function() {
    return navigator.usb.getDevices().then(devices => {
      console.log(devices);
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

})();

function start() {
  console.log("start");
  webusb.getDevices().then(devices => {
    'use strict';

    if (devices.length == 0) {
      console.log("no device found");
    } else {
      device = devices[0];

      let rgb = new Uint8Array(3);

      // red
      rgb[0] = 0x80;
      rgb[1] = 0x00;
      rgb[2] = 0x00;
      device.controlTransferOut({}, rgb);
    }
  });
}

document.addEventListener('DOMContentLoaded', start, false);
