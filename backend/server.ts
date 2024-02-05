import express, { Response, Request, NextFunction} from 'express';
import bodyParser from 'body-parser';
import ParkingSystem from "./classes/ParkingSystem"

import { TParkedVehicle } from './types';

const app = express();
const port = 8080;

app.use(bodyParser.json());

const entryPoints = 3;
const distances = [[1, 2, 3], [1, 2, 3], [1, 2, 3]]
const sizes = [0, 1, 2];
const parkingSystem = new ParkingSystem(entryPoints, distances, sizes);

const checkRequiredParamsForPark = (req: Request, res: Response, next: NextFunction) => {
  const { plateNumber, vehicleType }:{ plateNumber: string, vehicleType: string } = req.body;
  if (!plateNumber || !vehicleType) {
    return res.status(400).json({ error: 'Both vehicleType and plateNumber are required for parking.' });
  }
  next();
};

const checkRequiredParamsForUnpark = (req: Request, res: Response, next: NextFunction) => {
  const { plateNumber }: { plateNumber: string } = req.body;
  if (!plateNumber) {
    return res.status(400).json({ error: 'plateNumber is required for unparking.' });
  }
  next();
};

app.post('/park', checkRequiredParamsForPark, (req: Request, res: Response) => {
  const { plateNumber, vehicleType }:{ plateNumber: string, vehicleType: string } = req.body;
  const result: string = parkingSystem.parkVehicle(vehicleType, plateNumber);
  res.json({ result });
});

app.post('/unpark', checkRequiredParamsForUnpark, (req: Request, res: Response) => {
  const { plateNumber }: { plateNumber: string } = req.body;
  const result: string = parkingSystem.unparkVehicle(plateNumber);
  res.json({ result });
});

app.get('/parked-vehicles', (req: Request, res: Response) => {
  const parkedVehicles: TParkedVehicle[] = parkingSystem.getAllParkedVehicles();
  res.json({ parkedVehicles });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
