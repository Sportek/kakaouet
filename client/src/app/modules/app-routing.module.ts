import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGameHistoryComponent } from '@app/pages/admin/admin-game-history/admin-game-history.component';
import { AdminLoginPageComponent } from '@app/pages/admin/admin-login-page/admin-login-page.component';
import { AdminPageComponent } from '@app/pages/admin/admin-page/admin-page.component';
import { AdminQuestionBankComponent } from '@app/pages/admin/admin-question-bank/admin-question-bank.component';
import { CreateUpdateQuestionComponent } from '@app/pages/admin/create/create-update-question/create-update-question.component';
import { CreateUpdateQuizComponent } from '@app/pages/admin/create/create-update-quiz/create-update-quiz.component';
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
    { path: 'admin/game-history', component: AdminGameHistoryComponent },
    { path: 'admin/question-bank', component: AdminQuestionBankComponent },
    { path: 'create', component: CreatePageComponent },
    // Création d'un Quiz
    { path: 'admin/create/quiz', component: CreateUpdateQuizComponent },
    // Modification d'un Quiz
    { path: 'admin/create/quiz/:id', component: CreateUpdateQuizComponent },
    // Création d'une nouvelle question d'un Quiz
    { path: 'admin/create/quiz/:id/question', component: CreateUpdateQuestionComponent },
    // Modification d'une question d'un Quiz
    { path: 'admin/create/quiz/:id/question/:question_id', component: CreateUpdateQuestionComponent },
    { path: 'join', component: JoinPageComponent },
    { path: 'create/description/:gameId', component: DescriptonPageComponent },
    { path: 'testing/:gameId', component: TestingGameComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: false })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
