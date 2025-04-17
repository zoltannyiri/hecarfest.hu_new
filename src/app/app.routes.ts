import { Routes } from '@angular/router';
import { KezdolapComponent } from './components/kezdolap/kezdolap.component';
import { TesztComponent } from './components/teszt/teszt.component';
import { VipRegisztracioComponent } from './components/vip-regisztracio/vip-regisztracio.component';

export const routes: Routes = [
    {'path': 'kezdolap', component: KezdolapComponent},
    {'path': 'teszt', component: TesztComponent},
    {'path': 'vip-regisztracio', component: VipRegisztracioComponent},
];
