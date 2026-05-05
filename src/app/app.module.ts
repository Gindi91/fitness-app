import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { FoodDiaryComponent } from './components/food-diary/food-diary.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ExerciseItemComponent } from './components/workout-list/exercise-item/exercise-item.component';
import { ExerciseFormComponent } from './components/workout-list/exercise-form/exercise-form.component';
import { WorkoutTabsComponent } from './components/workout-list/workout-tabs/workout-tabs.component';

@NgModule({ declarations: [
        AppComponent,
        DashboardComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        WorkoutListComponent,
        AppRoutingModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
