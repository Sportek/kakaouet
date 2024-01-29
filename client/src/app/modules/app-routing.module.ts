import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginPageComponent } from '@app/pages/admin/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from '@app/pages/admin/admin-page/admin-page.component';
import { CreatePageComponent } from '@app/pages/create-game/create-page/create-page.component';
import { DescriptonPageComponent } from '@app/pages/create-game/descripton-page/descripton-page.component';
import { TestingGameComponent } from '@app/pages/create-game/testing-game/testing-game.component';
import { JoinPageComponent } from '@app/pages/join-page/join-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'admin/login', component: AdminLoginPageComponent },
    { path: 'create', component: CreatePageComponent },
    { path: 'join', component: JoinPageComponent },
    { path: 'create/description/:gameId', component: DescriptonPageComponent },
    { path: 'testing/:gameId', component: TestingGameComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
