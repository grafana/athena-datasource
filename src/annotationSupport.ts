import { defaultQuery } from 'types';
import { AnnotationQueryEditor } from './AnnotationQueryEditor';

export const annotationSupport = {
  QueryEditor: AnnotationQueryEditor,
  getDefaultQuery() {
    return defaultQuery;
  },
};
