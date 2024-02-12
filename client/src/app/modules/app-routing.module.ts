import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGameHistoryComponent } from '@app/pages/admin/admin-game-history/admin-game-history.component';
import { AdminLoginPageComponent } from '@app/pages/admin/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from '@app/pages/admin/admin-page/admin-page.component';
import { AdminQuestionBankComponent } from '@app/pages/admin/admin-question-bank/admin-question-bank.component';
import { CreateUpdateQuizComponent } from '@app/pages/admin/create/create-update-quiz/create-update-quiz.component';
import { CreatePageComponent } from '@app/pages/create-game/create-page/create-page.component';
import { DescriptonPageComponent } from '@app/pages/create-game/descripton-page/descripton-page.component';
import { Error404Component } from '@app/pages/error/error404/error404.component';
import { GameVueComponent } from '@app/pages/game/game-vue/game-vue.component';
import { JoinComponent } from '@app/pages/game/join/join.component';
import { WaitingRoomComponent } from '@app/pages/game/waiting-room/waiting-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'admin/login', component: AdminLoginPageComponent },
    { path: 'admin/game-history', component: AdminGameHistoryComponent },
    { path: 'admin/question-bank', component: AdminQuestionBankComponent },
    // Modification d'une question de la banque
    { path: 'admin/question-bank/:id', component: AdminQuestionBankComponent },
    { path: 'create', component: CreatePageComponent },
    // Création d'un Quiz
    { path: 'admin/create/quiz', component: CreateUpdateQuizComponent },
    // Modification d'un Quiz
    { path: 'admin/create/quiz/:id', component: CreateUpdateQuizComponent },

    { path: 'game/:code', component: GameVueComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: 'join', component: JoinComponent },
    { path: 'create/description/:gameId', component: DescriptonPageComponent },

    // Tester un jeu via son id
    { path: 'testing/:id', component: GameVueComponent },

    { path: 'error-404', component: Error404Component },
    { path: '**', redirectTo: '/error-404' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: false })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
