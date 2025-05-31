import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tasks',
        loadComponent: () =>
          import('../tasks/tasks.page').then((m) => m.TasksPage),
      },
      {
        path: 'category',
        loadComponent: () =>
          import('../category/category.page').then((m) => m.CategoryPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tasks',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tasks',
    pathMatch: 'full',
  },
];
