import { Question } from '@common/types';

export const sortQuestionByDate = (questions: Question[]) => {
    return questions.sort((a, b) => new Date(b.lastModification).getTime() - new Date(a.lastModification).getTime());
};
