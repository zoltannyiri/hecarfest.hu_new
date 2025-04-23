import { Routes } from '@angular/router';
import { KezdolapComponent } from './components/kezdolap/kezdolap.component';
import { TesztComponent } from './components/teszt/teszt.component';
import { VipRegisztracioComponent } from './components/vip-regisztracio/vip-regisztracio.component';
import { AdminRegistrationsComponent } from './components/admin-regisztracio/admin-regisztracio.component';
import { AuthGuard } from './guards/auth.guard';
import { GyikComponent } from './components/gyik/gyik.component';

export const routes: Routes = [
    {'path': 'kezdolap', component: KezdolapComponent},
    {'path': 'teszt', component: TesztComponent},
    {'path': 'vip-regisztracio', component: VipRegisztracioComponent},
    {'path': 'gyik', component: GyikComponent},
    
    {'path': 'admin/registrations', component: AdminRegistrationsComponent},
    {'path': '**', component: KezdolapComponent}
];
