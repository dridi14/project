import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SensorsComponent } from './sensors/sensors.component';
import { AutomationComponent } from './automation/automation.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticatedGuard } from './auth.guard';
import { SensorDetailComponent } from './sensor-detail-component/sensor-detail-component.component';
import { InstantactionComponent } from './instantaction/instantaction.component';
import { AutomationsTableComponent } from './automations-table/automations-table.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SensorsComponent,
    AutomationComponent,
    LoginComponent,
    SignupComponent,
    SensorDetailComponent,
    InstantactionComponent,
    AutomationsTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    HttpClientModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TimepickerModule.forRoot(),
    MatCheckboxModule,
    NgxMaterialTimepickerModule



  ],
  providers: [AuthenticatedGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
