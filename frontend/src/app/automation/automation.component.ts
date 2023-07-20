import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataFetchService } from '../data-fetch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-automation',
  templateUrl: './automation.component.html',
  styleUrls: ['./automation.component.css']
})
export class AutomationComponent implements OnInit {
  automationForm: FormGroup;
  rooms: any[];
  sensors: any[];
  commands: any[];
  conditions: any[];

  constructor(private apiService: DataFetchService, private router: Router) {
    this.automationForm = new FormGroup({
      room: new FormControl('', Validators.required),
      sensor: new FormControl('', Validators.required),
      command: new FormControl('', Validators.required),
      condition: new FormControl('', Validators.required)
    });

    this.rooms = [];
    this.sensors = [];
    this.commands = [];
    this.conditions = [];
  }

  ngOnInit() {
    // Fetch initial data for rooms, commands, and conditions
    this.fetchRooms();
    this.fetchCommands();
  }

  fetchRooms() {
    this.apiService.getRooms().subscribe((rooms: string[]) => {
      this.rooms = rooms;
    });
  }

  fetchCommands() {
    this.commands = this.apiService.getCommands();
  }

  onRoomSelectionChange(select: any) {
    const selectedRoom = select.value;

    this.apiService.getRoomSensors(selectedRoom).subscribe((sensors: string[]) => {
      this.sensors = sensors;
    });
  }

  submitForm() {
    if (this.automationForm.valid) {
      const formData = this.automationForm.value;
      this.apiService.createAutomation(formData).subscribe((response: any) => {
        this.router.navigateByUrl('/automation');
      });
    } else {
      console.log(this.automationForm.value);
      console.error('Form is invalid');
    }
  }

  onSensorChange(select: any) {
    const selectedSensor = select.value;

    this.sensors.forEach((sensor: any) => {
      if (sensor.id === selectedSensor) {
        this.conditions = sensor.conditions;
      }
    });

  }
}
