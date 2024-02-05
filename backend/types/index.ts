export type TParkingSlot = {
  distance: number;
  size: number;
  occupied: boolean;
}

export type TParkedVehicle = {
  entryTime: Date;
  slot: any;
  type: string;
  plateNumber: string;
  vehicleId: string;
}