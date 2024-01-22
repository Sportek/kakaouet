import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { BackgroundComponent } from './background/background.component';
import { AdminLoginPageComponent } from './pages/admin/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from './pages/admin/admin-page/admin-page.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { JoinPageComponent } from './pages/join-page/join-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        BackgroundComponent,
        CreatePageComponent,
        AdminPageComponent,
        JoinPageComponent,
        AdminLoginPageComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, MatButtonModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
