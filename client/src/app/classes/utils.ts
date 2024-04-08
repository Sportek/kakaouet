import { PlayerClient } from '@common/game-types';
import { Question } from '@common/types';

export const sortQuestionByDate = (questions: Question[]) => {
    return questions.sort((a, b) => new Date(b.lastModification).getTime() - new Date(a.lastModification).getTime());
};

export const sortPlayerByName = (players: PlayerClient[]) => {
    return players.sort((a, b) => a.name.localeCompare(b.name));
};
