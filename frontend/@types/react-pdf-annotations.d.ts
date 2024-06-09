import { Annotation } from './types';

declare module 'react-pdf-annotations' {
  import { ComponentClass, ReactNode } from 'react';

  export interface AnnotationsProps {
    annotations: Annotation[];
    onAnnotationChange: (newAnnotations: Annotation[]) => void;
    renderContent: (props: any) => ReactNode;
    [key: string]: any;
  }

  export const Annotations: ComponentClass<AnnotationsProps>;
}