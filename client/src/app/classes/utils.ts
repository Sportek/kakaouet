import { PlayerClient } from '@common/game-types';
import { Question } from '@common/types';

export const sortQuestionByDate = (questions: Question[]) => {
    return questions.sort((questionA, questionB) => new Date(questionB.lastModification).getTime() - new Date(questionA.lastModification).getTime());
};

export const sortPlayerByName = (players: PlayerClient[]) => {
    return players.sort((playerA, playerB) => playerA.name.localeCompare(playerB.name));
};
