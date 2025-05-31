import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  setOneItem(item: any, key: string): void {
    try {
      let items = this.getAllItems(key);

      let maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 0;

      item.id = maxId + 1;

      items.push(item);

      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving in localstorage', error);
    }
  }

  setManyItems(items: any[], key: string): void {
    try {
      this.removeAllItems(key);

      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving in localstorage', error);
    }
  }

  getAllItems(key: string): any[] {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting values from localstorage', error);
      return [];
    }
  }

  removeAllItems(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting item', error);
    }
  }

  updateOneItem(itemToUpdate: any, key: string) {
    try {

      let items = this.getAllItems(key);

      let updateItems = items.map(item => {
        if (item.id === itemToUpdate.id) {
          return { ...item, name: itemToUpdate.name }
        }

        return item;
      });

      this.setManyItems(updateItems, key);

    } catch (error) {
      console.error('Error uypdating in localstorage', error);
    }
  }

  searchByCategoryId(id: number, key: string) {
    try {
      const value = localStorage.getItem(key);

      let tasks = value ? JSON.parse(value) : [];

      return tasks.filter((t: any) => t.categoryId == id);
    } catch (error) {
      console.error('Error getting values from localstorage', error);
      return [];
    }
  }
}
