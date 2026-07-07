export type Locale = 'en' | 'es';

const catalogs = {
  en: {
    appTitle: 'Community Forum',
    feedTab: 'Course Feed',
    savedTab: 'Saved Posts',
    courseSelect: 'Select Course:',
    courseReact: 'Advanced React & Next.js',
    courseSysDesign: 'Scalable Systems Design',
    save: 'Save',
    saved: 'Saved',
    savesCount: (count: number) => {
      if (count === 1) return '1 save';
      return `${count} saves`;
    },
    emptyFeed: 'No posts found in this course yet.',
    emptySavedList: "You haven't saved any posts yet. Bookmark some from the feed!",
    loading: 'Loading discussions...',
    error: 'Failed to load posts. Please check your connection.',
    author: (id: string) => `Posted by ${id}`,
  },
  es: {
    appTitle: 'Foro de la Comunidad',
    feedTab: 'Muro del Curso',
    savedTab: 'Publicaciones Guardadas',
    courseSelect: 'Seleccionar Curso:',
    courseReact: 'React Avanzado y Next.js',
    courseSysDesign: 'Diseño de Sistemas Escalables',
    save: 'Guardar',
    saved: 'Guardado',
    savesCount: (count: number) => {
      if (count === 1) return '1 guardado';
      return `${count} guardados`;
    },
    emptyFeed: 'Aún no hay publicaciones en este curso.',
    emptySavedList: 'No has guardado ninguna publicación aún. ¡Guarda algunas del muro!',
    loading: 'Cargando discusiones...',
    error: 'Error al cargar las publicaciones. Por favor verifica tu conexión.',
    author: (id: string) => `Publicado por ${id}`,
  },
};

export function getI18n(locale: Locale = 'en') {
  return catalogs[locale];
}