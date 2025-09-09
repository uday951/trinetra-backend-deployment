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
exports.LocationTracker = void 0;
class LocationTracker {
    constructor() {
        this.lastLocation = {
            latitude: null,
            longitude: null,
            accuracy: null,
            timestamp: new Date().toISOString()
        };
    }
    getCurrentLocation() {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock location data
            this.lastLocation = {
                latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
                longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
                accuracy: Math.random() * 100,
                timestamp: new Date().toISOString()
            };
            return this.lastLocation;
        });
    }
    getLastKnownLocation() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.lastLocation;
        });
    }
}
exports.LocationTracker = LocationTracker;
