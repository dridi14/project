import { Component, OnInit } from '@angular/core';
import { DataFetchService } from '../data-fetch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-automations-table',
  templateUrl: './automations-table.component.html',
  styleUrls: ['./automations-table.component.css']
})
export class AutomationsTableComponent implements OnInit {
  automations: any = []
  constructor(private apiService: DataFetchService, private router: Router) { }

  ngOnInit(): void {
    this.apiService.getAutomations().subscribe((automations: any[]) => {
      this.automations = automations;
    });
  }

  deleteAutomation(automation: any) {
    this.apiService.deleteAutomation(automation.id).subscribe((response: any) => {
      if (!response) {
        this.automations = this.automations.filter((a: any) => a.id !== automation.id);
      }
    });
  }

  addAutomation() {
    this.router.navigateByUrl('/automation/add');
  }
}
