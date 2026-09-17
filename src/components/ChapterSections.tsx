import type { Chapter } from '../data/course';

/** 章节正文，章节页与模态预览共用。 */
export function ChapterSections({ chapter }: { chapter: Chapter }) {
  return (
    <>
      {chapter.sections.map((section) => (
        <section key={section.heading} className="chapter-section">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ))}
    </>
  );
}
