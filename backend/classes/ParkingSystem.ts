import { TParkedVehicle, TParkingSlot } from "../types";

class ParkingSystem {
  entryPoints: number;
  distances: number[][];
  sizes: number[];
  parkingSlots: TParkingSlot[];
  parkedVehicles: { [key: string]: TParkedVehicle };

  // Constants
  MINIMUM_CHARGE: number = 40;

  HOURLY_RATE: { [key: number]: number } = {
    0: 20,
    1: 60,
    2: 100,
  };

  constructor(entryPoints: number, distances: number[][], sizes: number[]) {
    this.entryPoints = entryPoints;
    this.distances = distances;
    this.sizes = sizes;
    this.parkingSlots = this.initializeParkingSlots();
    this.parkedVehicles = {};
  }

  initializeParkingSlots(): TParkingSlot[] {
    const parkingSlots: TParkingSlot[] = [];

    for (const element of this.distances) {
      for (let j = 0; j < element.length; j++) {
        const size = this.sizes[j];
        parkingSlots.push({
          distance: element[j],
          size: size,
          occupied: false,
        });
      }
    }

    return parkingSlots;
  }

  parkVehicle(vehicleType: string, plateNumber: string): string {
    if (!this.isValidVehicleType(vehicleType)) {
      return `Invalid vehicle type: ${vehicleType}`;
    }

    const isAlreadyParked = Object.values(this.parkedVehicles).some(
      (vehicle) => vehicle.plateNumber === plateNumber
    );

    if (isAlreadyParked) {
      return `Vehicle with plate number ${plateNumber} is already parked.`;
    }

    const parkedVehicle = this.findParkedVehicleByPlateNumber(plateNumber);
    if (parkedVehicle) {
      const elapsedTime = this.calculateElapsedTime(parkedVehicle.entryTime);
      
      if (elapsedTime <= 1) {
        return `Vehicle with plate number ${plateNumber} left and returned within one hour. Continuous rate applied.`;
      }
  
      const totalCharge = this.calculateTotalCharge(parkedVehicle.slot.size, elapsedTime);
      delete this.parkedVehicles[parkedVehicle.vehicleId];
      parkedVehicle.slot.occupied = false;
  
      return `Vehicle with plate number ${plateNumber} unparked. Total charge: ${totalCharge} pesos.`;
    }

    const availableSlots = this.getAvailableSlots(vehicleType);

    if (availableSlots.length === 0) {
      return "No available slots for this vehicle type.";
    }

    const closestSlot = this.findClosestSlot(availableSlots);
    closestSlot.occupied = true;

    const vehicleId = this.generateVehicleId();
    this.parkedVehicles[vehicleId] = {
      entryTime: new Date(),
      slot: closestSlot,
      type: vehicleType,
      plateNumber,
      vehicleId,
    };

    return `Vehicle parked in (${this.getSizeAbbreviation(vehicleType)}) slot with distance ${closestSlot.distance}. Vehicle ID: ${vehicleId}`;
  }

  
  isValidVehicleType(vehicleType: string): boolean {
    const lowercaseType = vehicleType.toLowerCase();
    return ["s", "m", "l"].includes(lowercaseType);
  }

  findParkedVehicleByPlateNumber(plateNumber: string): TParkedVehicle | null {
    for (const vehicleId in this.parkedVehicles) {
      if (this.parkedVehicles[vehicleId].plateNumber === plateNumber) {
        return { ...this.parkedVehicles[vehicleId], vehicleId };
      }
    }
    return null;
  }

  calculateElapsedTime(entryTime: Date): number {
    const currentTime = new Date();
    const elapsedTime = Math.ceil((currentTime.getTime() - entryTime.getTime()) / (1000 * 60));
    return elapsedTime;
  }

  calculateTotalCharge(slotSize: number, elapsedTime: number): number {
    const hourlyRate = this.getHourlyRateBySlotSize(slotSize);

    const exceedingHourlyRate = hourlyRate;
    const fullDayCharge = 5000;

    const fullDays = Math.floor(elapsedTime / 24);
    const remainingHours = elapsedTime % 24;

    let totalCharge = fullDays * fullDayCharge;

    totalCharge += Math.max(0, Math.ceil(remainingHours - 3)) * exceedingHourlyRate;

    return Math.max(this.MINIMUM_CHARGE, totalCharge);
  }

  getHourlyRateBySlotSize(slotSize: number): number {
    return this.HOURLY_RATE[slotSize];
  }

  getAvailableSlots(vehicleType: string): TParkingSlot[] {
    return this.parkingSlots
      .filter((slot) => !slot.occupied && this.isSlotCompatible(slot.size, vehicleType))
      .sort((a, b) => {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
  
        return a.size - b.size;
      });
  }

  isSlotCompatible(slotSize: number, vehicleType: string): boolean {
    const lowercaseType = vehicleType.toLowerCase();
  
    switch (lowercaseType) {
      case "s":
        return true;
      case "m":
        return slotSize === 1 || slotSize === 2;
      case "l":
        return slotSize === 2;
      default:
        return false;
    }
  }

  findClosestSlot(slots: TParkingSlot[]): TParkingSlot {
    return slots.reduce((prev, curr) => (curr.distance < prev.distance ? curr : prev));
  }

  getSizeAbbreviation(vehicleType: string): string {
    const lowercaseType = vehicleType.toLowerCase();
  
    switch (lowercaseType) {
      case "s":
        return "SP";
      case "m":
        return "MP";
      case "l":
        return "LP";
      default:
        return "";
    }
  }

  generateVehicleId(): string {
    return Math.random().toString(36).slice(2, 11);
  }

  getAllParkedVehicles(): TParkedVehicle[] {
    return Object.values(this.parkedVehicles);
  }

  unparkVehicle(plateNumber: string): string {
    const vehicle = this.findParkedVehicleByPlateNumber(plateNumber);

    if (!vehicle) {
      return `No vehicle with plate number ${plateNumber} is currently parked.`;
    }

    const elapsedTime = this.calculateElapsedTime(vehicle.entryTime);
    let totalCharge = this.calculateTotalCharge(vehicle.slot.size, elapsedTime);

    delete this.parkedVehicles[vehicle.vehicleId];
    vehicle.slot.occupied = false;

    return `Vehicle with plate number ${plateNumber} unparked. Total charge: ${totalCharge} pesos.`;
  }

}

export default ParkingSystem;
