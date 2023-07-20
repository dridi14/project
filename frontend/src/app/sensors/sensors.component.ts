import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataFetchService } from '../data-fetch.service';
import { take } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartScales } from 'chart.js';

interface Sensor {
  id: number;
  sensor_id: number | null;
  sensor_type: string;
  room: {
    id: number;
    name: string | null; // Change the type of name to string | null
  };
  data: number[];
  label: string[];
  status: boolean; // Add the status property
}

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {
  room: string | null = null; // Change the type of room to string | null
  sensors: Sensor[] = [];
  roomSensors: Sensor[] = [];
  environmentalSensors: Sensor[] = [];
  motionSensors: Sensor[] = [];
  soundSensors: Sensor[] = [];
  lightSensors: Sensor[] = [];
  hvacSensors: Sensor[] = [];
  otherSensors: Sensor[] = [];
  filteredSensors: Sensor[] = [];
  selectedCategory: string = 'all';
  values: number[] = [];
  labels: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataFetchService: DataFetchService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.room = params.get('room');
      this.fetchSensorData();
    });
    this.filteredSensors = this.roomSensors;

  }

  fetchSensorData() {
    this.dataFetchService.getSensors().pipe(take(1)).subscribe(response => {
      this.sensors = response;

      if (this.room) {
        this.roomSensors = this.sensors.filter(sensor => sensor.room.name === this.room);
      } else {
        this.roomSensors = this.sensors;
      }

      // Assign the categorized sensors to their respective properties
      this.filteredSensors = this.roomSensors;

      this.roomSensors.forEach((sensor, i) => {
        this.dataFetchService.getRoomSensorData(sensor.room.id, sensor.sensor_id, sensor.id)
          .pipe(take(1))
          .subscribe(dataResponse => {
            const datas = dataResponse;
            datas.reverse();
            const sensorValues: any = [];
            const sensorLabels: any = [];
            datas.forEach((data: any) => {
              Object.values(data.data).forEach((value: any) => {
                sensorValues.push(value);
              });
              sensorLabels.push(this.formatTime(data.tx_time_ms_epoch))
            });
            const canvas = document.getElementById(`chartCanvas${sensor.id}`) as HTMLCanvasElement;
            this.roomSensors[i].data = sensorValues;
            this.roomSensors[i]['label'] = sensorLabels;
            this.createChart(canvas, sensorValues, sensorLabels); // Pass the array values to createChart
            this.categorizeSensors();
            return
          }, error => {
            console.error(`Error retrieving data for Sensor ${sensor.id}:`, error);
          });
      });
    });
  }

  categorizeSensors() {
    // Categorize the sensors
    this.environmentalSensors = this.roomSensors.filter(sensor =>
      ['Temperature', 'CO2', 'Atmospheric Pressure', 'Humidity'].includes(sensor.sensor_type)
    );

    this.motionSensors = this.roomSensors.filter(sensor =>
      ['PassageMovement', 'Passage'].includes(sensor.sensor_type)
    );

    this.soundSensors = this.roomSensors.filter(sensor =>
      ['Sound'].includes(sensor.sensor_type)
    );

    this.lightSensors = this.roomSensors.filter(sensor =>
      ['Light'].includes(sensor.sensor_type)
    );

    this.hvacSensors = this.roomSensors.filter(sensor =>
      ['Vent', 'AC', 'Heater'].includes(sensor.sensor_type)
    );

    this.otherSensors = this.roomSensors.filter(sensor =>
      ['ADC', 'Voltage'].includes(sensor.sensor_type)
    );
  }

  formatTime(time: number): string {
    const date = new Date(time);
    return `${date.getHours()}:${date.getMinutes()}`;
  }

  createChart(canvas: HTMLCanvasElement, data: number[], label: string[]): void {
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if ((canvas as any).chart) {
          (canvas as any).chart.destroy(); // Destroy the previous chart instance
        }
        (canvas as any).chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: label,
            datasets: [
              {
                label: 'Sensor Data',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            } as ChartScales,
          },
        });
      }
    }
  }


  getRoomName(roomId: any): string {
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


  onCategoryChange(event: any) {
    this.selectedCategory = event.target.value;

    switch (this.selectedCategory) {
      case 'all':
        this.filteredSensors = this.roomSensors;
        break;
      case 'environmental':
        this.filteredSensors = this.environmentalSensors;
        break;
      case 'motion':
        this.filteredSensors = this.motionSensors;
        break;
      case 'sound':
        this.filteredSensors = this.soundSensors;
        break;
      case 'light':
        this.filteredSensors = this.lightSensors;
        break;
      case 'hvac':
        this.filteredSensors = this.hvacSensors;
        break;
      case 'other':
        this.filteredSensors = this.otherSensors;
        break;
      default:
        this.filteredSensors = [];
        break;
    }

    this.filteredSensors.forEach(sensor => {
      setTimeout(()=> {
        const canvas = document.getElementById(`chartCanvas${sensor.id}`) as HTMLCanvasElement;
        this.createChart(canvas, sensor.data, sensor.label);
      }, 200)
    });
  }
  navigateToSensorDetail(sensor: Sensor): void {
    this.router.navigate(['/sensor-detail', sensor.sensor_id, sensor.room.id, sensor.id])
  }

}
