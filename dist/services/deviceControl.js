"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceControl = void 0;
class DeviceControl {
    lockDevice(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock device locking
            console.log('Device locked with PIN:', pin);
        });
    }
    wipeDevice(confirmationCode) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock device wiping
            console.log('Device wiped with confirmation code:', confirmationCode);
        });
    }
    playSound() {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock sound playing
            console.log('Playing sound...');
        });
    }
}
exports.DeviceControl = DeviceControl;
