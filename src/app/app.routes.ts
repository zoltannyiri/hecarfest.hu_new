import { Routes } from '@angular/router';
import { KezdolapComponent } from './components/kezdolap/kezdolap.component';
import { TesztComponent } from './components/teszt/teszt.component';
import { VipRegisztracioComponent } from './components/vip-regisztracio/vip-regisztracio.component';
import { AdminRegistrationsComponent } from './components/admin-regisztracio/admin-regisztracio.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {'path': 'kezdolap', component: KezdolapComponent},
    {'path': 'teszt', component: TesztComponent},
    {'path': 'vip-regisztracio', component: VipRegisztracioComponent},
    
    {'path': 'admin/registrations', component: AdminRegistrationsComponent},
    {'path': '**', component: KezdolapComponent}
];
