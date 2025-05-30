import { Injectable } from '@angular/core';
import { Task } from 'src/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  key = "tasksList";

  constructor() { }

  setItems(task: Task): void {
    try {
      let tasks = this.getItems();
      let maxId = Math.max(...tasks.map(task => task.id));

      task.id = maxId + 1;

      tasks.push(task);

      localStorage.setItem(this.key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving in localstorage', error);
    }
  }

  getItems(): any[] {
    try {
      const value = localStorage.getItem(this.key);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting values from localstorage', error);
      return [];
    }
  }

  removeItem(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error('Error deleting item', error);
    }
  }
}
