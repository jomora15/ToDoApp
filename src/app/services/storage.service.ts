import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() { }

  setOneItem(item: any, key: string): void {
    try {
      let items = this.getAllItems(key);

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
          return { ...item, complete: itemToUpdate.complete, name: itemToUpdate.name, description: itemToUpdate.description, categoryId: itemToUpdate.categoryId };
        }

        return item;
      });

      this.setManyItems(updateItems, key);

    } catch (error) {
      console.error('Error updating in localstorage', error);
    }
  }

  searchByCategoryId(id: string, key: string) {
    try {
      const value = localStorage.getItem(key);

      let tasks = value ? JSON.parse(value) : [];

      if (!id || id === '0') {
        return tasks;
      }
      return tasks.filter((t: any) => String(t.categoryId) === id);
    } catch (error) {
      console.error('Error getting values from localstorage', error);
      return [];
    }
  }

  getPaginatedItems(key: string, startIndex: number, limit: number): any[] {
    const allItems = this.getAllItems(key);
    const sortedItems = allItems.sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
    return sortedItems.slice(startIndex, startIndex + limit);
  }

  removeOneItemById(id: number, key: string) {
    try {
      let allItems = this.getAllItems(key);
      allItems = allItems.filter((item: any) => item.id !== id);
      this.setManyItems(allItems, key);
    } catch (error) {
      console.error('Error removing item by ID from localstorage', error);
    }
  }


}
