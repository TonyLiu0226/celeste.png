export interface Book {
    id: string;
    Title: string;
    UserId: string;
    created_at: Date;
}
export interface NotebookChapter {
  text: string;
  chapter: number;
  title: string;
}

export interface NotebookProps {
   NotebookChapter: NotebookChapter[];
}