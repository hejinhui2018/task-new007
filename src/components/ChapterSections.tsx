import type { Chapter } from '../data/course';
import { course } from '../data/course';

/** 章节正文（讲义内容），章节页与预览模态共用。 */
export default function ChapterSections({ chapter }: { chapter: Chapter }) {
  const chapterIndex = course.chapters.indexOf(chapter);
  return (
    <article className="chapter-content">
      {chapter.sections.map((section, i) => (
        <section key={i}>
          <h2>
            {chapterIndex + 1}.{i + 1} {section.heading}
          </h2>
          {section.paragraphs.map((paragraph, j) => (
            <p key={j}>{paragraph}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
