import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataFetchService } from '../data-fetch.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',   
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  sensors: any[] = [];
  locations: any[] = [];

  constructor(private router: Router, private dataFetchService: DataFetchService) { }

  ngOnInit(): void {
    this.dataFetchService.getRooms().subscribe(
      (rooms: any[]) => {
        this.locations = rooms;
        this.fetchSensorData();
      },
      (error: any) => {
        console.error('Failed to fetch room data:', error);
      }
    );
  }
  
  fetchSensorData(): void {
    this.dataFetchService.getSensors().subscribe(
      (sensors: any[]) => {
        this.sensors = sensors;
        this.locations.forEach((location) => {
          location.sensorCount = this.getSensorCount(location.name);
          location.sensorTypes = this.getSensorTypes(location.name);
        });
      },
      (error: any) => {
        console.error('Failed to fetch sensor data:', error);
      }
    );
  }
  
  getRoomName(roomId: number): string {
    if (roomId === undefined) {
      return 'Unknown Room';
    }
    switch (roomId) {
      case 1:
        return 'Room 1';
      case 2:
        return 'Room 2';
      case 3:
        return 'Room 3';
      default:
        return 'Unknown Room';
    }
  }
  
  

  viewSensors(room: string) {
    this.router.navigate(['/sensors', room]);
  }

  getRoomStatus(room: string): string {
    const roomSensors = this.sensors.filter(sensor => sensor.location === room);
    const activeSensors = roomSensors.filter(sensor => sensor.status === true).length;

    if (activeSensors === roomSensors.length) {
      return 'green';
    } else if (activeSensors === 0) {
      return 'red';
    } else {
      return 'orange';
    }
  }

  getSensorCount(room: string): number {
    return this.sensors.filter(sensor => sensor.room.name === room).length;
  }
  
  getSensorTypes(room: string): string {
    const sensorTypes = this.sensors
      .filter(sensor => sensor.room.name === room)
      .map(sensor => sensor.sensor_type);
    return sensorTypes.join(', ');
  }
  
}
