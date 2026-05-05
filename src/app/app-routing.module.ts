import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { FoodDiaryComponent } from './components/food-diary/food-diary.component';


const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'workout', component: WorkoutListComponent },
  { path: 'food', component: FoodDiaryComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' } // Ridireziona la home alla dashboard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
