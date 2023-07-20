import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart, ChartConfiguration, ChartScales } from 'chart.js';
import { DataFetchService } from '../data-fetch.service';

interface Sensor {
  name: string;
  location: string;
  type: string;
  status: boolean;
  data: number[];
  tx_time_ms_epoch: number; // Changed the type to number
}

interface Automation {
  name: string;
  type: string;
  status: boolean;
  activation: string;
}

@Component({
  selector: 'app-sensor-detail-component',
  templateUrl: './sensor-detail-component.component.html',
  styleUrls: ['./sensor-detail-component.component.css']
})
export class SensorDetailComponent implements OnInit, AfterViewInit {
  sensor: Sensor[] | undefined;
  room: any;
  sensorID: any;
  chartData: number[] = [];
  data: number[] = [];
  id: any;
  labels: string[] = [];
  selectedTimeRange: string = 'week';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(private route: ActivatedRoute, private apiservice: DataFetchService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.sensorID = params.get('sensorName');
      this.id = params.get('id');
      this.room = params.get('room');
      this.getSensorData(this.room, this.sensorID, this.id, true);
    });
  }

  ngAfterViewInit() {
    if (this.chartCanvas && this.chartData.length > 0) {
      const chartCanvas = this.chartCanvas.nativeElement;
      this.createChart(chartCanvas);
    }
  }

  createChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    console.log('creating chart', this.data, this.labels);
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: 'Sensor Data',
              data: this.data,
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

  onTimeRangeChange(event: any): void {
    const selectedValue = event.target.value;
    this.selectedTimeRange = selectedValue;

    if (this.sensor) {
      this.getSensorData(this.room, this.sensorID, this.id, true, selectedValue,);
    }
  }

  getSensorData(room: any, sensorID: any, id: any, redoApiCall: boolean, interval?: string, labels?: string[]): void {
    interval = interval ? interval : 'week';
    if (redoApiCall) {
      this.apiservice.getRoomSensorData(room, sensorID, id, interval).subscribe((data) => {
        this.sensor = data;
        if (this.sensor) {
          this.labels = [];
          this.sensor.forEach((sensor: Sensor) => {
            Object.values(sensor.data).forEach((value: any) => {
              this.data.push(value);
            });
            const date = new Date(sensor.tx_time_ms_epoch * 1000); // Convert timestamp to milliseconds
            const day = date.getUTCDate();
            const hour = date.getUTCHours();
            const formattedDate = `${day}, ${hour}:00`;
            this.labels.push(formattedDate);
          });
          this.updateChart();
        }
      });
    }
  }

  updateChart(): void {
    const chartCanvas = this.chartCanvas.nativeElement;
    this.createChart(chartCanvas);
  }

  getTimeRangeInDays(timeRange: string): number {
    switch (timeRange) {
      case 'week':
        return 7;
      case 'day':
        return 1;
      case 'hour':
        return 1 / 24;
      default:
        return 7;
    }
  }

  // The automations array should include the automation data
  automations: Automation[] = [
    { name: 'Automation 1', type: 'Type 1', status: true, activation: '8:00 AM' },
    { name: 'Automation 2', type: 'Type 2', status: false, activation: '12:00 PM' },
    { name: 'Automation 3', type: 'Type 3', status: true, activation: '6:00 PM' },
    // ... your automation data here
  ];

  getAutomationsBySensorName(sensorName: string): Automation[] {
    return this.automations.filter((automation: Automation) => automation.name === sensorName);
  }
}
